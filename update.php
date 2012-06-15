<?php

/*****************************************************
* Dugan Knoll
* Grinnell College '12
* Colin Tremblay
* Grinnell College '14
*
* This file creates .json files for the most recent dining hall meals.
* PROCEDURE
* 1. Remove old .json files
* 2. Pull nutrition.xml from server
* 3. Change the xml into a useful json
* 4. Pull menu.csv from server
* 5. Read the csv information from a file and create the menu objects.
* 6. Saves the menu files.
* 7. Updates the available-days file.
*
*****************************************************/

ini_set('display_errors', 'On');
ini_set('memory_limit', '-1');
set_time_limit(3600);
include_once "Menu.php";
include_once "Nutrition.php";

if( ($dates_handle2 = fopen('dates_array', 'r')) == false ){
  echo('Failed to open dates file.');
}
else{
  /****************************************************************************
* Check each of the old menus and only remove them if their date has passed.
*/
  $old_dates = unserialize(fread($dates_handle2, 5000));

  $is_old_dates = false;
  for($i = 0; $i<count($old_dates); ){
    
    $todays_date = new DateTime();
    $todays_date->setTime(0,0,0);
    
    $date = explode('-',$old_dates[$i]);
    $date = new DateTime($date[2].'-'.$date[0].'-'.$date[1]);
    $interval = $todays_date->diff($date, false);
    $diff = intval($interval->format('%r%d')); // Calculates number of days ahead
    if($diff < 0){
      if(!$is_old_dates){
        echo("Deleting old menus:</br>");
        $is_old_dates = true;
      }
      echo $old_dates[$i].".json ";
      unlink($old_dates[$i].'.json');
      array_splice($old_dates, $i,1);
    }
    else $i++;
  }
}

echo '</br>';

/****************************************************************************
 * Check the server for a new nutrition.xml file.
 */

//if URI Exists
//TEMPORARY FIX!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
$return_val = 1;
//exec('wget -r http://wm.grinnell.edu/calendar/menu/nutrition.xml -O ./Nutrition.xml', $out, $return_val);
//save new file
if($return_val == 0) {
	echo("</br>Pulled nutrition.xml from server.</br>");
	exec('chmod 755 ./nutrition.xml');
}
else
	echo('Failed to pull nutrition file.');


/****************************************************************************
 * Load the most recent nutrition file. Create json.
 */

// setup output file
$outfile = "nutrition.json";
if( ($out_handle = fopen($outfile, 'w')) == false ){
	echo('Failed to create nutrition file.');
}
$output = create_nutrition_json();

// write the file
fwrite($out_handle, $output);
echo("</br>Wrote nutrition JSON.</br>");
exec('chmod 755 ./nutrition.json');
fclose($out_handle);

/****************************************************************************
 * Check the server for a new menu.csv file.
 */

//if URI Exists
//TEMPORARY FIX!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
$return_val = 1;
//exec('wget -r http://wm.grinnell.edu/calendar/menu/menus.csv -O ./menu.csv', $out, $return_val);
//save new file
if($return_val == 0) echo("</br>Pulled menus.csv from server.</br>");
else {
//TEMPORARY FIX!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//exec('wget -r http://wm.grinnell.edu/calendar/menu/menu.csv -O ./menu.csv', $out, $return_val);
//save new file
if ($return_val == 0){
echo("</br>Pulled menu.csv from server.</br>");
exec('chmod 755 ./menu.csv');
}
//else die("</br>Couldn't find new menu file on server.</br>");
}


/****************************************************************************
 * Load the most recent CSV file.
 */
$menu_file = fopen("menu.csv", "r") or die("Couldn't read menu file!");
$menus = array();
$todaysMeals = new Menu;
echo("</br>Loaded menu.csv...</br></br>");

$count = 0;

/****************************************************************************
 * Check each menu item from the csv and add it to the appropriate day's menu.
 */
 //MY VERSION OF PHP MADE ME TAKE OUT THE backslash (but that should be the default anyway)
 //while(($menu_item_arr = fgetcsv($menu_file,0,',','"','\\')) !== FALSE
while(($menu_item_arr = fgetcsv($menu_file,0,',','"')) !== FALSE
      && (count($menu_item_arr) >2))
{  str_replace("\0","",$menu_item_arr);
  //$menu_item_arr = str_getcsv($menu_item_csv,',','"','\\');
  
  //  echo $menu_item_arr[1];
  //  echo "</br></br>";

  // Check the Date.
  $date = str_replace("\0","",$menu_item_arr[21]);
  $date = explode('/', $date);

  // If the date cannot be read, forget the item.
  if(count($date) == 3){
    $date[2] = substr($date[2],0,4);
    $curr_date = remove_leading_zero($date[0]).
      '-'.remove_leading_zero($date[1]).
      '-'.remove_leading_zero($date[2]); // Ex. 2-28-2012
    if(array_key_exists($curr_date, $menus)){
            $menus[$curr_date]->addDish(str_replace("\0","",$menu_item_arr[3]),
                          str_replace("\0","",$menu_item_arr[7]),
                          str_replace("\0","",$menu_item_arr[8]));
    }
    else{
      $menus[$curr_date] = new Menu;
      $menus[$curr_date]->addDish(str_replace("\0","",$menu_item_arr[3]),
                          str_replace("\0","",$menu_item_arr[7]),
                          str_replace("\0","",$menu_item_arr[8]));
    }
  }
  else {
    echo('Failed to read menu item in row '.$count.'.</br>');
  }
  $count++;
}

echo "</br>";

$keys = array_keys($menus);

/****************************************************************************
 * Output jsons and save each new day's menu.
 */

$written = false; // We print 'Menu created for:' only one time.
for($i=0; $i<count($keys); $i++){
  $outfile = $keys[$i].'.json'; // e.g. 1-30-2012.json
  if( ($out_handle = fopen($outfile, 'w'))  ==  false ){
    echo('Failed to create menu file.');
  }
  $output = $menus[$keys[$i]]->printMeals();
  fwrite($out_handle, $output);
  fclose($out_handle);
  //  unlink($outfile);

  //Sanity check to make sure we have saved actual text.
  if(strlen($output)>0){
    if($written == false){
      echo('Menu created for:</br>');
      $written = true;
    }
    echo $keys[$i]."  ";
  }
}

echo "</br>";

// Add any future dates whose menus we do not yet want to delete.
for($i=0; $i< count($old_dates); $i++){
  if(!array_key_exists($old_dates[$i],$menus)){
    array_unshift($keys, $old_dates[$i]);
    echo("Kept the menu for ".$old_dates[$i].".</br>");
  }
}


/****************************************************************************
 * Save the dates that we have .json files for for future removal.
 */

$dates_info = serialize($keys);
if( ($dates_handle = fopen('dates_array', 'w'))  ==  false ){
  echo('Failed to create dates file. Please report this to the Grinnell app-dev team.');
}
fwrite($dates_handle, $dates_info);
fclose($dates_handle);

?>
