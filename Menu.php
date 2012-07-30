<?php

// So that we can accept "01" or "1" for January.
function remove_leading_zero($input){
  if($input[0] == '0'){
    $input = substr($input,(-1*strlen($input))+1);
  }
  return $input;
}

include_once "Meal.php";


class Menu{
  private $breakfast;
  private $lunch;
  private $dinner;
  private $outtakes;
  private $spencer;

  function __construct(){
    $this->breakfast = NULL;
    $this->lunch = NULL;
    $this->dinner = NULL;
    $this->outtakes = NULL;
    $this->spencer = NULL;
  }


  

  function addDish($meal, $venueName, $dishName, &$json_a){

    // Check if it has "(Spencer Grill)" or something similar in the dishname.
    $len = strlen($dishName);
    $dishName = preg_replace('/\(.*SG.*\)/i',"",$dishName);
    $dishName = preg_replace('/\(.*spencer.*\)/i',"",$dishName);
    if($len != strlen($dishName)){
      if($this->spencer == NULL){
        $this->spencer = new Meal("spencer");
        $this->spencer->addDish($venueName, $dishName, &$json_a);
      }
      else $this->spencer->addDish($venueName, $dishName, &$json_a);
    }
    else if(substr_count($meal, "BREAKFAST") >= 1){//If it contains breakfast
      if($this->breakfast == NULL){
        $this->breakfast = new Meal("breakfast");
        $this->breakfast->addDish($venueName, $dishName, &$json_a);
      }
      else $this->breakfast->addDish($venueName, $dishName, &$json_a);
    }
    else if(substr_count($meal, "LUNCH") >= 1){
      if($this->lunch == NULL){
        $this->lunch = new Meal($meal);
        $this->lunch->addDish($venueName, $dishName, &$json_a);
      }
      else $this->lunch->addDish($venueName, $dishName, &$json_a);
    }
    else if(substr_count($meal, "DINNER") >= 1){
      if($this->dinner == NULL){
        $this->dinner = new Meal($meal);
        $this->dinner->addDish($venueName, $dishName, &$json_a);
      }
      else $this->dinner->addDish($venueName, $dishName, &$json_a);
    }
    else if(substr_count($meal, 'TAKES') >= 1){
      if($this->outtakes == NULL){
        $this->outtakes = new Meal($meal);
        $this->outtakes->addDish($venueName, $dishName, &$json_a);
      }
      else $this->outtakes->addDish($venueName, $dishName, &$json_a);
    }
    else die("Did not recognize Meal:".$meal);
  }

  function printMeals(){
    $comma = false;
    $ret = "{ ";
    if(is_null($this->breakfast))
      ;
    else {
      $ret = $ret."\"BREAKFAST\" : ";
      $ret = $ret.$this->breakfast->writeAllJson();
      $comma = true;
    }
    if(is_null($this->lunch))
      null;
    else {
      if($comma)
        $ret = $ret.",";
      $comma = true;
      $ret = $ret."\"LUNCH\" : ";
      $ret = $ret.$this->lunch->writeAllJson();
    }
    if(is_null($this->dinner))
      null;
    else {
      if($comma)
        $ret = $ret.",";
      $comma = true;
      $ret = $ret."\"DINNER\" : ";
      $ret = $ret.$this->dinner->writeAllJson();
    }
    if(is_null($this->outtakes))
      null;
    else {
      if($comma)
        $ret = $ret.",";
      $ret = $ret."\"OUTTAKES\" : ";
      $comma = true;
      $ret = $ret.$this->outtakes->writeAllJson();
    }
    if(is_null($this->spencer))
      null;
    else {
      if($comma)
        $ret = $ret.",";
      $ret = $ret."\"SPENCER\" : ";
      $comma = true;
      $ret = $ret.$this->spencer->writeAllJson();
    }
    $ret = $ret."} ";
    return $ret;
  }

}

?>
