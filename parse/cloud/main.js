; // Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
});

Parse.Cloud.job("update_menus", function(request, response) {
	var query = new Parse.Query("MenuFile");
	query.descending("createdAt");
	query.first({
		success: function(result) {
			var file = result.get("file");
			Parse.Cloud.httpRequest({
				url: file.url
			}).then(function(fileResponse) {
				// The file contents are in response.buffer.
				var $ = jQuery = require('cloud/jquery.js');
				require('cloud/jquery.csv.js');
				var output = $.csv.toArrays(fileResponse.buffer.toString());

				// i is 1 to skip over the header row
				for (var i = 1; i < 50; i++) { //output.length; i++) { TODO - uncomment this!!!!
					var location = output[i][1];
					var meal = output[i][3];

					// Skip over all the spencer grill items that aren't out takes
					if (meal.indexOf("OUT TAKES") || location.indexOf("MARKETPLACE")) {
						var date = output[i][21];
						var name = output[i][8];
						var identificationNumber = output[i][12];
						var station = output[i][7];

						var dishQuery = new Parse.Query("Dish");
						dishQuery.get(identificationNumber, {
							success: function(dish) {
								// TODO - Update flags here
								dish = dishes[0];

								dish.save(null, {
									success: function(dish) {
										var meal = output[i][3];
										var date = output[i][21];
										var station = output[i][7];
										buildDatabase(date, meal, station, dish, i, output.length);
									},
									error: function(dish, error) {
										response.error("Error saving dish: " + error.description);
									}
								});
							},
							error: function(error) {
								var meal = output[i][3];
								var date = output[i][21];
								var station = output[i][7];
								var name = output[i][8];
								var identificationNumber = output[i][12];
								dish = new Parse.Object("Dish");
								dish.set("objectId", identificationNumber);
								dish.set("name", name);
								console.log(i);
								dish.save(null, {
									success: function(dish) {
										buildDatabase(date, meal, station, dish, i, output.length);
									},
									error: function(dish, error) {
										response.error("Error saving dish: " + error.description);
									}
								});
							}
						});
					} else {
						checkLastDish(i, output.length);
					}
				}
			});
		},
		error: function(error) {
			response.error("Error getting menu file: " + error.description);
		}
	});
});

function buildDatabase(date, meal, station, dish, i, length) {
	var menuQuery = new Parse.Query("Menu");
	menuQuery.equalTo("date", date);
	menuQuery.first({
		success: function(menu) {
			if (menu) {
				var mealObject = menu.get(meal);
				if (mealObject) {
					var stationObject = mealObject.get(station);
					if (stationObject) {
						var dishes = stationObject.get("dishes");
						safeAddObjectToArray(dish, dishes);
						stationObject.save(null, {
							success: function(stationObject) {
								checkLastDish(i, length);
							},
							error: function(stationObject, error) {
								response.error("Error saving station: " + error.description);
							}
						});
					} else {
						stationObject = buildStationObject(dish, station);
						mealObject.set(station, stationObject);
						mealObject.save(null, {
							success: function(mealObject) {
								checkLastDish(i, length);
							},
							error: function(stationObject, error) {
								response.error("Error saving meal: " + error.description);
							}
						});
					}
				} else {
					mealObject = buildMealObject(dish, station);
					menu.set(meal, mealObject);
					menu.save(null, {
						success: function(menu) {
							checkLastDish(i, length);
						},
						error: function(stationObject, error) {
							response.error("Error saving menu: " + error.description);
						}
					});
				}

			} else {
				var mealObject = buildMealObject(dish, station);

				menu = new Parse.Object("Menu");
				menu.set("date", date);
				menu.set(meal, mealObject);
				menu.save(null, {
					success: function(menu) {
						checkLastDish(i, length);
					},
					error: function(stationObject, error) {
						response.error("Error saving menu: " + error.description);
					}
				});
			}
		},
		error: function(error) {
			response.error("Error looking for menu: " + error.description);
		}
	});
}

function checkLastDish(i, length) {
	// If last dish
	if (i == length - 1) {
		response.success();
	}
}
// Todo - this doesn't work right
function safeAddObjectToArray(object, array) {
	if (-1 == array.indexOf(object)) {
		array.push(object);
	}
}

function buildStationObject(dish, station) {
	var dishes = new Array(dish);

	var stationObject = new Parse.Object("Station");
	stationObject.set("name", station);
	stationObject.set("dishes", dishes);
	stationObject.save(null, {
		success: function(stationObject) {
			return stationObject;
		},
		error: function(stationObject, error) {
			response.error("Error saving station: " + error.description);
		}
	});
}

function buildMealObject(dish, station) {
	var stationObject = buildStationObject(dish, station);

	var mealObject = new Parse.Object("Meal");
	var stations = new Array(stationObject);
	mealObject.set("stations", stations);
	mealObject.save(null, {
		success: function(mealObject) {
			return mealObject;
		},
		error: function(mealObject, error) {
			response.error("Error saving meal: " + error.description);
		}
	});
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