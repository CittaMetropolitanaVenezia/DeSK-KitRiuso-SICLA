Ext.define('SIO.store.OverlayLayers', {
    extend: 'Ext.data.Store',
    alias: 'store.overlaylayers',
    requires: [
        'SIO.model.OverlayLayer'
    ],
    remoteFilter: true,
    storeId: 'OverlayLayers',
    autoLoad: false,
    model: 'SIO.model.OverlayLayer',
    sorters: [{
        property: 'title',
        direction: 'ASC'
    }]
});