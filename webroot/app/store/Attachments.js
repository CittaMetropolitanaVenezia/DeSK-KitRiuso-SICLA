Ext.define('SIO.store.Attachments', {
    extend: 'Ext.data.Store',
    alias: 'store.attachments',
    requires: [
        'SIO.model.Attachment'
    ],

    storeId: 'Attachments',
    model: 'SIO.model.Attachment',
    autoLoad: false,
    remoteFilter: true

});