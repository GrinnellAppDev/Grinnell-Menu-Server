<?php

/*****************************************************
* Colin Tremblay
* Grinnell College '14
*
* This file creates .json file from the xml of all nutritional information.
*
*****************************************************/

function create_nutrition_json(){
// load input file
$file = "nutrition.xml";
$xml = simplexml_load_file($file) or die ("Unable to load XML file!");

// start building the JSON
$output = "{\n";
// iterate through each menu item
foreach ($xml->xpath('//d_itm_recipe_perportion_nutr_analysis_group1') as $item){
	// add the name of the item
	$tempName = str_replace('"','\\"',$item->srv_name);
	$output = $output."\t\"".$tempName."\": {";
		$dozen = $item->ls_srvuofm;
	$pos = strpos($dozen, "dozen");
	if ($pos === false)
		$output = $output."\n\t\t\"Dozen\":\"false\",";
	else
		$output = $output."\n\t\t\"Dozen\":\"true\",";
	
	
	// iterate to the nutrition for the item itself (not its ingredients) and add this
	foreach ($item->d_itm_nutr_analysis_nup_25_values_x->d_itm_nutr_analysis_nup_25_values_x_row as $element){
		$nutrient = trim($element->ls_element, " ");
		$output = $output."\n\t\t\"$nutrient\":\"$element->ptn1_qty\",";
		}
	// remove trailing coma and finalize the output
	$output = trim($output, ",");
	$output = $output."\n\t},\n";
}
// remove trailing coma and finalize the output
$output = trim($output, ",\n");
$output = $output."\n} ";

return $output;
}

function build_nutrition($name, &$json_a){
//If the nutrition.json has an entry for the given dish
if (isset($json_a[$name]))
//If that dish has a value for Dozen
	if (isset($json_a[$name]["Dozen"])){
		$array = array('KCAL', 'FAT', 'CHO', 'PRO', 'SFA', 'POLY', 'MONO', 'CHOL', 'TDFB', 'VITC', 'B12', 'NA', 'ZN', 'FE', 'FATRN', 'K', 'CA', 'VTAIU', 'B6', 'SUGR');
		for ($i = 0; $i < 20; $i++){
			//Get each nutritional value and crop it to 3 decimals
			$str = $array($i);
			$number = number_format($json_a[$name][$str], 3, '.', '')
			$pos = strpos($json_a[$name]["Dozen"], false);
			if ($pos !== false)
				$number = $number/12;
			//Build the output
			$output = "{";
			$output = $output."\".$str.\":".$number;
			$output = trim($output, "0");
			$output = trim($output, ".").",";
		}
	/*
	$SUGR = $json_a[$name]["SUGR"];
	$SUGR_STR = number_format($SUGR, 3, '.', '');
	
	$output = $output."\"FAT\":".$FAT_STR;
	$output = trim($output, "0");
	$output = trim($output, ".").",";*/

		$output = trim($output, ",")."}";
		return $output;
	}
return null;
}
?>