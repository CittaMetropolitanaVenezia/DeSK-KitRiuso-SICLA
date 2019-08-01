Ext.define('SIO.model.Opinion', {
    extend: 'Ext.data.Model',
    id: 'Opinion',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'opinions'
    },

    idProperty: 'id',
    fields: [
        {   name: 'town_name',
            type: 'string'
        },{
            name: 'modified',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s'
        },{
            name: 'description',
            type: 'string'
        },{
            name: 'opinion',
            type: 'int'
        }
    ]
});