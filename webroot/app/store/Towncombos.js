Ext.define('SIO.store.Towncombos', {
    extend: 'Ext.data.Store',
    alias: 'store.towncombos',
    requires: [
        'SIO.model.Towncombo'
    ],
    storeId: 'Towncombos',
    remoteFilter: false,
    model: 'SIO.model.Towncombo',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }],
    autoLoad: false,
    pageSize: 200
});