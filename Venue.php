<?php

include_once "Entree.php";

class Venue
{
  public $name; //string
  public $entrees; //array

  private static $instance;
  
  function __construct($venueName){
    $this->name = $venueName;
    $this->entrees = array();
  }

  public function add($newItem){
    array_push($this->entrees, $newItem);
  }

  public function venueJson(){
    $ret = "\"".$this->name."\" : \n\t[\n\t\t ";    
    while(($temp = array_pop($this->entrees)) != NULL)
      $ret = $ret.$temp->returnJson().",";
    $ret=trim($ret,",");
    $ret = $ret."]";
    return $ret;
  }

}
?>