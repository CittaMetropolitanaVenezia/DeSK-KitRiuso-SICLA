Ext.define('SIO.store.Projects', {
    extend: 'Ext.data.Store',
    alias: 'store.projects',
    requires: [
        'SIO.model.Project'
    ],
    remoteFilter: true,
    storeId: 'Projects',
    autoLoad: false,
    model: 'SIO.model.Project',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }]
});