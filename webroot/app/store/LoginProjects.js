Ext.define('SIO.store.LoginProjects', {
    extend: 'Ext.data.Store',
    alias: 'store.loginprojects',
    requires: [
        'SIO.model.loginProject'
    ],
    remoteFilter: true,
    storeId: 'loginProjects',
    autoLoad: false,
    model: 'SIO.model.loginProject',
    sorters: [{
        property: 'name',
        direction: 'ASC'
    }]
});