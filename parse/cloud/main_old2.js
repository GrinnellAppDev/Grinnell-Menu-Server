; // Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
});

var menusArray, stationsArray, mealsArray, dishesArray;
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

				menusArray = new Array();
				stationsArray = new Array();
				mealsArray = new Array();
				dishesArray = new Array();

				// i is 1 to skip over the header row
				for (var i = 1; i < output.length; i++) {
					var location = output[i][1];
					var meal = output[i][3];

					// Skip over all the spencer grill items that aren't out takes
					if (meal.indexOf("OUT TAKES") || location.indexOf("MARKETPLACE")) {
						var date = output[i][21];
						var name = output[i][8];
						var id = output[i][12];
						var station = output[i][7];

						var dishQuery = new Parse.Query("Dish");
						dishQuery.equalTo("dishID", id);
						dishQuery.first({
							success: function(dish) {
								if (dish) {
									// TODO - Update flags here
								} else {
									dish = new Parse.Object("Dish");
									dish.set("dishID", id);
									dish.set("name", name);
								}
								safeAddObjectToArray(dish, dishesArray);

								buildDatabase(date, meal, station, dish, i, output.length);
							},
							error: function(error) {
								response.error("Error looking for dish: " + error.description);
							}
						});
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
					} else {
						stationObject = buildStationObject(dish, station);
						mealObject.set(station, stationObject);
					}
					safeAddObjectToArray(stationObject, stationsArray);

				} else {
					mealObject = buildMealObject(dish, station);
					menu.set(meal, mealObject);
				}
				safeAddObjectToArray(mealObject, mealsArray);

			} else {
				var mealObject = buildMealObject(dish, station);
				safeAddObjectToArray(mealObject, mealsArray);

				menu = new Parse.Object("Menu");
				menu.set("date", date);
				menu.set(meal, mealObject);
			}
			safeAddObjectToArray(menu, menusArray);
			console.log("checking if we want to save everything");

			if (i >= length) {
				console.log("Trying to call saveEverything");

				saveEverything();
			}
		},
		error: function(error) {
			response.error("Error looking for menu: " + error.description);
		}
	});
}

function saveEverything() {
	console.log("Trying to save everything");
	console.log(dishesArray);
	Parse.Object.saveAll(dishesArray, {
		success: function(dishesArray) {
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
		},
		error: function(dishesArray, error) {
			response.error("Error saving dishes: " + error.description);
		}
	});
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
	return stationObject;
}

function buildMealObject(dish, station) {
	var stationObject = buildStationObject(dish, station);

	var mealObject = new Parse.Object("Meal");
	var stations = new Array(stationObject);
	mealObject.set("stations", stations);
	safeAddObjectToArray(stationObject, stationArray);

	return mealObject;
}