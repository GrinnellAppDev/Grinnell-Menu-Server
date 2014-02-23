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
									buildDatabase(date, meal, station, dish, i, output.length);
								} else {
									dish = new Parse.Object("Dish");
									dish.set("dishID", id);
									dish.set("name", name);
									dish.save(null, {
										success: function(dish) {
											buildDatabase(date, meal, station, dish, i, output.length);
										},
										error: function(dish, error) {
											response.error("Error looking for menu: " + error.description);
										}
									});
								}
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
						dishes.push(dish);
						checkLastDish(i, length);
					} else {
						stationObject = buildStationObject(dish, station);
						mealObject.set(station, stationObject);
						mealObject.save(null, {
							success: function(mealObject) {
								checkLastDish(i, length);
							},
							error: function(mealObject, error) {
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
						error: function(menu, error) {
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
					error: function(menu, error) {
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