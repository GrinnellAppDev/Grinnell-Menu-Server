Parse.Cloud.define("update_menus_trigger", function(request, response) {
	var parseAppId = 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD';
	Parse.Cloud.httpRequest({
		url: "https://api.parse.com/1/jobs/update_menus",
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Parse-Application-Id': parseAppId,
			'X-Parse-Master-Key': 'yLV2Mk9Eft2yhTHAcHvbTbxc5JRJJIyEPEpOIyCD'
		},
		success: function(httpResponse) {
			response.success(httpResponse.text);
		},
		error: function(httpResponse) {
			response.error('Request failed with response code ' + httpResponse.status);
		}
	});
});

Parse.Cloud.job("update_menus", function(request, response) {
	var query = new Parse.Query("MenuFile");
	query.first({
		success: function(result) {
			var file = result.get("file");
			Parse.Cloud.httpRequest({
				url: file.url,
				success: function(fileResponse) {
					var $ = jQuery = require('cloud/jquery.js');
					require('cloud/jquery.csv.js');
					var output = new Array();
					output = $.csv.toArrays(fileResponse.buffer.toString());
					output.shift(); // Remove headers row

					var dishesHashMap = {};
					var counter = output.length;
					output.forEach(function(dishRow) {
						var location = dishRow[1].toString();
						var meal = dishRow[3].toString().trim();

						// Skip over all the spencer grill items that aren't out takes
						if (0 <= meal.indexOf("OUT TAKES") || 0 <= location.indexOf("MARKETPLACE")) {
							var date = dishRow[21].toString().replace('0:00', '').trim();
							var name = dishRow[8].toString().trim();
							var identificationNumber = dishRow[12];
							var station = dishRow[7].toString().trim();

							var dishQuery = new Parse.Query("Dish");
							dishQuery.equalTo("dishID", identificationNumber);
							dishQuery.first({
								success: function(dish) {
									if (undefined === dish) {
										var Dish = Parse.Object.extend("Dish");
										var newDish = new Dish();
										newDish.set("name", name);
										newDish.set("dishID", identificationNumber);
										dishesHashMap[identificationNumber] = newDish;
									} else {
										// TODO - Update flags here
										dish.set("name", name);
										dishesHashMap[identificationNumber] = dish;
									}
									saveAllDishes(dishesHashMap, --counter, response, output);
								},
								error: function(error) {
									response.error("Error looking for dish: " + error.message);
								}
							});
						} else {
							saveAllDishes(dishesHashMap, --counter, response, output);
						}
					});
				},
				error: function(error) {
					response.error('Request failed with error: ' + error.message)
				}
			});
		},
		error: function(error) {
			response.error("Error getting menu file: " + error.message);
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
			},
			error: function(error) {
				response.error("Error saving dishes: " + error.message);
			}
		});
	}
}

function buildDatabase(output, response) {
	var counter = output.length;
	var stationsMap = {};

	output.forEach(function(dishRow) {
		var location = dishRow[1].toString();
		var meal = dishRow[3].toString().trim();

		// Skip over all the spencer grill items that aren't out takes
		if (0 <= meal.indexOf("OUT TAKES") || 0 <= location.indexOf("MARKETPLACE")) {
			var date = dishRow[21].toString().replace('0:00', '').trim();
			var identificationNumber = dishRow[12];
			var station = dishRow[7].toString().trim();

			var dishQuery = new Parse.Query("Dish");
			dishQuery.equalTo("dishID", identificationNumber);
			dishQuery.first({
				success: function(dish) {
					buildDatabaseHelper(date, meal, station, dish, --counter, response, stationsMap);
				},
				error: function(error) {
					response.error("Error looking for dish: " + error.message);
				}
			});
		} else {
			saveEverything(response, stationsMap, --counter);
		}
	});
}

function checkLastDish(counter) {
	// If last dish
	if (0 >= counter) {
		return true;
	} else {
		return false;
	}
}

// This only works if the exact object exists...
function safeAddObjectToArray(object, array) {
	if (-1 == array.indexOf(object)) {
		array.push(object);
	}
}

function addDishToStation(dish, station) {
	var dishes = station.get("dishes");
	if (undefined === dishes) {
		dishes = new Array(dish);
		station.set("dishes", dishes);
	} else {
		safeAddObjectToArray(dish, dishes);
	}
}

function buildDatabaseHelper(date, meal, station, dish, counter, response, stationsMap) {
	var stationQuery = new Parse.Query("Station");
	stationQuery.equalTo("date", date);
	stationQuery.equalTo("name", station);
	stationQuery.equalTo("meal", meal);
	stationQuery.first({
		success: function(stationObj) {
			var statKey = date + meal + station;

			if (stationObj) { // Station is in parse
				addDishToStation(dish, stationObj);
			} else if (undefined !== stationsMap[statKey]) { // Station is in stationsMap
				stationObj = stationsMap[statKey];
				addDishToStation(dish, stationObj);
			} else { // Station doesn't exist, create it
				stationObj = createStationObject(date, meal, station, dish);
			}
			stationsMap[statKey] = stationObj;

			saveEverything(response, stationsMap, counter);
		},
		error: function(error) {
			response.error("Error looking for station: " + error.message);
		}
	});
}

function saveEverything(response, stationsMap, counter) {
	if (checkLastDish(counter)) {
		var stationsArray = new Array();
		for (var i in stationsMap) {
			stationsArray.push(stationsMap[i]);
		}

		Parse.Object.saveAll(stationsArray, {
			success: function(stationsArray) {
				response.success("Updated Menu");
			},
			error: function(error) {
				response.error("Error saving stations: " + error.message);
			}
		});
	}
}

function createStationObject(date, meal, station, dish) {
	var Station = Parse.Object.extend("Station");
	var stationObject = new Station();
	addDishToStation(dish, stationObject);
	stationObject.set("name", station);
	stationObject.set("meal", meal);
	stationObject.set("date", date);
	return stationObject;
}