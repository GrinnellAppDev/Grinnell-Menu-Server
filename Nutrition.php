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

function build_nutrition($name, &$json_a){
//If the nutrition.json has an entry for the given dish
if (isset($json_a[$name]))
//If that dish has a value for KCAL
	if (isset($json_a[$name]["KCAL"])){
	//Get each nutritional value and crop it to 3 decimals
	$KCAL = $json_a[$name]["KCAL"];
	$KCAL_STR = number_format($KCAL, 3);
	$FAT = $json_a[$name]["FAT"];
	$FAT_STR = number_format($FAT, 3);
	$CHO = $json_a[$name]["CHO"];
	$CHO_STR = number_format($CHO, 3);
	$PRO = $json_a[$name]["PRO"];
	$PRO_STR = number_format($PRO, 3);
	$SFA = $json_a[$name]["SFA"];
	$SFA_STR = number_format($SFA, 3);
	$POLY = $json_a[$name]["POLY"];
	$POLY_STR = number_format($POLY, 3);
	$MONO = $json_a[$name]["MONO"];
	$MONO_STR = number_format($MONO, 3);
	$CHOL = $json_a[$name]["CHOL"];
	$CHOL_STR = number_format($CHOL, 3);
	$TDFB = $json_a[$name]["TDFB"];
	$TDFB_STR = number_format($TDFB, 3);
	$VITC = $json_a[$name]["VITC"];
	$VITC_STR = number_format($VITC, 3);
	$B12 = $json_a[$name]["B12"];
	$B12_STR = number_format($B12, 3);
	$NA = $json_a[$name]["NA"];
	$NA_STR = number_format($NA, 3);
	$ZN = $json_a[$name]["ZN"];
	$ZN_STR = number_format($ZN, 3);
	$FE = $json_a[$name]["FE"];
	$FE_STR = number_format($FE, 3);
	$FATRN = $json_a[$name]["FATRN"];
	$FATRN_STR = number_format($FATRN, 3);
	$K = $json_a[$name]["K"];
	$K_STR = number_format($K, 3);
	$CA = $json_a[$name]["CA"];
	$CA_STR = number_format($CA, 3);
	$VTAIU = $json_a[$name]["VTAIU"];
	$VTAIU_STR = number_format($VTAIU, 3);
	$B6 = $json_a[$name]["B6"];
	$B6_STR = number_format($B6, 3);
	$SUGR = $json_a[$name]["SUGR"];
	$SUGR_STR = number_format($SUGR, 3);
	
	// Build the output
	$output = "{";
	$output = $output."\"KCAL\":".$KCAL_STR.",";
	$output = $output."\"FAT\":".$FAT_STR.",";
	$output = $output."\"CHO\":".$CHO_STR.",";
	$output = $output."\"PRO\":".$PRO_STR.",";
	$output = $output."\"SFA\":".$SFA_STR.",";
	$output = $output."\"POLY\":".$POLY_STR.",";
	$output = $output."\"MONO\":".$MONO_STR.",";
	$output = $output."\"CHOL\":".$CHOL_STR.",";
	$output = $output."\"TDFB\":".$TDFB_STR.",";
	$output = $output."\"VITC\":".$VITC_STR.",";
	$output = $output."\"B12\":".$B12_STR.",";
	$output = $output."\"NA\":".$NA_STR.",";
	$output = $output."\"ZN\":".$ZN_STR.",";
	$output = $output."\"FE\":".$FE_STR.",";
	$output = $output."\"FATRN\":".$FATRN_STR.",";
	$output = $output."\"K\":".$K_STR.",";
	$output = $output."\"CA\":".$CA_STR.",";
	$output = $output."\"VTAIU\":".$VTAIU_STR.",";
	$output = $output."\"B6\":".$B6_STR.",";
	$output = $output."\"SUGR\":".$SUGR_STR."}";
	return $output;
	}
return null;
}
?>