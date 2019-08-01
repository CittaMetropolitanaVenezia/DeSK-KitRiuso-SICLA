Ext.define('SIO.store.bindedProjects', {
    extend: 'Ext.data.Store',
    alias: 'store.bindedprojects',
    requires: [
        'SIO.model.bindedProject'
    ],
    remoteFilter: true,
    storeId: 'bindedProjects',
    autoLoad: false,
    model: 'SIO.model.bindedProject',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }]
});