<?php

include_once "Venue.php";
include_once "Entree.php";

class Meal{
  
  private $name;
  private $venues;
  
  function __construct($meal){
    $this->name = $meal;
    $this->venues = array();
  }
  
  public function getName(){
    return $this->name;
  }
  
  public function addDish($venueName,$entreeName){
    // If the venue does not already exist, add the venue and the entree.
    $exists = false;
    for($i = 0; !$exists && ($i < count($this->venues)); $i++)
      if(strcmp($this->venues[$i]->name,$venueName) == 0){
        $exists = true;
        $this->venues[$i]->add(new Entree($entreeName));
      }
    if(!$exists){
      $newVen = new Venue($venueName);
      $newVen->add(new Entree($entreeName));
      array_push($this->venues, $newVen);
    }
  }
  
  public function writeAllJson(){
    $ret = "{\n";
    //    print(count($this->venues));
    if(($temp = array_pop($this->venues)) !== NULL)
      $ret = $ret."\t\t".$temp->venueJson();
      while(( $temp = array_pop($this->venues)) !== NULL){
		$ret = $ret.",\n\t\t".$temp->venueJson();
	}
    $ret = $ret."\n\t}";
    return $ret;
  }
}
?>