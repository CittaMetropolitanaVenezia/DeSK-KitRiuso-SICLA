Ext.define('SIO.model.loginProject', {
    extend: 'Ext.data.Model',
    id: 'loginProject',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'user_projects/loginprojectlist'
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
		{ name: 'active' ,type: 'boolean' },
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