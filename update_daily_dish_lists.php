<?php

echo "Removing old dishes files\n";
exec("rm *dishes.json");

if( ($dates_handle = fopen('dates_array', 'r'))  ==  false ){
  echo "Failed to open dates file.\n";
  return;
}
$dates = unserialize(fread($dates_handle, 50000));
fclose($dates_handle);

print_r($dates);

/* Create an array of available dishes each day
 * 
 */
foreach($dates as $date) {
	$dishes_path = $date . "_dishes.json";
	$menu_path = $date . ".json";

	

	if (!file_exists($menu_path)) {
		echo "failed to find menu file: $menu_path\n";
		return;
	}

	if (!($menu_handle = fopen($menu_path, 'r'))) {
		echo "failed to open menu file: $menu_path\n";
		return;
	}

	$menu_json = fread($menu_handle, 50000);

	fclose($dates_handle);

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
		echo "failed to open dishes file: $dishes_path\n";
		return;
	}
	
	$dishes_json = json_encode($dishes);
	fwrite($dishes_handle, $dishes_json);
	
	fclose($dishes_handle);
}








?>