<?php

$todays_date = new DateTime();
$todays_date->setTime(0,0,0);

//
// Read the dates_array file to determine which dates exist.
//
if( ($dates_handle2 = fopen('dates_array', 'r'))  ==  false ){
  echo('Failed to open dates file.');
}
$keys = unserialize(fread($dates_handle2, 5000));
fclose($dates_handle2);


//
// Find how many days ahead we have menu's for. 
//
$maxLookahead = -1;
for($i = 0; $i<count($keys); $i++){
  $date = explode('-',$keys[$i]);
  $date = new DateTime($date[2].'-'.$date[0].'-'.$date[1]);
  $interval = $todays_date->diff($date, false);
  $diff = intval($interval->format('%r%d')); // Calculates number of days ahead
  if($maxLookahead < $diff)
    $maxLookahead = $diff;
}

// Returns 1 if we have today's date, 8 if we have the entire next week, etc.
echo "{ days: ".$maxLookahead."}";

?>