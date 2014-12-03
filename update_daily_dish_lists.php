<?php

/*****************************************************
 * Tyler Dewey 
 * Grinnell College '16
 * 
 * This file creates .json files that contain
 * arrays of all dishes available on a given
 * day in the dining hall
 * PROCEDURE
 * 1. Remove old dishes files
 * 2. Retrieve array of available dates
 * 3. For each day, create an array to hold that day's dishes
 * 4. Iterate through each day's meals
 * 5. Iterate through each meal's stations
 * 6. Add the dishes from each station to the array
 * 7. Write that array to a .json file
 ****************************************************/

echo "Removing old dishes files\n";
exec("rm *dishes.json");

// Get available dates
if( ($dates_handle = fopen('dates_array', 'r'))  ==  false ){
  exit("Failed to open dates file.\n");
  return;
}
$dates = unserialize(fread($dates_handle, 50000));
fclose($dates_handle);

print_r($dates);

// Create arrays of dishes for each available date
foreach($dates as $date) {
	$dishes_path = $date . "_dishes.json";
	$menu_path = $date . ".json";

	if (!file_exists($menu_path)) {
		exit("failed to find menu file: $menu_path\n");
	}

	if (!($menu_handle = fopen($menu_path, 'r'))) {
		exit("failed to open menu file: $menu_path\n");
	}

	$menu_json = fread($menu_handle, 50000);

	fclose($menu_handle);

	$menu = json_decode($menu_json);
	$dishes = array();

	foreach($menu as $meal_name => $meal) {
		
		/* Menu object has a non-meal property called
		 * PASSOVER. Passover is a boolean value
		 * This skips over that property */
		if ($meal_name == "PASSOVER") {
			continue;
		}


		foreach($meal as $station_name => $station) {
			$station_name = trim($station_name);
			echo "\t$station_name: ";
			foreach($station as $dish) {
				if (!array_search($dish, $dishes)) {
						$dish_name = $dish->name;
						echo "$dish_name, ";
						$dishes[] = $dish;
				}
			}
			echo "\n";
		}
	}

	if (!($dishes_handle = fopen($dishes_path, 'w'))) {
		exit("failed to open dishes file: $dishes_path\n");
	}
	
	$dishes_json = json_encode($dishes);
	fwrite($dishes_handle, $dishes_json);
	
	fclose($dishes_handle);
}








?>
