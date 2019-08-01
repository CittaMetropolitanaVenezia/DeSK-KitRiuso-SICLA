Ext.define('SIO.store.BaseLayers', {
    extend: 'Ext.data.Store',
    alias: 'store.baselayers',
    requires: [
        'SIO.model.BaseLayer'
    ],
    remoteFilter: true,
    storeId: 'BaseLayers',
    autoLoad: false,
    model: 'SIO.model.BaseLayer',
    sorters: [{
        property: 'type',
        direction: 'ASC',
    }],
});