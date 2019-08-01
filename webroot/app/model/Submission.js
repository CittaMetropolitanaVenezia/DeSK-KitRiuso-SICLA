Ext.define('SIO.model.Submission', {
    extend: 'Ext.data.Model',
    id: 'Submission',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'submissions'
    },

    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int',
            mapping: 'properties.id'
        },
        {
            name: 'is_owner',
            type: 'boolean',
            mapping: 'properties.is_owner'
        },
        {
            name: 'town_id',
            type: 'int',
            mapping: 'properties.town_id'
        },
        {
            name: 'from_town_name',
            type: 'string',
            mapping: 'properties.from_town_name'
        },
        {
            name: 'user_id',
            type: 'int',
            mapping: 'properties.user_id'
        },
        /*
        {
            name: 'user_name',
            type: 'string'
        },
        */
        {
            name: 'description',
            type: 'string',
            mapping: 'properties.description'
        },
        {
            name: 'province_note',
            type: 'string',
            mapping: 'properties.province_note'
        },
        {
            name: 'geom_type',
            type: 'string',
            mapping: 'properties.geom_type'
        },
        {
            name: 'opinions_needed',
            type: 'int',
            mapping: 'properties.opinions_needed'
        },
        {
            name: 'opinions_given',
            type: 'int',
            mapping: 'properties.opinions_given'
        },
        {
            name: 'opinions_status',
            mapping: 'properties.opinions_status',
            type: 'int' // opinions_status (1=in discussione, 1=non tutti daccordo, 2=tutti daccordo)
        },
		{
			name: 'project_id',
			type: 'int',
			mapping: 'properties.project_id'
		},
        {
            name: 'created',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s',
            mapping: 'properties.created'
        }
    ]
});