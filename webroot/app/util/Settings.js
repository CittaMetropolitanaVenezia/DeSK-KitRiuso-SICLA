Ext.define('SIO.util.Settings', {
        singleton: true,
        alternateClassName : ['SIO.Settings'],

        baseUrl: 'http://vps109638.ovh.net/sos-dashboard/app/',
        usernameMinLength: 5,
        passwordMinLength: 5,

        data: null,
        /*
        config: {
            user: {},
            startDate: null,
            endDate: null,
            loaded: false,
            logged: true
        }
        */
        init: function(data) {	
            this.data = data;
        },
		getTitle: function() {
			return this.data.title;
		},
		getDrawOverLimits: function() {
			return this.data.drawOverLimits;
		},
		getSubmissionStatus: function() {
			return this.data.submissions_enable;
		},
		getShapeTable: function() {
			return this.data.shape_table;
		},
		getGeometries: function () {
			return this.data.geometries;
		},
		getAllowPoint: function () {
			return this.data.geometries.allow_point;
		},
		getAllowLine: function () {
			return this.data.geometries.allow_line;
		},
		getAllowPoligon: function () {
			return this.data.geometries.allow_poligon;
		},
        getStartDate: function() {
            return this.data.startDate;
        },

        getEndDate: function() {
            return this.data.endDate;
        },
		getXMin: function() {
			return this.data.x_min;
		},
		getYMin: function() {
			return this.data.y_min;
		},
		getXMax: function() {
			return this.data.x_max;
		},
		getYMax: function() {
			return this.data.y_max;
		},
        isTown: function() {
            return this.data.user.town_id > 0;
        },

        isProvince: function() {
            return this.data.user.town_id == 0;
        },

        isAdmin: function() {
            return this.data.user.is_admin;
        },

        getUser: function() {
            return this.data.user;
        },

        getTownBufferGeoJson: function() {
            return this.data.map.town_buffer_geojson;
        },

        getMapLayers: function() {
            return this.data.map.layers;
        },

        getTownMaxBounds: function() {
            if (this.data.map.town_max_bounds) {
                return this.data.map.town_max_bounds.split(',');
            } else {
                return false;
            }
        },

        getTownNeighborsId: function() {
            var data = this.data.map.town_neighbors,
                output = [];
			if(data){
				for (var i=0; i<data.length; i++) {
					output.push(data[i].properties.gid);
				}
			}
            return output;
        },

        getTownNeighborsGeoJSON: function() {
            return this.data.map.town_neighbors;
        }
//<debug>
    },
    function () {
        this.baseUrl = '../desktop/app/';
//</debug>
});