<?php
	header('Content-Disposition: inline; filename="'.date('Ymd_His').'_SICLA_'.$fileNameType.'.csv"');
    $output = '';
    $output .= "". implode(';', $header) ."\n";
    foreach ($data AS $row) {
        $output .= "". implode(';', $row) ."\n";
    }
    echo $output;