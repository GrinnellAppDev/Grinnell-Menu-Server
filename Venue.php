<?php

include_once "Entree.php";

class Venue
{
  public $name; //string
  public $entrees; //array

  private static $instance;
  
  function __construct($venueName){
	//$venueName = trim($venueName);
    $this->name = $venueName;
    $this->entrees = array();
  }

  public function add($newItem){
    array_push($this->entrees, $newItem);
  }

  public function venueJson(){
	// Check if the venue if gluten free
	if ((strcmp($this->name, "GLUTEN FREE")) == 0)
		$GF = true;
	else $GF = false;
	
	// Build the JSON
    $ret = "\"".$this->name."\" : [";    
    while(($temp = array_pop($this->entrees)) != NULL)
      $ret = $ret.$temp->returnJson($GF).",";
    $ret=trim($ret,",");
    $ret = $ret."]";
    return $ret;
  }
}
?>