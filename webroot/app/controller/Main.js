Ext.define('SIO.controller.Main', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'Viewport',
            selector: '[xtype=viewport]'
        },
        {
            ref: 'mapRegion',
            selector: '[xtype=app-main] > panel[region=center]'
        },
        {
            ref: 'eastRegion',
            selector: '[xtype=app-main] > panel[region=east]'
        }
    ],

    init: function() {
        this.listen({
            component: {

            },
            global: {
                loggedin: this.initializeApp,
                logout: this.logout,
                mapready: this.onMapReady
            }
        });
    },

    initializeApp: function(configuration) {
        var me = this;
        // load configuration
        SIO.Settings.init(configuration.settings);
        // save labels
        SIO.Labels = configuration.labels;
        // create main viewport
        Ext.create( 'SIO.view.Viewport' );
    },

    logout: function() {
        var me = this;
        // ask confirm
        SIO.Utilities.confirm('Sicuro di voler uscire?', 'Conferma', function(btn) {
            if (btn == 'yes') {
                // TODO: bisogna fare altro?
                window.location = 'users/logout';
            }
        });
    },

    onMapReady: function(mapPanel) {
        var me = this,
            layers = mapPanel.getOverlayLayers();
        // remove entry mask
        Ext.get('sio-loading').hide();
        Ext.get('sio-loading-mask').fadeOut({
            remove: true
        });

        // bind layer to submissions store
        Ext.getStore('Submissions').bind(layers.submissions);
        // load the store
        if (SIO.Settings.isTown()) {
            Ext.getStore('Submissions').filter('town_id', SIO.Settings.getUser().town_id);
        } else {
            Ext.getStore('Submissions').load();
        }
    }
});
