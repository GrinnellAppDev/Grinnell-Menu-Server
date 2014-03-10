var parseAppId = 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD';
var parseMasterKey = 'yLV2Mk9Eft2yhTHAcHvbTbxc5JRJJIyEPEpOIyCD';

Parse.Cloud.define("create_nutrition_database_trigger", function(request, response) {
	Parse.Cloud.httpRequest({
		url: "https://api.parse.com/1/jobs/create_nutrition_database",
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'X-Parse-Application-Id': parseAppId,
			'X-Parse-Master-Key': parseMasterKey,
		},
		body: {
			"request": request,
			"response": response
		},
		success: function(httpResponse) {
			response.success(httpResponse.text);
		},
		error: function(httpResponse) {
			response.error('Request failed with response code ' + httpResponse.status);
		}
	});
});

Parse.Cloud.job("create_nutrition_database", function(request, response) {
	var query = new Parse.Query("NutritionFile");
	query.first({
		success: function(result) {
			var fileURL = result.get("url");
			Parse.Cloud.httpRequest({
				url: fileURL,
				success: function(fileResponse) {

					//xml = xml.replace('<?xml version="1.0" encoding="UTF-16LE" standalone="no"?>', '');
					var xmlreader = require('cloud/xmlreader.js');

					xmlreader.read(fileResponse.buffer.toString(), function(err, res) {
						if (err) {
							return console.log(err);
						}

						console.log(res.d_itm_recipe_perportion_nutr_analysis.d_itm_recipe_perportion_nutr_analysis_row.srv_name.text());

						// var path = res.d_itm_recipe_perportion_nutr_analysis;
						// path.d_itm_recipe_perportion_nutr_analysis_row.each(function(i, dish) {
						// 	console.log(dish.srv_name.text())
					});


					// USING jQuery
					/*var $ = jQuery = require('cloud/jquery.js');
					var xml = fileResponse.buffer.toString(),
						xmlDoc = $.parseXML(xml),
						$xml = $(xmlDoc),
						$name = $xml.find("ls_srvuofm");
					var xml = fileResponse.buffer.toString();
					var output = $.parseXML(xml);
					console.log($name.text);*/

					response.success("Loaded nutrition file, ready to parse it");
				},
				error: function(error) {
					response.error("Error getting file: " + error.message);
				}
			});
		},
		error: function(error) {
			response.error("Error querying nutrition file info: " + error.message);
		}
	})
});

Parse.Cloud.define("update_menus_trigger", function(request, response) {
	Parse.Cloud.httpRequest({
		url: "https://api.parse.com/1/jobs/update_menus",
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'X-Parse-Application-Id': parseAppId,
			'X-Parse-Master-Key': parseMasterKey,
		},
		body: {
			"request": request,
			"response": response
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
					// We've gotten a menu file and need to clear the stations table
					var query = new Parse.Query("Station");
					query.find({
						success: function(stations) {
							for (var i = 0; i < stations.length; i++) {
								var station = stations[i];
								station.destroy({});
							};

							// Handle the menu file
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
									var identificationNumber = dishRow[12].replace('.00', '');
									var station = dishRow[7].toString().trim();
									var name = dishRow[8].toString().trim();

									var dishQuery = new Parse.Query("Dish");
									dishQuery.equalTo("dishID", identificationNumber);
									dishQuery.first({
										success: function(dish) {
											var ovo = false;
											var gf = false;
											var vegan = false;
											var passover = false;
											var halal = false;
											name = name.toLowerCase();

											// Handle dairy free some time?
											name = name.replace('df', '');

											// ovolacto
											var length1 = name.length;
											name = name.replace("ol*", "");
											name = name.replace("(ol)", "");
											name = name.replace("9ol)", "");
											var length2 = name.length;
											if (length2 != length1) {
												ovo = true;
											}

											// vegan
											name = name.replace("v*", "");
											name = name.replace("(v)", "");
											name = name.replace("9v)", "");
											length1 = name.length;
											if (length2 != length1) {
												vegan = true;
												ovo = true; // If dish is vegan, it's also ovolacto
											}

											// passover
											name = name.replace("p*", "");
											name = name.replace("(p)", "");
											name = name.replace("9p)", "");
											length2 = name.length;
											if (length2 != length1) {
												passover = true;
											}

											// halal
											name = name.replace("h*", "");
											name = name.replace("(h)", "");
											name = name.replace("9h)", "");
											length1 = name.length;
											if (length2 != length1) {
												halal = true;
											}

											// gluten free
											name = name.replace("gf*", "");
											name = name.replace("(gf)", "");
											name = name.replace("9gf)", "");
											length2 = name.length;
											if (length2 != length1) {
												gf = true;
											}

											//This cleans up the dish name a little more
											name = name.replace("*", "");
											name = name.replace("/", "/ ");
											name = name.replace(".", ". ");
											name = name.replace("(", "( ");
											name = name.replace("-", "- ");
											name = name.replace("\"", "\" ");
											name = name.replace("'", "' ");
											name = toTitleCase(name);
											name = name.replace(" W/", " w/");
											name = name.replace(" A ", " a ");
											name = name.replace(" At ", " at ");
											name = name.replace(" On ", " on ");
											name = name.replace(" And ", " and ");
											name = name.replace(" Of ", " of ");
											name = name.replace(" The ", " the ");
											name = name.replace(" For ", " for ");
											name = name.replace(" To ", " to ");
											name = name.replace(" In ", " in ");
											name = name.replace(" With ", " w/");
											name = name.replace("/ ", "/");
											name = name.replace("/ ", "/");
											name = name.replace(". ", ".");
											name = name.replace("( ", "(");
											name = name.replace("- ", "-");
											name = name.replace("\" ", "\"");
											name = name.replace("\"t", "\"T");
											name = name.replace("' ", "'");
											name = name.replace("  ", " ");
											name = name.replace("Bbq", "BBQ");
											name = name.replace("Nyc", "NYC");
											name = name.replace(" Ww ", " WW "); //Whole wheat
											name = name.replace("Cider-glazed", "Cider-Glazed");
											name = name.replace("Ol'E", "Ol'e");
											name = name.replace("(red", "(Red");
											name = name.replace("Frank'S", "Frank's");
											name = name.replace("Scott'S", "Scott's");
											name = name.replace("Devil'S", "Devil's");
											name = name.replace("Shepherd'S", "Shepherd's");
											name = name.replace("Buddha'S", "Buddha's");
											name = name.replace("M & M", "M&M");
											name = name.replace("M&m", "M&M");
											name = name.replace("(Plat Du Jour)", "");
											name = name.replace("(Hoh)", "");
											name = name.replace("(2)", "");
											name = name.trim();
											name.charAt(0).toUpperCase();

											if (!strcmp(name, "Belgian Waffle Bar") || !strcmp(name, "Chicken for Risotto Bar") || !strcmp(name, "Meats for Risotto Bar") || !strcmp(name, "Brioche Bread") || !strcmp(name, "Whipped Topping (32 Oz)") || !strcmp(name, "Pho Bar") || !strcmp(name, "Whipped Topping") || !strcmp(name, "Sukiyaki Bar") || !strcmp(name, "Burrito Bar") || !strcmp(name, "Mac & Cheese Bar") || !strcmp(name, "Burrito Bar (Saute)") || !strcmp(name, "Cilantro Pesto Sauce") || !strcmp(name, "Burrito Bar (8th Avenue Deli)") || !strcmp(name, "Paella Bar") || !strcmp(name, "Potato Skin Bar") || !strcmp(name, "Asian Noodle House") || !strcmp(name, "Baked Potato Bar") || !strcmp(name, "Steel Cut Oatmeal Bar") || !strcmp(name, "Cheese Quesadilla Bar") || !strcmp(name, "Chicken Strips") || !strcmp(name, "Chicken Nuggets") || !strcmp(name, "Beef Burritos") || !strcmp(name, "Homemade Tortilla Chips at the Grill") || !strcmp(name, "Nacho Bar") || !strcmp(name, "Cheddar Cheese & Sour Cream") || !strcmp(name, "Beef Taco Bar") || !strcmp(name, "Cheddar Cheese & Sour Cream listed under Condiments")) {
												if (undefined === dish) {
													var Dish = Parse.Object.extend("Dish");
													var newDish = new Dish();
													newDish.set("Passover", passover);
													newDish.set("Vegan", vegan);
													newDish.set("Ovolacto", ovo);
													newDish.set("Halal", halal);
													newDish.set("GlutenFree", gf);
													newDish.set("Nutrition", null);
													newDish.set("name", name);
													newDish.set("dishID", identificationNumber);
													newDish.set("favoritesCount", 0);
													dishesHashMap[identificationNumber] = newDish;
												} else {
													dish.set("Passover", passover);
													dish.set("Vegan", vegan);
													dish.set("Ovolacto", ovo);
													dish.set("Halal", halal);
													dish.set("GlutenFree", gf);
													dish.set("Nutrition", null);
													dish.set("name", name);
													dishesHashMap[identificationNumber] = dish;
												}
												saveAllDishes(dishesHashMap, --counter, response, output);
											} else {
												var nutritionQuery = new Parse.Query("Nutrition");
												nutritionQuery.equalTo("dishID", identificationNumber);
												nutritionQuery.first({
													success: function(nutrition) {
														if (undefined === dish) {
															var Dish = Parse.Object.extend("Dish");
															var newDish = new Dish();
															newDish.set("Passover", passover);
															newDish.set("Vegan", vegan);
															newDish.set("Ovolacto", ovo);
															newDish.set("Halal", halal);
															newDish.set("GlutenFree", gf);
															newDish.set("Nutrition", nutrition);
															newDish.set("name", name);
															newDish.set("dishID", identificationNumber);
															newDish.set("favoritesCount", 0);
															dishesHashMap[identificationNumber] = newDish;
														} else {
															dish.set("Passover", passover);
															dish.set("Vegan", vegan);
															dish.set("Ovolacto", ovo);
															dish.set("Halal", halal);
															dish.set("GlutenFree", gf);
															dish.set("Nutrition", nutrition);
															dish.set("name", name);
															dishesHashMap[identificationNumber] = dish;
														}
														saveAllDishes(dishesHashMap, --counter, response, output);
													},
													error: function(error) {
														response.error("Error looking for nutrition: " + error.message);
													}
												});
											}
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
							response.error("Error deleting stations: " + error.message);
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

function strcmp(str1, str2) {
	return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
}

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

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

	// TODO - clear out the stations table

	output.forEach(function(dishRow) {
		var location = dishRow[1].toString();
		var meal = dishRow[3].toString().trim();

		// Skip over all the spencer grill items that aren't out takes
		if (0 <= meal.indexOf("OUT TAKES") || 0 <= location.indexOf("MARKETPLACE")) {
			var date = dishRow[21].toString().replace('0:00', '').trim();
			var identificationNumber = dishRow[12].replace('.00', '');
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


Parse.Cloud.beforeSave("NutritionFile", function(request, response) {
	var nutritionFile = request.object;
	var fileURL = request.object.get("url");

	Parse.Cloud.httpRequest({
		url: fileURL,
		success: function(fileResponse) {
			console.log(fileResponse.buffer);
			//			nutritionFile.set("url", newURL);
			response.success();
		},
		error: function(error) {
			response.error("Error getting file: " + error.message);
		}
	});
});