<?php
$files = glob('./*.js');
for($f = 0; $f < count($files); $f++){
	$files[$f] = substr($files[$f],2);
	$files[$f] = substr($files[$f],0,-3);
}
echo json_encode($files);
?>