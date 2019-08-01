<?php
header('Content-Disposition: inline; filename="'.date('Ymd_His').'_SICLA_Osservazioni.csv"');
$output = '';

$head = array();
foreach ($header AS $fieldname => $fieldlabel) {
    if (!in_array($fieldname, array('geom_type', 'point_wkt', 'line_wkt', 'poly_wkt'))) {
        $head[] = '"'.$fieldlabel.'"';
    }
}
$output .= "". implode(';', $head) ."\n";
foreach ($data AS $row) {
    $newRow = array();
    foreach ($row['Submission'] AS $fieldname => $value) {
        if (!in_array($fieldname, array('geom_type', 'point_wkt', 'line_wkt', 'poly_wkt'))) {
            if ($fieldname == 'created') {
                $newRow[$fieldname] = date('d-m-Y', strtotime($value));
            }
            else {
                $newRow[$fieldname] = '"'.utf8_decode($value).'"';
            }
        }
    }
    $output .= "". implode(';', $newRow) ."\n";
}
echo $output;