<?php

/*****************************************************
* Colin Tremblay
* Grinnell College '14
*
* This file creates .json file from the xml of all nutritional information.
* It also adds the nutrition information to the day json
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
	// add the ID of the item
	$tempName = str_replace('"','\\"',$item->srv_itemuofm_intid);
	$tempName = trim($tempName);
	$output = $output."\t\"".$tempName."\": {";
	
	//Check to make sure nutrition is by a valid serving size (not by the dozen)
	$pos = strpos($item->ls_srvuofm, "Dozen");
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

function build_nutrition($dishID, &$json_a){
$dishID = trim($dishID, ".00");
//If the nutrition.json has an entry for the given dish
if (isset($json_a[$dishID]))
//If that dish has a value for KCAL
	if (isset($json_a[$dishID]["KCAL"])){
		$array = array('KCAL', 'FAT', 'CHO', 'PRO', 'SFA', 'POLY', 'MONO',
			'CHOL', 'TDFB', 'VITC', 'B12', 'NA', 'ZN', 'FE', 'FATRN', 'K',
			'CA', 'VTAIU', 'B6', 'SUGR');
			$output = "{";
		for ($i = 0; $i < 20; $i++){
			//Get each nutritional value and crop it to 3 decimals
			$str = $array[$i];
			$number = $json_a[$dishID][$str];
			$number = number_format($number, 3, '.', '');
			$dozen_str = $json_a[$name]["Dozen"];
			$pos = strpos($dozen_str, "false");
			if ($pos !== false)
				$number = $number/12;
			
			//Build the output
			$output = $output."\"$str\":".$number;
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