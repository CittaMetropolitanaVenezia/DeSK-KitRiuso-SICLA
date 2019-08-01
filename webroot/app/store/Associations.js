Ext.define('SIO.store.Associations', {
    extend: 'Ext.data.Store',
    alias: 'store.associations',
    requires: [
        'SIO.model.Association'
    ],
    remoteFilter: true,
    storeId: 'Associations',
    autoLoad: false,
    model: 'SIO.model.Association'
});