Ext.define('SIO.model.Project', {
    extend: 'Ext.data.Model',
    id: 'Project',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'projects'
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
    ],
    validations: [
        {type: 'presence',  field: 'name', message:'campo obbligatorio'},
        {type: 'presence',  field: 'description', message:'campo obbligatorio'}
    ]
});