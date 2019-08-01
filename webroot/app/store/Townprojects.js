Ext.define('SIO.store.Townprojects', {
    extend: 'Ext.data.Store',
    alias: 'store.townprojects',
    requires: [
        'SIO.model.Townproject'
    ],
    remoteFilter: true,
    storeId: 'Townprojects',
    autoLoad: false,
    model: 'SIO.model.Townproject'
});