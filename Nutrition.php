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
	// Add the ID of the item
	$tempName = str_replace('"','\\"',$item->srv_itemuofm_intid);
	$tempName = trim($tempName);
	$output = $output."\t\"$tempName\": {";

	// Add serving size
	$serving = $item->ls_srvuofm;
	$serving = str_replace('(', '', $serving);
	$serving = str_replace(')', '', $serving);
	$serving = ucwords(strtolower($serving));
	$serving = str_replace('Oz', 'Oz.', $serving);
	$pos = strpos($serving, "Cut");
	if ($pos === true)
		$serving = '1 Piece';
	$pos = strpos($serving, "Slice");
	if ($pos === true)
		$serving = '1 Slice';	
	$output = $output."\n\t\t\"ServSize\":\"".$serving."\",";
	
	//Check to make sure nutrition is by a valid serving size (not by the dozen)
	$pos = strpos($serving, "Dozen");
	if ($pos === false)
		$output = $output."\n\t\t\"Dozen\":\"false\",";
	else
		$output = $output."\n\t\t\"Dozen\":\"true\",";
		
	$output = $output."\n\t\t\"ServSize\":\"".$serving."\",";
	
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
			if ((!strcmp($json_a[$dishID]["KCAL"], "0")) && (!strcmp($json_a[$dishID]["FAT"], "0"))){
				$output = "\"NIL\"";
				return $output;
			}
			else{
				$array = array('KCAL', 'FAT', 'CHO', 'PRO', 'SFA', 'POLY', 'MONO',
					'CHOL', 'TDFB', 'VITC', 'B12', 'NA', 'ZN', 'FE', 'FATRN', 'K',
					'CA', 'VTAIU', 'B6', 'SUGR');
				$output = "{";
				$dozen_str = $json_a[$dishID]["Dozen"];
				$pos = strpos($dozen_str, "true");
				for ($i = 0; $i < 20; $i++){
					//Get each nutritional value and crop it to 3 decimals
					$str = $array[$i];
					$number = $json_a[$dishID][$str];

					if ($pos !== false)
						$number = $number/12;
					$number = number_format($number, 3, '.', '');

				//Build the output
				$output = $output."\"$str\":".$number;
				$output = trim($output, "0");
				$output = trim($output, ".").",";
				}
			}
			if ($pos !== false)
				$servSizeStr = "1 Cookie";
			else
				$servSizeStr = $json_a[$dishID]["ServSize"];
			$output = trim($output, ",")."},";
			$output = $output."\n\"ServSize\":\"$servSizeStr\"";
			return $output;
	}
	return null;
}
?>