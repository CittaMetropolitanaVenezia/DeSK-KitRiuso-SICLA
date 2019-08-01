Ext.define('SIO.model.Association', {
    extend: 'Ext.data.Model',
    id: 'Association',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'user_projects'
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
        { name: 'user_id', type: 'int' },
        { name: 'project_id', type: 'int' },
		{ name: 'project_name', type: 'string' },
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
        {type: 'presence',  field: 'user_id', message:'campo obbligatorio'},
        {type: 'presence',  field: 'project_id', message:'campo obbligatorio'}
    ]
});