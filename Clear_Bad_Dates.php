<?php

for($i = 2; $i <= 31; $i++ ){
  $temp = "1-".$i."-12 0.json";
  unlink($temp);
  echo $temp;
}

for($i = 1; $i <= 25; $i++ ){
  $temp = "2-".$i."-12 0.json"; 
  unlink($temp);
  echo $temp;
}

unlink("dates_array");

?>