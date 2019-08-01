Ext.define('SIO.view.submissions.Map', {
    extend: 'Ext.Component',
    alias: 'widget.submissions.map',

    statics: {
        EDIT: {
            selectedPathOptions: {
                color: '#0000ff',
                opacity: 0.8,
                dashArray: '10, 10',

                fill: true,
                fillColor: '#0000ff',
                fillOpacity: 0.1,

                // Whether to user the existing layers color
                maintainColor: true
            }
        },
        DRAW: {
            allowIntersection: true,
            showLength: true,
            shapeOptions: {
                stroke: true,
                color: '#0000ff',
                weight: 4,
                opacity: 0.7,
                fill: false,
                clickable: true
            }
        },
        BUFFER: {
            style: {
                fillOpacity: 0,
                color: 'red',
                dashArray: '6',
                weight: 4,
                pointer: 'default'
            }
        }
    },

    config:{
        initialLocation: null,
        initialZoomLevel: null,
        map: null,
        baseLayers: {},
        overlayLayers: {
            towns: null,
            buffer: null,
            submissions: null
        },
        editHandler: null,
        drawHandler: null,
        drawLayer: null,
        drawMode: '',
        maxBounds: null,
        neighborsLayer: null
    },

    onRender: function() {
        var me = this,
            user = SIO.Settings.getUser();
		title = SIO.Settings.getTitle();
        // update panel title
        me.up().setTitle([
            'Benvenuto <span style="color: black;">' + user.username + '</span> ',
            (user.town_id > 0) ? ' (Ente / Comune ' : ' (',
            user.town_name + ') - ' + title
        ].join(''));
        me.callParent(arguments);
    },

    afterRender: function(t, eOpts){
        var me = this,
            layers = this.getOverlayLayers();
        this.callParent(arguments);


        var leafletRef = window.L;
        if (leafletRef == null){
            this.update("No leaflet library loaded");
        } else {
            // debugger;
            // calculate max bounds
            var rawMaxBounds = SIO.Settings.getTownMaxBounds(),
                maxBounds = null,
                mapOptions = {};
            if (rawMaxBounds) { //se esiste lo zoom sul comune allora lo setto
                var maxBounds = L.latLngBounds(
                    L.latLng(rawMaxBounds[1], rawMaxBounds[0]),
                    L.latLng(rawMaxBounds[3], rawMaxBounds[2])
                );
                mapOptions = {
                    // center: bounds.getCenter(),
                    maxBounds: maxBounds,
                    minZoom: 7,
                    maxZoom: 18,
                    zoomControl: false
                };
            } else { //se non ho extend del comune
				//mettere quello del progetto
				var xmin = SIO.Settings.getXMin();
				var ymin = SIO.Settings.getYMin();
				var xmax = SIO.Settings.getXMax();
				var ymax = SIO.Settings.getYMax();
                var maxBounds = L.latLngBounds( 
                    L.latLng(xmin,ymin),
                    L.latLng(xmax,ymax)
                );
                mapOptions = {
                    maxBounds: maxBounds,
                    minZoom: 7,
                    maxZoom: 18,
                    zoomControl: false
                };
            }
            // save for future use
            me.setMaxBounds(maxBounds);
            // create map object
            var map = L.map(this.getId(), mapOptions);
            if (maxBounds) map.fitBounds(maxBounds);
			
            // save reference
            me.setMap(map);

            /*
            var initialLocation = this.getInitialLocation();
            var initialZoomLevel = this.getInitialZoomLevel();
            if (initialLocation && initialZoomLevel){
                map.setView(initialLocation, initialZoomLevel);
            } else {
                map.fitWorld();
            }
            */
            /*
            // TODO: sistemare...
            // center and zoom the map
            var buffer = SIO.Settings.getTownBufferGeoJson();
            if (buffer && buffer.length) {
                layers.buffer = L.geoJson(buffer, {
                    clickable: false,
                    style: {
                        fillOpacity: 0,
                        color: 'red',
                        dashArray: '6',
                        weight: 4,
                        pointer: 'default'
                    }
                });
                var bounds = layers.buffer.getBounds(),
                    initialZoomLevel = map.getBoundsZoom(bounds, true),
                    initialLocation = bounds.getCenter();
                layers.buffer.addTo(map);
                map.setView(initialLocation, 12);
            } else {
                var initialLocation = this.getInitialLocation();
                var initialZoomLevel = this.getInitialZoomLevel();
                if (initialLocation && initialZoomLevel){
                    map.setView(initialLocation, initialZoomLevel);
                } else {
                    map.fitWorld();
                }
            }
            */

            // save to map obj
            map._initialZoom = map.getZoom();

            // extend leaflet map methods
            this.extendLeafletMap(map);

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
            var overlayLayers = me.buildOverlayLayers();
            var baseLayers = me.buildBaseLayers();
            /*
            layers.submissions.on('mouseover', function(e) {
                e.layer.openPopup();
            });
            */

            /*
            var groupedOverlays = {
                'Tematismi': {
                    'Limiti Comunali': comuni,
                    'Osservazioni': layers.submissions
                    // 'Limiti di disegno': layers.buffer
                }
                //
                 "Points of Interest": {
                    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Theaters": theaterLayer,
                    "<img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums": museumLayer
                 },
                 "Reference": {
                 "Boroughs": boroughs,
                 "Subway Lines": subwayLines
                 }
            };
            */



            // CONTROLS -------------------------------------------
            // zoom control
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            // nav bar
            L.control.navbar({
                position: 'topright'
            }).addTo(map);
            // add minimap
            me.buildMiniMap();
            // scale control
            L.control.scale({
                position: 'bottomleft',
                imperial: false
            }).addTo(map);
            // add the geocoder control
            var geocoder = L.Control.Geocoder.Google(),
                control = L.Control.geocoder({
                    geocoder: geocoder,
                    tooltip: 'Ricerca strade',
                    placeholder: 'Ricerca...',
                    errorMessage: 'Nessuna corrispondenza trovata.',
                    removeMarkerTimeout: 4000,
                    markerIcon: L.icon({
                        iconUrl: 'resources/markers/blue.png',
                        iconSize: [29, 38],
                        iconAnchor: [15, 38],
                        popupAnchor: [0, -38]
                    })
                }).addTo(map);
            // layers control
            var layerControl = L.control.groupedLayers(baseLayers, overlayLayers, {
                position: 'topright',
                collapsed: true
            }).addTo(map);
            // add the legend
            me.buildLegend(map);

            // fire global event
            map.whenReady(function() {
                // fit bounds
                if (maxBounds) setTimeout(function() {
                    map.fitBounds(maxBounds);
                    map.options.minZoom = map.getBoundsZoom(maxBounds);

                }, 10);
                // emit global event
                Ext.globalEvents.fireEvent('mapready', me, map);
            });
            /*
            var drawControl = new L.Control.Draw({
                position: 'topright',
                draw: {
                    polyline: {
                        metric: true
                    },
                    polygon: false,
                    circle: false
                },
                edit: {
                    featureGroup: me.getOverlayLayers().submissions,
                    remove: false
                }
            });
            map.addControl(drawControl);

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                // if (type === 'marker') {
                    layer.bindPopup('A popup!');
                //}

                me.getOverlayLayers().submissions.addLayer(layer);
            });
            */


            map.on('click', function(e) {
                // console.info(e.latlng.inside(me.getOverlayLayers().buffer.getLayers()[0]));
            });

            map.on('draw:forbidden', function() {
                SIO.Utilities.alert('Attenzione', 'Impossibile disegnare al di fuori dei limiti di disegno');
            });

            map.on('draw:created', me.onDrawCreated, me);
            map.on('draw:modified', me.onDrawModified, me);


            // set leaflet draw locale
            me.overrideLeafletDrawLocale();

            // TODO: aggiungere controllo se presente OL
            // load neighbors layer
            var neighborsLayer = new OpenLayers.Layer.Vector("Vector Layer"),
                features = SIO.Settings.getTownNeighborsGeoJSON();
            if (features) {
                for (var i=0; i<features.length; i++) {
					if(features[i].geometry != null){
						var feature = new OpenLayers.Format.GeoJSON().read(
							Ext.encode(features[i]));
						neighborsLayer.addFeatures(
							feature
						);
					}else{
						
					}
                }
                me.setNeighborsLayer(neighborsLayer);
            }

            // invalidate size
            map.invalidateSize();
        }
    },

    onResize: function(w, h, oW, oH){
        this.callParent(arguments);
        var map = this.getMap();
        if (map){
            map.invalidateSize();
        }
    },

    extendLeafletMap: function(map) {
        map.zoomToLayer = function(layer, openPopup) {
            var feature = layer.feature,
                geometry = feature.geometry,
                type = geometry.type;
            // open popup?
            if (openPopup === true) layer.openPopup();
            if (type == 'Point') {
                var pointBounds = L.latLngBounds(layer.getLatLng(), layer.getLatLng()),
                    zoom = this.getBoundsZoom(pointBounds),
                    center = layer.getLatLng();
            } else {
                var bounds = layer.getBounds(),
                    zoom = this.getBoundsZoom(bounds),
                    center = bounds.getCenter();
            }
            map.setView(center, zoom, { animate: false });
        };

        map.resetBounds = function(closePopup) {
            if (closePopup) map.closePopup();
            if (this.options.maxBounds) map.fitBounds(this.options.maxBounds);
            else map.setView(this._initialCenter, this._initialZoom);
        }
    },

    resetBounds: function() {
        var me = this,
            map = me.getMap();
        map.resetBounds();
    },

    zoomToBoundsArray: function(boundsArray) {
        var me = this,
            map = me.getMap(),
            bounds = L.latLngBounds(
                L.latLng(boundsArray.split(',')[1], boundsArray.split(',')[0]),
                L.latLng(boundsArray.split(',')[3], boundsArray.split(',')[2])
            );
        map.fitBounds(bounds);
    },

    startDraw: function(type) {
        var me = this,
            map = me.getMap(),
            featuresGroup = me.getOverlayLayers().submissions,
            layer = me.getDrawLayer(),
			
			//Ciclo i miei layer
            noDrawZone = me.getOverlayLayers().buffer.getLayers()[0],
            editHandler = me.getEditHandler(),
            drawHandler = me.getDrawHandler();
		// save draw mode
        me.setDrawMode(type);

        // layer already in map?
        if (layer) {

            if (layer instanceof L.Marker) {

                // marker layer
                if (type == 'point') { // edit already existent layer
                    // debugger;
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
                    var editHandler = new L.Edit.Marker(layer, {
                        noDrawZone: noDrawZone,
                        map: map
                    });
                    // save the handler
                    me.setEditHandler(editHandler);
                    // enable the handler
                    editHandler.enable();
                } else if (type == 'line'){
					// draw line
                    // send feedback, and eventually activate polyline draw
                    // SIO.Utilities.alert('Attenzione', 'Il disegno precedentemente creato verrà cancellato', function(btn) {
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;
                    // create the draw handler
						drawHandler = new L.Draw.Polyline(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW, { noDrawZone: noDrawZone }));
                    // enable the handler
                    drawHandler.enable();
                    // save the handler
                    me.setDrawHandler(drawHandler);
                    // fire event
                    me.fireEvent('drawmodechanage');
                    //});
                }else if(type == 'polygon'){
					if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
					                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;	
						drawHandler = new L.Draw.Polygon(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW,{ noDrawZone: noDrawZone}));
					drawHandler.enable();
					me.setDrawHandler(drawHandler);
					me.fireEvent('drawmodechanage');
				}
            } else {
                // polyline layer
                if (type == 'line') {
					// edit
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
					if(layer instanceof L.Polygon){
						featuresGroup.removeLayer(layer);
						delete layer;
						drawHandler = new L.Draw.Polyline(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW,{ noDrawZone: noDrawZone}));

						drawHandler.enable();
						me.setDrawHandler(drawHandler);
						me.fireEvent('drawmodechanage');
					}else{
						layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
							var editHandler = new L.Edit.Poly(layer, {
								noDrawZone: noDrawZone,
								map: map
							});
						// save the handler
						me.setEditHandler(editHandler);
						// enable the handler
						editHandler.enable();
					}
                } else if(type == 'point'){
					// draw marker
                    // send feedback, and eventually activate marker draw
                    // SIO.Utilities.alert('Attenzione', 'Il disegno precedentemente creato verrà cancellato', function(btn) {
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;
                    // create drawing marker
                    var icon = L.icon({
                        iconUrl: 'resources/markers/blue.png',
                        iconSize: [29, 38],
                        iconAnchor: [15, 38],
                        popupAnchor: [0, -38]
                    });
                    // create the draw handler
						drawHandler = new L.Draw.Marker(me.getMap(), {
                        icon: icon,
                        noDrawZone: noDrawZone
                    });
                    // enable the handler
                    drawHandler.enable();
                    // save the handler
                    me.setDrawHandler(drawHandler);
                    // map.on('draw:created', me.onDrawCreated, me);
                    // fire event
                    me.fireEvent('drawmodechanage');
                    // });
                }else if(type == 'polygon'){
					if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
					
					if(layer instanceof L.Polyline){
						featuresGroup.removeLayer(layer);
						delete layer;
							drawHandler = new L.Draw.Polygon(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW,{ noDrawZone: noDrawZone}));
						drawHandler.enable();
						me.setDrawHandler(drawHandler);
						me.fireEvent('drawmodechanage');
					}else{
						layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
							var editHandler = new L.Edit.Poly(layer, {
							noDrawZone: noDrawZone,
							map: map
							});
						// save the handler
						me.setEditHandler(editHandler);
						// enable the handler
						editHandler.enable();
					}
										
				}
            }
        } // end if layer already on map
        else {

            if (type == 'point') {

                // disable and destroy previous handlers
                if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }
                // create drawing marker
                var icon = L.icon({
                    iconUrl: 'resources/markers/blue.png',
                    iconSize: [29, 38],
                    iconAnchor: [15, 38],
                    popupAnchor: [0, -38]
                });
                // create the draw handler
					var handler = new L.Draw.Marker(me.getMap(), {
                    icon: icon,
                    noDrawZone: noDrawZone
                });
            } else if(type == 'line') {
                // disable and destroy previous handlers
                if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }
					var handler = new L.Draw.Polyline(me.getMap(),
                    Ext.apply(
                        SIO.view.submissions.Map.DRAW, {
                            noDrawZone: noDrawZone
                        }
                    )
                );
            }else if(type == 'polygon'){
				if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }

				var handler = new L.Draw.Polygon(me.getMap(),
					Ext.apply(
							SIO.view.submissions.Map.DRAW, {
								noDrawZone: noDrawZone
							}));
			}
            // enable the handler
            handler.enable();
            // save the handler
            me.setDrawHandler(handler);
            // map.on('draw:created', me.onDrawCreated, me);
        } // end if layer not already on map


        /*
        // draw or edit?
        if (layer) { // edit
            // destroy previous handler
            var handler = me.getEditHandler();
            if (handler) delete handler;
            layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
            // TODO: backup the layer?
            if (type == 'point') {
                var handler = new L.Edit.Marker(layer, {
                    noDrawZone: noDrawZone,
                    map: map
                });
            } else {
                var handler = new L.Edit.Poly(layer, {
                    noDrawZone: noDrawZone,
                    map: map
                });
            }
            // enable the handler
            handler.enable();
            // save the handler
            me.setEditHandler(handler);
        } else { // draw
            // destroy previous handler
            var handler = me.getDrawHandler();
            if (handler) delete handler;
            if (type == 'point')
                var handler = new L.Draw.Marker(me.getMap(), SIO.view.submissions.Map.DRAW);
            else
                var handler = new L.Draw.Polyline(me.getMap(), SIO.view.submissions.Map.DRAW);
            // enable the handler
            handler.enable();
            // save the handler
            me.setDrawHandler(handler);
            map.on('draw:created', me.onDrawCreated, me);
        }
        */
    },

    clearDraw: function() {
        var me = this,
            map = me.getMap(),
            featuresGroup = me.getOverlayLayers().submissions,
            editHandler = me.getEditHandler(),
            drawHandler = me.getDrawHandler(),
            layer = me.getDrawLayer();
        if (editHandler) {
            editHandler.disable();
            delete editHandler;
        }
        if (drawHandler) {
            drawHandler.disable();
            delete drawHandler;
        }
        me.setEditHandler(null);
        me.setDrawHandler(null);
        if (layer) {
            featuresGroup.removeLayer(layer);
            delete layer;
        }
        me.setDrawLayer(null);
    },

    onDrawCreated: function(e) {
        var me = this,
            drawMode = me.getDrawMode(),
            layer = e.layer;			
		var geojson = layer.toGeoJSON();
        // save to global
        me.setDrawLayer(layer);
        // add to submissions features group
        me.getOverlayLayers().submissions.addLayer(layer);
		Ext.globalEvents.fireEvent('drawfinished',geojson);
        // fire global event
        //me.fireEvent('drawcreated', layer);
        // start edit mode
        //me.startDraw(drawMode);
    },

    onDrawModified: function(e) {
        var me = this,
            layer = e.layer;
        me.fireEvent('drawmodified', layer);
    },

    buildBaseLayers: function() {
        var me = this,
            map = me.getMap(),
            baseLayers = SIO.Settings.getMapLayers().base,
            output = {},
            first = true;
        // loop over ini settings...
        Ext.Object.each(baseLayers, function(key, value) {
            if (value.type == 'tms' || value.type == 'osm') {				
                var layer = L.tileLayer(value.url, value.options);
            } else {
                var layer = L.tileLayer.wms(value.url, value.options);
            }
            output[value.title] = layer;
            if (first) {
                layer.addTo(map);//accenderlo il primo
                first = false;
            }
        });
		var options;
		output['Nessun layer'] = L.tileLayer('');
        return output;
    },

    buildMiniMap: function() {
        var me = this,
            map = me.getMap(),
            miniMapDefinition = SIO.Settings.getMapLayers().minimap,
            layer = L.tileLayer(miniMapDefinition.url,{maxZoom: miniMapDefinition.options.maxZoom, attribution: miniMapDefinition.options.attribution});
        var a = L.control.minimap(layer, {
            toggleDisplay: true
        }).addTo(map);
    },

    buildLegend: function(map) {
        var legend = L.control({position: 'topleft'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                labels = [],
                from, to;
            labels.push('<b>Legenda</b>');
            labels.push('<i style="background: red"></i> Mancato accordo');
            labels.push('<i style="background: yellow"></i> In discussione');
            labels.push('<i style="background: green"></i> Accordo');
            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    },

    buildOverlayLayers: function() {
        var me = this,
            map = me.getMap(),
            overlayLayersDefinition = SIO.Settings.getMapLayers().overlay,
            layers = {},
            layersGroup = {
                'Tematismi': {}
            };			
        // build town limits layer
      /*  layers['comuni'] = L.tileLayer.wms(overlayLayersDefinition.limits.url, overlayLayersDefinition.limits.options).addTo(map);
        layersGroup['Tematismi']['<img src="resources/markers/limits.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;' + overlayLayersDefinition.limits.title] = layers['comuni'];
		*/	
			if(overlayLayersDefinition){
				for(i=0; i<overlayLayersDefinition.length; i++) {
					if(overlayLayersDefinition[i].active){
						
						if(overlayLayersDefinition[i].username && overlayLayersDefinition[i].password){
							//layers[overlayLayersDefinition[i].code] = L.tileLayer.wms('https://'+overlayLayersDefinition[i].username+':'+overlayLayersDefinition[i].password+'@'+overlayLayersDefinition[i].url, overlayLayersDefinition[i].options).addTo(map);
							var url = 'http://93.34.11.229/wmsconverter.php?urlEndPoint=' + overlayLayersDefinition[i].url+'&LAYERS=' + overlayLayersDefinition[i].options.layers+'&ATTRIBUTION='+overlayLayersDefinition[i].options.attribution+'&FORMAT='+overlayLayersDefinition[i].options.format+'&TRANSPARENT='+overlayLayersDefinition[i].options.transparent+'&USERNAME='+overlayLayersDefinition[i].username+'&PASSWORD='+overlayLayersDefinition[i].password;	
							layers[overlayLayersDefinition[i].code] = L.tileLayer.wms(url, overlayLayersDefinition[i].options);
						}else{							
							layers[overlayLayersDefinition[i].code] = L.tileLayer.wms(overlayLayersDefinition[i].url, overlayLayersDefinition[i].options).addTo(map);
						}
						
					}else{
						if(overlayLayersDefinition[i].username && overlayLayersDefinition[i].password){
							layers[overlayLayersDefinition[i].code] = L.tileLayer.wms('https://'+overlayLayersDefinition[i].username+':'+overlayLayersDefinition[i].password+'@'+overlayLayersDefinition[i].url, overlayLayersDefinition[i].options);
						}else{
							layers[overlayLayersDefinition[i].code] = L.tileLayer.wms(overlayLayersDefinition[i].url, overlayLayersDefinition[i].options);
						}
					}
					layersGroup['Tematismi']['<img src="'+ overlayLayersDefinition[i].photo+'" width="17" height="17" >&nbsp;' + overlayLayersDefinition[i].title] = layers[overlayLayersDefinition[i].code];
				}
			}
		// build buffer layer
        if (SIO.Settings.getTownBufferGeoJson() && SIO.Settings.getTownBufferGeoJson().length) {
            layers['buffer'] = L.geoJson(SIO.Settings.getTownBufferGeoJson(), {
                clickable: false,
                style: SIO.view.submissions.Map.BUFFER.style
            }).addTo(map);
            layersGroup['Tematismi']['<img src="resources/markers/buffer.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;Limiti di disegno'] = layers['buffer'];
        }
        // add submissions layer
        var greenIcon = L.icon({
            iconUrl: 'resources/markers/green.png',
            iconSize: [29, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });
        var redIcon = L.icon({
            iconUrl: 'resources/markers/red.png',
            iconSize: [29, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });
        var yellowIcon = L.icon({
            iconUrl: 'resources/markers/yellow.png',
            iconSize: [29, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });
        //da lasciare
		layers['submissions'] = L.geoJson(null, {
            style: function(feature) {
                var color;
                switch (feature.geometry.properties.opinions_status) {
                    case 3:
                        color = '#00ff00';
                        break;
                    case 2:
                        color = '#ff0000';
                        break;
                    default:
                        color = '#ffff00';
                }
                if (feature.geometry.type != 'Point') {
                    return {
                        color: color,
                        opacity: 0.9
                    };
                }
            },
            pointToLayer: function (feature, latlng) {
                switch (feature.properties.opinions_status) {
                    case 3:
                        return L.marker(latlng, {
                            icon: greenIcon
                        });
                        break;
                    case 2:
                        return L.marker(latlng, {
                            icon: redIcon
                        });
                        break;
                    default:
                        return L.marker(latlng, {
                            icon: yellowIcon
                        });
                }
            },
            onEachFeature: function(feature, layer) {
                // does this feature have a property named popupContent?
                if (feature.properties && feature.properties.from_town_name) {
                    var status,linkText;
                    if (feature.properties.opinions_status == 1) {
                        status = 'In discussione';
                    } else if (feature.properties.opinions_status == 2) {
                        status = 'Mancato accordo';
                    } else {
                        status = 'Accordo';
                    }
                    if (feature.properties.is_owner) {
                        linkText = 'Vedi dettaglio';
                    } else {
                        linkText = 'Partecipa alla discussione';
                    }
                    var template = [
                        '<b>Data: </b> ' + Ext.Date.format(new Date(feature.properties.created.replace(" ","T")), 'd-m-Y'),
                        '<b>Ente/Comune proponente: </b> {from_town_name}',
                        '<b>Pareri richiesti: </b> {opinions_needed}',
                        '<b>Pareri ottenuti: </b> {opinions_given}',
                        '<b>Attuale stato: </b> ' + status,
                        '',
                        '<a href="#" onclick="SIO.viewSubmission(' + feature.properties.id + ');">' + linkText + '</a>'
                    ];
                    layer.bindPopup( L.Util.template(template.join('<br />'), feature.properties), {
                        //offset: [0, 7]
                        closeOnClick: true,
                        autoPan: true,
                        keepInView: true,
                        closeButton: false
                    });
                }
            }
        }).addTo(map);
        // layersGroup['Tematismi']['<img src="resources/markers/limits.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;Osservazioni'] = layers['submissions'];
        // layersGroup['Tematismi']['Osservazioni'] = layers['submissions'];
        // save layer
        me.setOverlayLayers(layers);
        return layersGroup;
    },

    overrideLeafletDrawLocale: function() {
        L.drawLocal.draw.handlers.marker.tooltip.start = 'Fai click in mappa per posizionare il marker.';
        L.drawLocal.draw.handlers.polyline.tooltip.start = 'Fai click per iniziare a disegnare.';
        L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Fai click per continuare a disegnare.';
        L.drawLocal.draw.handlers.polyline.tooltip.end = 'Fai  click sull\'ultimo vertice per completare il disegno.';
		L.drawLocal.draw.handlers.polygon.tooltip.start = 'Fai click per iniziare a disegnare.';
		L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Fai click per continuare a disegnare.';
		L.drawLocal.draw.handlers.polygon.tooltip.end = 'Fai doppio click o click sul primo vertice per completare il disegno.';
        L.drawLocal.edit.handlers.edit.tooltip.text = 'Trascina i vertici o il marker per modificare il disegno.';
    }
});