<?php

include_once "Entree.php";

class Venue
{
  public $name; //string
  public $entrees; //array

  private static $instance;
  
  function __construct($venueName){
	$tempName = trim($venueName, " ");
    $this->name = $tempName;
    $this->entrees = array();
  }

  public function add($newItem){
    array_push($this->entrees, $newItem);
  }

  public function venueJson(){
    $ret = "\"".$this->name."\" : [\n\t\t\t";    
    while(($temp = array_pop($this->entrees)) != NULL)
      $ret = $ret.$temp->returnJson().",\n\t\t\t";
    $ret=trim($ret,",\n\t\t\t");
    $ret = $ret."\n\t\t]";
    return $ret;
  }

}
?>