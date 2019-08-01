Ext.define('SIO.model.Attachment', {
    extend: 'Ext.data.Model',
    id: 'Attachment',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'attachments'
    },

    idProperty: 'id',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'submission_id', type: 'int'},
        {name: 'label', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'created', type: 'date'}
    ]
});