Ext.define('SIO.model.User', {
    extend: 'Ext.data.Model',
    id: 'User',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'users'
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
        { name: 'username', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'surname', type: 'string' },
        { name: 'town_id', type: 'int' },
        { name: 'active', type: 'boolean' },
        { name: 'otp', type: 'boolean' },
        { name: 'town_name', type: 'string' },
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
        {type: 'presence',  field: 'username', message:'campo obbligatorio'},
        {type: 'presence',  field: 'email', message:'campo obbligatorio'},
        {type: 'length',    field: 'username', min: 4, message: 'minimo 6 caratteri'},
        {type: 'presence',  field: 'name', message:'campo obbligatorio'},
        {type: 'presence',  field: 'surname', message:'campo obbligatorio'},
        {type: 'presence',  field: 'town_id', message:'campo obbligatorio'},
        {type: 'email', field: 'email', message:'email non valida'}
    ]
});