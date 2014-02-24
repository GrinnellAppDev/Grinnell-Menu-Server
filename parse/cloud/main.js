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
		console.log("Adding object to array")
		array.push(object);
	} else {
		console.log("Not adding object to array")
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

function addStationToMeal(station, meal) {
	var stations = station.get("stations");
	if (undefined === stations) {
		stations = new Array(station);
		meal.set("stations", stations);
	} else {
		safeAddObjectToArray(station, stations);
	}
}

function buildStation(stationObject, station, dish, mealObject, statKey) {
	if (stationObject) { // Station exists in the mealObject
		addDishToStation(dish, stationObject);
		stationsMap[statKey] = stationObject;
	} else if (undefined !== stationsMap[statKey]) { // Station exists in stationsMap only
		addDishToStation(dish, stationsMap[statKey]);
	} else { // Station doesn't exist, create it!
		stationObject = buildStationObject(dish, station);
		addStationToMeal(stationObject, mealObject);
		stationsMap[statKey] = stationObject;
	}
}


function buildMeal(menu, meal, station, dish, mealKey, statKey) {
	var mealObject = menu.get(meal);
	if (mealObject) { // Meal is in parse already
		var stationObject = mealObject.get(station);
		buildStation(stationObject, station, dish, mealObject, statKey);
		mealsMap[mealKey] = mealObject;
	} else if (undefined !== mealsMap[mealKey]) { // Not in parse, but in mealsMap
		var stationObject = mealsMap[mealKey].get(station);
		buildStation(stationObject, station, dish, mealsMap[mealKey], statKey);
	} else { // Not in parse or mealsMap, create it!
		mealObject = buildMealObject(dish, station);
		menu.set(meal, mealObject);
		mealsMap[mealKey] = mealObject;
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

			if (menu) { // Menu is in parse
				buildMeal(menu, meal, station, dish, mealKey, statKey);
				menusMap[menuKey] = menu;
			} else if (undefined !== menusMap[menuKey]) { // Menu is in menusMap
				menu = menusMap[menuKey];
				buildMeal(menu, meal, station, dish, mealKey, statKey);
			} else { // Menu doesn't exist, create it
				var mealObject = buildMealObject(dish, station);
				mealsMap[mealKey] = mealObject;

				menu = new Parse.Object("Menu");
				menu.set("date", date);
				menu.set(meal, mealObject);
				menusMap[menuKey] = menu;
			}

			if (checkLastDish(counter)) {
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
	var Station = Parse.Object.extend("Station");
	var stationObject = new Station();
	addDishToStation(dish, stationObject);
	stationObject.set("name", station);
	return stationObject;
}

function buildMealObject(dish, station) {
	var stationObject = buildStationObject(dish, station);
	var Meal = Parse.Object.extend("Meal");
	var mealObject = new Meal();
	addStationToMeal(stationObject, mealObject);
	return mealObject;
}