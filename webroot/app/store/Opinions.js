Ext.define('SIO.store.Opinions', {
    extend: 'Ext.data.Store',
    alias: 'store.opinions',
    requires: [
        'SIO.model.Opinion'
    ],

    storeId: 'Opinions',
    model: 'SIO.model.Opinion',
    autoLoad: false,
    remoteFilter: true,

    sorters: [{
        property: 'created',
        direction: 'DESC'
    }]

});