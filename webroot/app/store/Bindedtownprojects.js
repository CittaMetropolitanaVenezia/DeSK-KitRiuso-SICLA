Ext.define('SIO.store.Bindedtownprojects', {
    extend: 'Ext.data.Store',
    alias: 'store.bindedtownprojects',
    requires: [
        'SIO.model.bindedProject'
    ],
    remoteFilter: true,
    storeId: 'Bindedtownprojects',
    autoLoad: false,
    model: 'SIO.model.Bindedtownproject',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }]
});