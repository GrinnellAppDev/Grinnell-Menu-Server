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

function build_nutrition($name){
$string = file_get_contents("nutrition.json");
$json_a = json_decode($string, true);
if (isset($json_a[$name]))
	if (isset($json_a[$name]["KCAL"])){
	$output = "{";
	$output = $output."\"KCAL\":".$json_a[$name]["KCAL"].",";
	$output = $output."\"FAT\":".$json_a[$name]["FAT"].",";
	$output = $output."\"CHO\":".$json_a[$name]["CHO"].",";
	$output = $output."\"PRO\":".$json_a[$name]["PRO"].",";
	$output = $output."\"SFA\":".$json_a[$name]["SFA"].",";
	$output = $output."\"POLY\":".$json_a[$name]["POLY"].",";
	$output = $output."\"MONO\":".$json_a[$name]["MONO"].",";
	$output = $output."\"CHOL\":".$json_a[$name]["CHOL"].",";
	$output = $output."\"TDFB\":".$json_a[$name]["TDFB"].",";
	$output = $output."\"VITC\":".$json_a[$name]["VITC"].",";
	$output = $output."\"B12\":".$json_a[$name]["B12"].",";
	$output = $output."\"NA\":".$json_a[$name]["NA"].",";
	$output = $output."\"ZN\":".$json_a[$name]["ZN"].",";
	$output = $output."\"FE\":".$json_a[$name]["FE"].",";
	$output = $output."\"FATRN\":".$json_a[$name]["FATRN"].",";
	$output = $output."\"K\":".$json_a[$name]["K"].",";
	$output = $output."\"CA\":".$json_a[$name]["CA"].",";
	$output = $output."\"VTAIU\":".$json_a[$name]["VTAIU"].",";
	$output = $output."\"B6\":".$json_a[$name]["B6"].",";
	$output = $output."\"SUGR\":".$json_a[$name]["SUGR"]."}";
	return $output;
	}
return null;
}
?>