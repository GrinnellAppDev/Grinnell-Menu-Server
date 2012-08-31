<?php

include_once "Nutrition.php";

class Entree
{
  private $name;
  private $ovolacto;    //True if the dish is ovolacto, else false
  private $vegan;       //  "   "   "   "   "  vegan       "   "
  private $passover;    //  "   "   "   "   " for passover "   "
  private $halal;       //  "   "   "   "   " for halal    "   "
  private $gluten_free; //  "   "   "   "   " gluten free  "   "
  private $nutrition;   // Nil if there is no nutrtion, else contains array of nutrition values


  /** Construct the item with the string from csv */
  function __construct($itemName, $dishID, &$json_a){
	// Each section below looks for markers that indicate 
	//  whether the dish falls into a particular nutritional realm
	//  by checking the length of itemName, removing any indicators
	//  and rechecking the length to see if it has changed
	
	//Ovolacto
	$length1 = strlen($itemName);
	$itemName = str_replace("OL*", "", $itemName);
    $itemName = str_replace("(OL)", "", $itemName);
	$itemName = str_replace("Ol*", "", $itemName);
    $itemName = str_replace("(Ol)", "", $itemName);
	$itemName = str_replace("ol*", "", $itemName);
    $itemName = str_replace("(ol)", "", $itemName);
	$length2 = strlen($itemName);
	if($length1 != $length2)
		$this->ovolacto = "true";
	else $this->ovolacto = "false";
  
	//Vegan
  	$itemName = str_replace("V*", "", $itemName);
    $itemName = str_replace("(V)", "", $itemName);
  	$itemName = str_replace("v*", "", $itemName);
    $itemName = str_replace("(v)", "", $itemName);
	$length1 = strlen($itemName);
	if($length1 != $length2){
        $this->vegan = "true";
        $this->ovolacto = "true"; // If it is vegan, then it is also ovolacto.
      }
      else $this->vegan = "false";
	
	//Passover
	$itemName = str_replace("P*", "", $itemName);
    $itemName = str_replace("(P)", "", $itemName);
	$itemName = str_replace("p*", "", $itemName);
    $itemName = str_replace("(p)", "", $itemName);
	$length2 = strlen($itemName);
	if($length1 != $length2)
		$this->passover = "true";
	else $this->passover = "false";

	//Halal
	$itemName = str_replace("H*", "", $itemName);
    $itemName = str_replace("(H)", "", $itemName);
	$itemName = str_replace("h*", "", $itemName);
    $itemName = str_replace("(h)", "", $itemName);
	$length1 = strlen($itemName);
	if($length1 != $length2)
		$this->halal = "true";
	else $this->halal = "false";	
	
	//Gluten Free
	$itemName = str_replace("GF*", "", $itemName);
    $itemName = str_replace("(GF)", "", $itemName);
	$itemName = str_replace("Gf*", "", $itemName);
    $itemName = str_replace("(Gf)", "", $itemName);
	$itemName = str_replace("gf*", "", $itemName);
    $itemName = str_replace("(gf)", "", $itemName);
	$length1 = strlen($itemName);
	if($length1 != $length2)
		$this->gluten_free = "true";
	else $this->gluten_free = "false";
	
	//This cleans up the dish name a little more
	$itemName = ucwords(strtolower($itemName));
	$itemName = str_replace("And", "and", $itemName);	
	$itemName = str_replace("Of", "of", $itemName);
	$itemName = str_replace("The", "the", $itemName);
	$itemName = str_replace("For", "for", $itemName);
	$itemName = str_replace("To", "to", $itemName);
	// Changing To -> to also changes Tofu -> tofu, so change that back
	$itemName = str_replace("tofu", "Tofu", $itemName);
	$itemName = trim($itemName);
	$this->name = $itemName;
	/*
    $splitName = split('\*',$itemName); //dish name and fields delimited by *
    if(count($splitName) == 2){
      $this->name = ucwords(strtolower($splitName[1]));
      if(ereg('O',$splitName[0]) > 0)
        $this->ovolacto = "true";
      else $this->ovolacto = "false";
      if(ereg('V',$splitName[0]) > 0){
        $this->vegan = "true";
        $this->ovolacto = "true"; // If it is vegan, then it is also ovolacto.
      }
      else $this->vegan = "false";
      if(ereg('P',$splitName[0]) > 0)
        $this->passover = "true";
      else $this->passover = "false";
      if(ereg('H',$splitName[0]) > 0)
        $this->halal = "true";
        else $this->halal = "false";
    }
    else {
      $this->name = ucwords(strtolower($splitName[0]));
      $this->vegan = "false";
      $this->ovolacto = "false";
      $this->passover = "false";
      $this->halal = "false";
    }*/
	
	// And this checks for and builds the nutrition
	$temp_nutrition = build_nutrition($dishID, &$json_a);
	if ($temp_nutrition == null)
		$this->nutrition = "";
	else
		$this->nutrition = $temp_nutrition;
  }

  public function returnJson($GF){
    $tempName = str_replace('"','\\"',$this->name);
    $ret = "\n{\"name\" : \"".$tempName."\",\n";
    $ret = $ret."\"vegan\" : \"".$this->vegan."\",\n";
    $ret = $ret."\"ovolacto\" : \"".$this->ovolacto."\",\n";
	// If the venue is Gluten Free, the dish should be too
	if ($GF)
		$ret = $ret."\"gluten_free\" : \"true\",\n";
	else
		$ret = $ret."\"gluten_free\" : \"".$this->gluten_free."\",\n";
    $ret = $ret."\"passover\" : \"".$this->passover."\",\n";
	$ret = $ret."\"halal\" : \"".$this->halal."\",\n";
	if ((strcmp($this->nutrition, "")) == 0)
		$ret = $ret."\"nutrition\" : \""."NIL"."\"";
	else
		$ret = $ret."\"nutrition\" : ".$this->nutrition;
    $ret = $ret."}";
    return $ret;
  }
}
?>