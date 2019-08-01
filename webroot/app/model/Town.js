Ext.define('SIO.model.Town', {
    extend: 'Ext.data.Model',
    id: 'Town',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'towns'
    },
    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int',
			useNull: true,
            mapping: 'gid'
        },
		{
			name: 'entity',
			type: 'string',
		},
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'code',
            type: 'string'
        },
        {
            name: 'email',
            type: 'string'
        },
        {
            name: 'province',
            type: 'string'
        },
        {
            name: 'bounds', // buffered bounds
            type: 'string'
        }
    ],
    validations: [
        {type: 'email', field: 'email', message:'email non valida'}
    ]
});