Ext.define('SIO.model.Towncombo', {
    extend: 'Ext.data.Model',
    id: 'Towncombo',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'towns/townscomboindex'
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