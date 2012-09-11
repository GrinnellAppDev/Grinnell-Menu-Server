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
	$itemName = str_replace("Ol*", "", $itemName);
	$itemName = str_replace("ol*", "", $itemName);
    $itemName = str_replace("(OL)", "", $itemName);
    $itemName = str_replace("(Ol)", "", $itemName);
    $itemName = str_replace("(ol)", "", $itemName);
    $itemName = str_replace("9OL)", "", $itemName);
	$itemName = str_replace("9Ol)", "", $itemName);
	$itemName = str_replace("9ol)", "", $itemName);
	$length2 = strlen($itemName);
	if($length1 != $length2)
		$this->ovolacto = "true";
	else $this->ovolacto = "false";
  
	//Vegan
  	$itemName = str_replace("V*", "", $itemName);
   	$itemName = str_replace("v*", "", $itemName);
    $itemName = str_replace("(V)", "", $itemName);
    $itemName = str_replace("(v)", "", $itemName);
    $itemName = str_replace("9V)", "", $itemName);
	$itemName = str_replace("9v)", "", $itemName);
	$length1 = strlen($itemName);
	if($length1 != $length2){
        $this->vegan = "true";
        $this->ovolacto = "true"; // If it is vegan, then it is also ovolacto.
      }
      else $this->vegan = "false";
	
	//Passover
	$itemName = str_replace("P*", "", $itemName);
	$itemName = str_replace("p*", "", $itemName);
    $itemName = str_replace("(P)", "", $itemName);
    $itemName = str_replace("(p)", "", $itemName);
    $itemName = str_replace("9P)", "", $itemName);
	$itemName = str_replace("9p)", "", $itemName);
	$length2 = strlen($itemName);
	if($length1 != $length2)
		$this->passover = "true";
	else $this->passover = "false";

	//Halal
	$itemName = str_replace("H*", "", $itemName);
	$itemName = str_replace("h*", "", $itemName);
    $itemName = str_replace("(H)", "", $itemName);
    $itemName = str_replace("(h)", "", $itemName);
    $itemName = str_replace("9H)", "", $itemName);
    $itemName = str_replace("9h)", "", $itemName);
	$length1 = strlen($itemName);
	if($length1 != $length2)
		$this->halal = "true";
	else $this->halal = "false";	
	
	//Gluten Free
	$itemName = str_replace("GF*", "", $itemName);
	$itemName = str_replace("Gf*", "", $itemName);
	$itemName = str_replace("gf*", "", $itemName);
    $itemName = str_replace("(GF)", "", $itemName);
    $itemName = str_replace("(Gf)", "", $itemName);
    $itemName = str_replace("(gf)", "", $itemName);
    $itemName = str_replace("9GF)", "", $itemName);
    $itemName = str_replace("9Gf)", "", $itemName);
    $itemName = str_replace("9gf)", "", $itemName);
	$length1 = strlen($itemName);
	if($length1 != $length2)
		$this->gluten_free = "true";
	else $this->gluten_free = "false";
	
	//This cleans up the dish name a little more
	$itemName = str_replace(" w/", " w/ ", $itemName);
	$itemName = str_replace("-", "- ", $itemName);
	$itemName = ucwords(strtolower($itemName));
	$itemName = str_replace(" A ", " a ", $itemName);
	$itemName = str_replace(" On ", " on ", $itemName);
	$itemName = str_replace(" And ", " and ", $itemName);	
	$itemName = str_replace(" Of ", " of ", $itemName);
	$itemName = str_replace(" The ", " the ", $itemName);
	$itemName = str_replace(" For ", " for ", $itemName);
	$itemName = str_replace(" To ", " to ", $itemName);
	$itemName = str_replace(" W/ ", " w/", $itemName);
	$itemName = str_replace("- ", "-", $itemName);
	$itemName = str_replace("Bbq", "BBQ", $itemName);
	$itemName = trim($itemName);
	$this->name = $itemName;
	
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