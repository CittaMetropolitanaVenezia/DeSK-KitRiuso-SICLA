Ext.define('SIO.model.bindedProject', {
    extend: 'Ext.data.Model',
    id: 'bindedProject',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'projects/unbindedprojectsindex'
    },

    idProperty: 'id',
    fields: [
        // id field
        {
            name: 'id',
            type: 'int',
            useNull : true
        },
        // simple values
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
		{ name: 'active' , type: 'boolean' },
        {
            name: 'created',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s'
        },
        {
            name: 'modified',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s'
        }
    ]
});