Ext.define('SIO.store.Submissions', {
    extend: 'Ext.data.Store',
    alias: 'store.submissions',
    requires: [
        'SIO.model.Submission'
    ],

    statics: {
        /**
         * @static
         * @property {Number} LAYER_TO_STORE
         * Bitfield specifying the layer to store sync direction.
         */
        LAYER_TO_STORE: 1,
        /**
         * @static
         * @property {Number} STORE_TO_LAYER
         * Bitfield specifying the store to layer sync direction.
         */
        STORE_TO_LAYER: 2
    },
    isLayerBinded: false,
    layer: null,
    featureFilter: null,

    storeId: 'Submissions',
    model: 'SIO.model.Submission',
    sorters: [{
        property: 'created',
        direction: 'DESC'
    }],
    autoLoad: false,
    remoteFilter: true,

    editableLayers: [],

    /**
     * @param {Object} config Creation parameters
     * @private
     */
    constructor: function(config) {
        /*
        config = Ext.apply({
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    idProperty: 'id'
                }
            }
        }, config);
        */
        // add private
        this._refreshing = false;

        if (config.layer) {
            this.layer = config.layer;
            delete config.layer;
        }

        // features option. Alias to data option
        if (config.features) {
            config.data = config.features;
        }
        delete config.features;

        this.callParent([config]);

        var options = {initDir: config.initDir};
        delete config.initDir;

        if (this.layer) {
            this.bind(this.layer, options);
        }
    },

    /**
     * Unbinds own listeners by calling #unbind when being destroyed.
     *
     * @private
     */
    destroy: function() {
        this.unbind();
        this.callParent();
    },

    /**
     * Bind this store to a layer instance. Once bound the store
     * is synchronized with the layer and vice-versa.
     *
     * @param {OpenLayers.Layer.Vector} layer The layer instance.
     * @param {Object} options
     */
    bind: function(layer, options) {
        options = options || {};

        if (this.isLayerBinded) {
            // already bound
            return;
        }
        this.layer = layer;
        this.isLayerBinded = true;

        var initDir = options.initDir;
        if (options.initDir == undefined) {
            initDir = SIO.store.Submissions.LAYER_TO_STORE |
                SIO.store.Submissions.STORE_TO_LAYER;
        }

        var features = layer.getLayers().slice(0);

        if (initDir & SIO.store.Submissions.STORE_TO_LAYER) {
            this.each(function(record) {
                layer.addFeatures([record.raw]);
            }, this);
        }

        if (initDir & SIO.store.Submissions.LAYER_TO_STORE && layer.getLayers().length > 0) {
            // append a snapshot of the layer's features
            this.loadRawData(features, true);
        }

        /*
        this.layer.events.on({
            'featuresadded': this.onFeaturesAdded,
            'featuresremoved': this.onFeaturesRemoved,
            'featuremodified': this.onFeatureModified,
            scope: this
        });
         */
        this.on({
            'load': this.onLoad,
           //  'refresh': this.onRefresh,
            //'clear': this.onClear,
            //'add': this.onAdd,
            //'remove': this.onRemove,
            //'update': this.onStoreUpdate,
            scope: this
        });


        this.fireEvent("bind", this, this.layer);
    },

    /**
     * Unbind this store from his layer instance.
     */
    unbind: function() {

        if (this.isLayerBinded) {
            /*
            this.layer.events.un({
                'featuresadded': this.onFeaturesAdded,
                'featuresremoved': this.onFeaturesRemoved,
                'featuremodified': this.onFeatureModified,
                scope: this
            });
             */
            this.un({
                'load': this.onLoad,
                // 'clear': this.onClear,
                // 'add': this.onAdd,
                // 'remove': this.onRemove,
                // 'update': this.onStoreUpdate,
                scope: this
            });
            this.layer = null;
            this.isLayerBinded = false;
        }

    },

    loadRawData : function(data, append) {
        var me = this,
            records = [];
        Ext.Array.each(data, function(raw) {
            var record = Ext.create('SIO.model.Submission', raw.feature.properties);
            record.raw = raw;
            records.push(record);
        });
        me.totalCount = records.length;
        me.loadRecords(records, append ? me.addRecordsOptions : undefined);
        me.fireEvent('load', me, records, true);
    },

    /**
     * Handler for a store's load event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Boolean} successful
     * @private
     */
    onLoad: function(store, records, successful, refreshing) {
        // console.info('Submissions Store onLoad...', refreshing);
        if (successful) {
            this._removing = true;
            this.editableLayers.length = 0;
            this.layer.clearLayers();
            delete this._removing;
            if (records.length) {
                // add features
                this.addFeaturesToLayer(records);
                // refreshing? do nothing
                if (this._refreshing) {
                    this._refreshing = false;
                } else {
                    // zoom the map
                    this.layer._map.fitBounds(this.layer.getBounds());
                }
            } else {
                // or reset to initial map bounds...
                // this.layer._map.resetBounds();
            }
        }
    },

    onFilterChange: function(store, filters) {

    },

    onRefresh: function(store) {
        var me = this;
        // console.info('Submissions Store onRefresh...');
        me.fireEvent('load', me, me.data.items, true);
    },

    /**
     * Adds the given records to the associated layer.
     *
     * @param {Ext.data.Model[]} records
     * @private
     */
    addFeaturesToLayer: function(records) {
        var me = this;
        this._adding = true;
        for (var i = 0, len = records.length; i < len; i++) {
            // this.layer.addLayer(records[i].raw);
            me.layer.addData([records[i].raw]);
            // add to editable array?

        }
        var i = 0;
        me.layer.eachLayer(function(layer) {
            records[i].raw = layer;
            // add to editable layers
            if (SIO.Settings.isTown() && records[i].get('is_owner')) {
                me.editableLayers.push(layer);
            }
            i++;
        });
        delete this._adding;
    },

    getEditableLayers: function() {
        return this.editableLayers;
    },

    refresh: function() {
        this._refreshing = true;
        this.load();
    }
});