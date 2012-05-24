<?php

include_once "Nutrition.php";

class Entree
{
  private $name;
  private $ovolacto; //True if the dish is ovolacto, else false
  private $vegan; //  "   "    "   "     "  vegan    "     "
  private $passover; // "   "    "   "   for passover  "   "
  private $halal; //  "    "    "     "  for halal   "     "
  private $nutrition;

  /** Construct the item with the string from csv */
  function __construct($itemName){
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
    }
	$temp_nutrition = build_nutrition($itemName);
	if ($temp_nutrition == null)
		$this->nutrition = "";
	else
		$this->nutrition = $temp_nutrition;
  }

  public function returnJson(){
    $tempName = str_replace('"','\\"',$this->name);
	$tempName = trim($tempName, " ");
    $ret = "{\n\t\t\t\t\"name\" : \"".$tempName."\",\n\t\t\t\t";
    $ret = $ret."\"vegan\" : \"".$this->vegan."\",\n\t\t\t\t";
    $ret = $ret."\"ovolacto\" : \"".$this->ovolacto."\",\n\t\t\t\t";
    $ret = $ret."\"passover\" : \"".$this->passover."\",\n\t\t\t\t";
	if ((strcmp($this->nutrition, "")) == 0)
		$ret = $ret."\"nutrition\" : \""."NIL"."\",\n\t\t\t\t";
	else
		$ret = $ret."\"nutrition\" : ".$this->nutrition.",\n\t\t\t\t";
    $ret = $ret."\"halal\" : \"".$this->halal."\"\n\t\t\t";
    $ret = $ret."}";
    return $ret;
  }

}

?>