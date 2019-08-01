Ext.define('SIO.store.Users', {
    extend: 'Ext.data.Store',
    alias: 'store.users',
    requires: [
        'SIO.model.User'
    ],
    remoteFilter: true,
    storeId: 'Users',
    autoLoad: false,
    model: 'SIO.model.User',
    sorters: [{
        property: 'username',
        direction: 'ASC'
    }]
});