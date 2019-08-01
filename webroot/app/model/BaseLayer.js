Ext.define('SIO.model.BaseLayer', {
    extend: 'Ext.data.Model',
    id: 'BaseLayer',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'baselayers'
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
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
		{ name: 'url' , type: 'string' },
		{ name: 'options_attribution', type: 'string' },
		{ name: 'options_maxZoom', type: 'int' },
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
		{type: 'presence',  field: 'type', message:'Tipo obbligatorio'},
		{type: 'presence',  field: 'title', message:'Titolo obbligatorio'},
		{type: 'presence',  field: 'url', message:'Url obbligatorio'},
		//{type: 'format', 	field: 'url', message:'Url non valido', matcher: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/},
		{type: 'presence',  field: 'options_maxZoom', message:'Zoom obbligatorio'},
		{type: 'format',    field: 'options_maxZoom', message:'Valore non valido.\nScegliere un valore compreso tra 1(min) e 18(max)', matcher: /^([1-9]|1[0-8])$/}
	],
});