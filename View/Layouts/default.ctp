<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <title>
        <?php echo $title_for_layout?>
    </title>
    <?php
    // echo $this->Html->meta('icon');

    if ($environment == 'DEV') {
        
		// leaflet
        echo $this->Html->css('/vendor/leaflet/leaflet');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.NavBar/Leaflet.NavBar');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.MiniMap/Control.MiniMap');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.GroupedLayer/Control.GroupedLayer');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw');

        echo $this->Html->script('/vendor/leaflet/leaflet');
        echo $this->Html->script('/vendor/leaflet/controls/leaflet.navbar/Leaflet.NavBar');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.MiniMap/Control.MiniMap');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.GroupedLayer/Control.GroupedLayer');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw');

        echo $this->Html->css('/bootstrap');
        echo $this->Html->script('/ext/ext-dev');
        echo $this->Html->script('/ext/locale/ext-lang-it');
        echo $this->Html->script('/app');
    } else if ($environment == 'PROD') {
        // leaflet
        
        /*echo $this->Html->css('/build/production/SIO/vendor/leaflet/leaflet');
        echo $this->Html->script('/build/production/SIO/vendor/leaflet/leaflet');*/
		
		echo $this->Html->css('/vendor/leaflet/leaflet');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.NavBar/Leaflet.NavBar');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.MiniMap/Control.MiniMap');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.GroupedLayer/Control.GroupedLayer');
        echo $this->Html->css('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw');
		echo $this->Html->css('/vendor/leaflet/controls/Leaflet.Geocoder/Control.Geocoder');
        
		echo $this->Html->script('/vendor/leaflet/leaflet');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.NavBar/Leaflet.NavBar');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.MiniMap/Control.MiniMap');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.GroupedLayer/Control.GroupedLayer');
        echo $this->Html->script('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw-src');
		echo $this->Html->script('/vendor/leaflet/controls/Leaflet.Geocoder/Control.Geocoder');
		
		echo $this->Html->script('/vendor/openlayers/OL-Geometry');
		
        // extjs app
        echo $this->Html->css('/build/production/SIO/resources/SIO-all.css');
        echo $this->Html->script('/build/production/SIO/app');
    }

    // echo $this->fetch('meta');
    // echo $this->fetch('css');
    // echo $this->fetch('script');
    ?>
    <style>
        a {
            text-decoration: none;
            color: gray;
        }
        .info {
            padding: 6px 8px;
            font: 14px/16px Arial, Helvetica, sans-serif;
            background: white;
            background: rgba(255,255,255,0.8);
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            border-radius: 5px;
        }
        .legend {
            text-align: left;
            line-height: 20px;
            color: #555;
            width: 150px;
        }
        .legend button {
            width: 100%;
            background-color: red;
            color: white;
            font-weight: bold;
            border: 0px;
            padding: 8px;
            border-radius: 5px;
        }
        .legend button:hover {
            background-color: white;
            color: red;
        }
        .legend button:active {
            background-color: red;
            color: white;
        }
        .legend i {
            width: 16px;
            height: 16px;
            margin-top: 2px;
            float: left;
            margin-right: 8px;
            opacity: 0.7;
            border-radius: 50%;
            border: 1px solid #bbb;
        }

        .btn-red .x-btn-glyph, .btn-red .x-btn-inner {
            color: #ff0000 !important;
        }
		
		.x-panel.opinions-grid > .x-panel-header, .x-panel.attachments-grid > .x-panel-header {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
        }

        .x-panel.attachments-panel > .x-panel-header {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
        }

        #geocode-selector {
            position: absolute;
            left: 10px;
            bottom: 10px;
        }

        #geocode-selector .selected {
            background-color: #0078A8;
        }
		
    </style>
</head>
<body>
<script language="javascript">
  var cookieScriptSource = "servizi.informcity.it",
      cookieScriptReadMore = "http://servizi.informcity.it/gis/cookies.html",
      cookieScriptTitle = '',
      cookieScriptDesc = "Questo sito utilizza i cookies per il corretto funzionamento delle pagine web e per il miglioramento dei servizi.<br />Utilizzando il sito si intende accettata la Cookie Policy.";
</script>
<script src="cookie.js"></script>
<!-- Loading Mask -->
<div id="sio-loading-mask" class="x-mask sio-mask"></div>
<div id="sio-x-mask-msg">
    <div id="sio-loading" class="x-mask-msg sio-mask-msg">
        <div></div>
    </div>
</div>
</body>
</html>