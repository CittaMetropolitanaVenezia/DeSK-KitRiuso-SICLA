Ext.define('SIO.ux.LeafletMap', {
    extend: 'Ext.Component',
    alias: 'widget.leafletmap',
    config:{
        initialLocation: null,
        initialZoomLevel: null,
        map: null,
        useCurrentLocation: false,
        tileLayerUrl: 'http://{s}.tiles.mapbox.com/v3/dennisl.map-dfbkqsr2/{z}/{x}/{y}.png',
        tileLayerKey: 'd2d84aa0aa9e4230be2215b53642174b',
        tileLayerStyle: 997,
        tileMaxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    },

    afterRender: function(t, eOpts){
        this.callParent(arguments);

        var leafletRef = window.L;
        if (leafletRef == null){
            this.update("No leaflet library loaded");
        } else {
            var map = L.map(this.getId(), {
                // TODO: vedere OSRM per adattare center e zoom al bounds!
                // TODO: recuperare da DB, in base al comune, se provincia non impostare
                maxBounds: L.latLngBounds(L.latLng(45.347802233449826, 8.872833251953125), L.latLng(45.58425087527735, 9.559478759765625))
            });
            this.setMap(map);

            var initialLocation = this.getInitialLocation();
            var initialZoomLevel = this.getInitialZoomLevel();
            if (initialLocation && initialZoomLevel){
                map.setView(initialLocation, initialZoomLevel);
            } else {
                map.fitWorld();
            }


            var baseLayer = L.tileLayer(this.getTileLayerUrl(), {
                styleId: this.getTileLayerStyle(),
                maxZoom: this.getTileMaxZoom(),
                attribution: this.getAttribution()
            }).addTo(map);


            // controls
            L.control.navbar().addTo(map);
            L.control.zoomBox().addTo(map);
            var osm2 = new L.TileLayer(this.getTileLayerUrl(), {minZoom: 0, maxZoom: this.getTileMaxZoom(), attribution: this.getAttribution()});
            L.control.minimap(osm2, {
                toggleDisplay: true
            }).addTo(map);

            // layers
            /* Basemap Layers */
            /*
            var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
                maxZoom: 19,
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
            }).addTo(map);
            var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
                maxZoom: 18,
                subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
                attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
            }).addTo(map);

            */

            var comuni = L.tileLayer.wms("http://servizi.informcity.it/cgi-bin/mapserv?MAP=/home/gis/web/tests/sioweb/wms.map&mode=map", {
                layers: 'comuni',
                format: 'image/png',
                transparent: true,
                attribution: "Regione Lombardia"
            }).addTo(map);

            var baseLayers = {
                "OSM Fisica": baseLayer
            };

            var submissions = L.geoJson().addTo(map);

            var groupedOverlays = {
                'Tematismi': {
                    'Limiti Comunali': comuni,
                    'Osservazioni': submissions
                }
                //
                /*
                "Points of Interest": {
                    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Theaters": theaterLayer,
                    "<img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums": museumLayer
                },
                "Reference": {
                    "Boroughs": boroughs,
                    "Subway Lines": subwayLines
                }
                */
            };
            var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
                position: 'topleft',
                collapsed: true
            }).addTo(map);

            if (this.getUseCurrentLocation() == true){
                map.locate({
                    setView: true
                });
            }

            SIO.Services.loadSubmissions(function(response) {
                
				submissions.addData(response.submissions);
            });

            var legend = L.control({position: 'topright'});

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                    labels = [],
                    from, to;
                labels.push('<b>Legenda</b>');
                labels.push('<i style="background: red"></i> Mancato accordo');
                labels.push('<i style="background: yellow"></i> In discussione');
                labels.push('<i style="background: green"></i> Accordo');


                /*
                for (var i = 0; i < grades.length; i++) {
                    from = grades[i];
                    to = grades[i + 1];

                    labels.push(
                        '<i style="background:' + getColor(from + 1) + '"></i> ' +
                            from + (to ? '&ndash;' + to : '+'));
                }
                */
                div.innerHTML = labels.join('<br>');
                return div;
            };

            legend.addTo(map);
        }
    },

    onResize: function(w, h, oW, oH){
        this.callParent(arguments);
        var map = this.getMap();
        if (map){
            map.invalidateSize();
        }
    }
});