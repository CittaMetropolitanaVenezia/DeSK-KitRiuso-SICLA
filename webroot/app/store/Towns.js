Ext.define('SIO.store.Towns', {
    extend: 'Ext.data.Store',
    alias: 'store.towns',
    requires: [
        'SIO.model.Town'
    ],
    storeId: 'Towns',
    remoteFilter: false,
    model: 'SIO.model.Town',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }],
    autoLoad: true,
    pageSize: 200
});