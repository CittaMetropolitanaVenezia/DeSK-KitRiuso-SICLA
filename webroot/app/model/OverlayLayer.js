Ext.define('SIO.model.OverlayLayer', {
    extend: 'Ext.data.Model',
    id: 'OverlayLayer',
	admin_params: null,
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'overlay_layers'
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
		{name: 'photo', type: 'string'},
		{name: 'username', type: 'string'},
		{name: 'password', type: 'string'},
		{ name: 'code', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'url', type: 'string' },
		{ name: 'options_layers', type: 'string' },
		{ name: 'options_format', type: 'string' },
		{ name: 'options_transparent', type: 'int' },
		{ name: 'options_attribution', type: 'string' },
		{ name: 'active', type: 'boolean' },
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
		//{type: 'presence',  field: 'username', message:'Username obbligatorio'},
		//{type: 'presence',  field: 'password', message:'Password obbligatorio'},
		{type: 'presence',  field: 'code', message:'Codice obbligatorio'},
		{type: 'presence',  field: 'title', message:'Titolo obbligatorio'},
		{type: 'presence',  field: 'url', message:'Url obbligatorio'},
		//{type: 'format', field: 'url', message:'Url non valido', matcher: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/},
		{type: 'presence',  field: 'options_layers', message:'Layers obbligatori'},
		{type: 'presence',  field: 'options_format', message:'Formato immagini obbligatorio'},
		{type: 'presence',  field: 'options_transparent', message:'Valore obbligatorio'},
		{type: 'inclusion', field: 'options_transparent', list:[0,1], message: 'Valore non valido.\n 0= No, 1=Si'},
	],
});