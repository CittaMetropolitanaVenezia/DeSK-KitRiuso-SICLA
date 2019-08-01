Ext.define('SIO.model.Townproject', {
    extend: 'Ext.data.Model',
    id: 'Townproject',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'town_projects'
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
        { name: 'town_id', type: 'int' },
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
        {type: 'presence',  field: 'town_id', message:'campo obbligatorio'},
        {type: 'presence',  field: 'project_id', message:'campo obbligatorio'}
    ]
});