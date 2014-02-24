; // Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
});

Parse.Cloud.job("update_menus", function(request, response) {
	var query = new Parse.Query("MenuFile");
	query.first({
		success: function(result) {
			var file = result.get("file");
			console.log(file);
			Parse.Cloud.httpRequest({
				url: file.url,
				success: function(fileResponse) {
					var $ = jQuery = require('cloud/jquery.js');
					require('cloud/jquery.csv.js');
					var output = new Array();
					output = $.csv.toArrays(fileResponse.buffer.toString());
					console.log(output.length);

					var dishesHashMap = {};
					output.shift(); // Remove headers row
					//output.splice(200, 1200); // remove a lot of data so we can actually test in reasonable time
					var counter = output.length;
					output.forEach(function(dishRow) {
						var location = dishRow[1].toString();
						var meal = dishRow[3].toString();

						// Skip over all the spencer grill items that aren't out takes
						if (0 <= meal.indexOf("OUT TAKES") || 0 <= location.indexOf("MARKETPLACE")) {
							var date = dishRow[21];
							var name = dishRow[8].toString();
							var identificationNumber = dishRow[12];
							var station = dishRow[7].toString();

							var dishQuery = new Parse.Query("Dish");
							dishQuery.equalTo("dishID", identificationNumber);
							dishQuery.first({
								success: function(dish) {
									if (undefined === dish) {
										var Dish = Parse.Object.extend("Dish");
										var newDish = new Dish();
										newDish.set("name", name);
										newDish.set("dishID", identificationNumber);
										//buildDatabase(date, meal, station, newDish, counter, response);
									} else {
										// TODO - Update flags here
										//   if we do this, we need to re-save it
										//buildDatabase(date, meal, station, dish, counter, response);
									}
									dishesHashMap[identificationNumber] = newDish;
									saveAllDishes(dishesHashMap, --counter, response, output);
								},
								error: function(dish, error) {
									response.error("Error looking for dish: " + error.description);
								}
							});
						} else {
							saveAllDishes(dishesHashMap, --counter, response, output);
						}
					});
				},
				error: function(error) {
					response('Request failed with response code ' + error.status)
				}
			});
		},
		error: function(error) {
			response.error("Error getting menu file: " + error.description);
		}
	});
});


function saveAllDishes(dishesHashMap, counter, response, output) {
	if (checkLastDish(counter)) {
		var dishesArray = new Array();

		for (var i in dishesHashMap) {
			dishesArray.push(dishesHashMap[i]);
		}

		Parse.Object.saveAll(dishesArray, {
			success: function(dishesArray) {
				buildDatabase(output, response);
				//response.success();
			},
			error: function(dishesArray, error) {
				response.error("Error saving dishes: " + error.description);
			}
		});
	}
}
var stationsMap, mealsMap, menusMap;

function buildDatabase(output, response) {
	var counter = output.length;

	mealsMap = {};
	menusMap = {};
	stationsMap = {};

	output.forEach(function(dishRow) {
		var location = dishRow[1].toString();
		var meal = dishRow[3].toString();

		// Skip over all the spencer grill items that aren't out takes
		if (0 <= meal.indexOf("OUT TAKES") || 0 <= location.indexOf("MARKETPLACE")) {
			var date = dishRow[21];
			var identificationNumber = dishRow[12];
			var station = dishRow[7].toString();

			var dishQuery = new Parse.Query("Dish");
			dishQuery.equalTo("dishID", identificationNumber);
			dishQuery.first({
				success: function(dish) {

					buildDatabaseHelper(date, meal, station, dish, --counter, response);
				},
				error: function(dish, error) {
					response.error("Error looking for dish: " + error.description);
				}
			});
		} else {
			if (checkLastDish(--counter)) {
				console.log("Trying to call saveEverything");
				saveEverything(response);
			}
		}
	});

}
/*
function buildDatabase_old(date, meal, station, dish, counter, response) {
	var menuQuery = new Parse.Query("Menu");
	menuQuery.equalTo("date", date);
	menuQuery.first({
		success: function(menu) {
			if (undefined !== menu) {
				var mealObject = menu.get(meal);
				if (mealObject) {
					var stationObject = mealObject.get(station);
					if (stationObject) {
						var dishes = stationObject.get("dishes");
						safeAddObjectToArray(dish, dishes);
						stationObject.save(null, {
							success: function(stationObject) {
								checkLastDish(counter);
							},
							error: function(error) {
								response.error("Error saving station: " + error.description);
							}
						});
					} else {
						var newStationObject = buildStationObject(dish, station);
						mealObject.set(station, newStationObject);
						mealObject.save(null, {
							success: function(mealObject) {
								checkLastDish(counter);
							},
							error: function(mealObject, error) {
								response.error("Error saving meal: " + error.description);
							}
						});
					}
				} else {
					var newmealObject = buildMealObject(dish, station);

					menu.set(meal, newMealObject);
					menu.save(null, {
						success: function(menu) {
							checkLastDish(counter);
						},
						error: function(menu, error) {
							response.error('Failed to create new menu, with error code: ' + error.description);
						}
					});
				}

			} else {
				var mealObject = buildMealObject(dish, station);
				var Menu = Parse.Object.extend("Menu");
				var newMenu = new Menu();

				newMenu.set("date", date);
				newMenu.set(meal, mealObject);
				newMenu.save(null, {
					success: function(newMenu) {
						checkLastDish(counter);
					},
					error: function(error) {
						response.error('Failed to save create menu, with error code: ' + error.description);
					}
				});
			}
		},
		error: function(error) {
			response.error("Error looking for menu: " + error.description);
		}
	});
}*/

function checkLastDish(counter) {
	// If last dish
	if (0 >= counter) {
		return true;
	} else {
		return false;
	}
}
// Todo - this doesn't work right
function safeAddObjectToArray(object, array) {
	if (-1 == array.indexOf(object)) {
		array.push(object);
	}
}

function buildDatabaseHelper(date, meal, station, dish, counter, response) {
	var menuQuery = new Parse.Query("Menu");
	menuQuery.equalTo("date", date);
	menuQuery.first({
		success: function(menu) {
			var mealKey = date + meal;
			var statKey = date + meal + station;
			var menuKey = date;
			console.log("Date: " + date + " Meal: " + meal + " Station: " + station);
			console.log("mealKey: " + mealKey + " statKey: " + statKey + " menuKey: " + menuKey);

			if (menu) {
				var mealObject = menu.get(meal);
				if (mealObject) {
					var stationObject = mealObject.get(station);
					if (stationObject) {
						var dishes = stationObject.get("dishes");
						safeAddObjectToArray(dish, dishes);
						stationsMap[statKey] = stationObject;
					} else if (undefined !== stationsMap[statKey]) {
						var dishes = stationsMap[statKey].get("dishes");
						safeAddObjectToArray(dish, dishes);
					} else {
						stationObject = buildStationObject(dish, station);
						var stations = new Array(stationObject);
						mealObject.set("stations", stations);
						stationsMap[statKey] = stationObject;
					}
					mealsMap[mealKey] = mealObject;
				} else if (undefined !== mealsMap[mealKey]) {
					var stationObject = mealsMap[mealKey].get(station);
					var statKey = date + meal + station;
					if (stationObject) {
						var dishes = stationObject.get("dishes");
						safeAddObjectToArray(dish, dishes);
						stationsMap[statKey] = stationObject;
					} else if (undefined !== stationsMap[statKey]) {
						var dishes = stationsMap[statKey].get("dishes");
						safeAddObjectToArray(dish, dishes);
					} else {
						stationObject = buildStationObject(dish, station);
						mealsMap[mealKey].set(station, stationObject);
						stationsMap[statKey] = stationObject;
					}
				} else {
					mealObject = buildMealObject(dish, station);
					menu.set(meal, mealObject);
					mealsMap[mealKey] = mealObject;
				}
				menusMap[menuKey] = menu;
			} else if (undefined !== menusMap[menuKey]) {
				menu = menusMap[menuKey];
				var mealObject = menu.get(meal);
				if (mealObject) {
					var stationObject = mealObject.get(station);
					if (stationObject) {
						var dishes = stationObject.get("dishes");
						safeAddObjectToArray(dish, dishes);
						stationsMap[statKey] = stationObject;
					} else if (undefined !== stationsMap[statKey]) {
						var dishes = stationsMap[statKey].get("dishes");
						safeAddObjectToArray(dish, dishes);
					} else {
						stationObject = buildStationObject(dish, station);
						mealObject.set(station, stationObject);
						stationsMap[statKey] = stationObject;
					}
					mealsMap[mealKey] = mealObject;
				} else if (undefined !== mealsMap[mealKey]) {
					var stationObject = mealsMap[mealKey].get(station);
					var statKey = date + meal + station;
					if (stationObject) {
						var dishes = stationObject.get("dishes");
						safeAddObjectToArray(dish, dishes);
						stationsMap[statKey] = stationObject;
					} else if (undefined !== stationsMap[statKey]) {
						var dishes = stationsMap[statKey].get("dishes");
						safeAddObjectToArray(dish, dishes);
					} else {
						stationObject = buildStationObject(dish, station);
						mealsMap[mealKey].set(station, stationObject);
						stationsMap[statKey] = stationObject;
					}
				} else {
					mealObject = buildMealObject(dish, station);
					menu.set(meal, mealObject);
					mealsMap[mealKey] = mealObject;
				}
			} else {
				var mealObject = buildMealObject(dish, station);
				mealsMap[mealKey] = mealObject;

				menu = new Parse.Object("Menu");
				menu.set("date", date);
				menu.set(meal, mealObject);
				menusMap[menuKey] = menu;
			}

			if (checkLastDish(counter)) {
				console.log("Trying to call saveEverything");
				saveEverything(response);
			}
		},
		error: function(error) {
			response.error("Error looking for menu: " + error.description);
		}
	});
}

function saveEverything(response) {
	console.log("Trying to save everything");
	var menusArray = new Array();
	for (var i in menusMap) {
		menusArray.push(menusMap[i]);
	}
	var stationsArray = new Array();
	for (var i in stationsMap) {
		stationsArray.push(stationsMap[i]);
	}
	var mealsArray = new Array();
	for (var i in mealsMap) {
		mealsArray.push(mealsMap[i]);
	}

	Parse.Object.saveAll(stationsArray, {
		success: function(stationsArray) {
			Parse.Object.saveAll(mealsArray, {
				success: function(mealsArray) {
					Parse.Object.saveAll(menusArray, {
						success: function(menusArray) {
							response.success("menus updated");
						},
						error: function(menusArray, error) {
							response.error("Error saving menus: " + error.description);
						}
					});
				},
				error: function(mealsArray, error) {
					response.error("Error saving meals: " + error.description);
				}
			});
		},
		error: function(stationsArray, error) {
			response.error("Error saving stations: " + error.description);
		}
	});
}


function buildStationObject(dish, station) {
	var dishes = new Array(dish);
	var Station = Parse.Object.extend("Station");
	var stationObject = new Station();
	stationObject.set("name", station);
	stationObject.set("dishes", dishes);
	/*stationObject.save(null, {
		success: function(stationObject) {
			return stationObject;
		},
		error: function(error) {
			response.error("Error saving station: " + error.description);
		}
	});*/
	return stationObject;
}

function buildMealObject(dish, station) {
	var stationObject = buildStationObject(dish, station);
	var Meal = Parse.Object.extend("Meal");
	var mealObject = new Meal();
	var stations = new Array(stationObject);
	mealObject.set("stations", stations);
	/*mealObject.save(null, {
		success: function(mealObject) {
			return mealObject;
		},
		error: function(error) {
			response.error("Error saving meal: " + error.description);
		}
	});*/
	return mealObject;
}
/*
				var lazy = require("lazy"),
					fs = require("fs");

				new lazy(fs.createReadStream(fileResponse.buffer))
					.lines
					.forEach(function(line) {
						console.log(line.toString());
					});*/

/*
function toObjects(csv, options, callback) {
	var options = (options !== undefined ? options : {});
	var config = {};
	var defaults: {
		separator: ',',
		delimiter: '"',
		headers: true
	},
		config.callback = ((callback !== undefined && typeof(callback) === 'function') ? callback : false);
	config.separator = 'separator' in options ? options.separator : defaults.separator;
	config.delimiter = 'delimiter' in options ? options.delimiter : defaults.delimiter;
	config.headers = 'headers' in options ? options.headers : defaults.headers;
	options.start = 'start' in options ? options.start : 1;

	// account for headers
	if (config.headers) {
		options.start++;
	}
	if (options.end && config.headers) {
		options.end++;
	}

	// setup
	var lines = [];
	var data = [];

	var options = {
		delimiter: config.delimiter,
		separator: config.separator,
		onParseEntry: options.onParseEntry,
		onParseValue: options.onParseValue,
		start: options.start,
		end: options.end,
		state: {
			rowNum: 1,
			colNum: 1
		},
		match: false
	};

	// fetch the headers
	var headerOptions = {
		delimiter: config.delimiter,
		separator: config.separator,
		start: 1,
		end: 1,
		state: {
			rowNum: 1,
			colNum: 1
		}
	}
	var headerLine = $.csv.parsers.splitLines(csv, headerOptions);
	var headers = $.csv.toArray(headerLine[0], options);

	// fetch the data
	var lines = $.csv.parsers.splitLines(csv, options);

	// reset the state for re-use
	options.state.colNum = 1;
	if (headers) {
		options.state.rowNum = 2;
	} else {
		options.state.rowNum = 1;
	}

	// convert data to objects
	for (var i = 0, len = lines.length; i < len; i++) {
		var entry = $.csv.toArray(lines[i], options);
		var object = {};
		for (var j in headers) {
			object[headers[j]] = entry[j];
		}
		data.push(object);

		// update row state
		options.state.rowNum++;
	}

	// push the value to a callback if one is defined
	if (!config.callback) {
		return data;
	} else {
		config.callback('', data);
	}
}

// The following code is from stack overflow:
//  http://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript
// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
	var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
	var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
	// Return NULL if input string is not well formed CSV string.
	if (!re_valid.test(text)) return null;
	var a = []; // Initialize array to receive values.
	text.replace(re_value, // "Walk" the string using replace with callback.
		function(m0, m1, m2, m3) {
			// Remove backslash from \' in single quoted values.
			if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
			// Remove backslash from \" in double quoted values.
			else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
			else if (m3 !== undefined) a.push(m3);
			return ''; // Return empty string.
		});
	// Handle special case of empty last value.
	if (/,\s*$/.test(text)) a.push('');
	return a;
};*/