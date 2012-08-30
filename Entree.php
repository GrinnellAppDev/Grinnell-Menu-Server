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
  function __construct($itemName, $dishID, &$json_a){
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
	$temp_nutrition = build_nutrition($dishID, &$json_a);
	if ($temp_nutrition == null)
		$this->nutrition = "";
	else
		$this->nutrition = $temp_nutrition;
  }

  public function returnJson(){
    $tempName = str_replace('"','\\"',$this->name);
    $ret = "{ \"name\" : \"".$tempName."\",\n";
    $ret = $ret."\"vegan\" : \"".$this->vegan."\",\n";
    $ret = $ret."\"ovolacto\" : \"".$this->ovolacto."\",\n";
    $ret = $ret."\"passover\" : \"".$this->passover."\",\n";
	if ((strcmp($this->nutrition, "")) == 0)
		$ret = $ret."\"nutrition\" : \""."NIL"."\",\n";
	else
		$ret = $ret."\"nutrition\" : ".$this->nutrition.",\n";
    $ret = $ret."\"halal\" : \"".$this->halal."\"\n";
    $ret = $ret."}";
    return $ret;

  }

}

?>