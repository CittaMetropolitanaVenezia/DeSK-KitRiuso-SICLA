Ext.define('SIO.view.admin.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.panel',
    requires:[
        'SIO.view.admin.users.Grid',
        'SIO.view.admin.towns.Grid',
		'SIO.view.admin.projects.Grid',
        'SIO.view.admin.system.Form',
		'SIO.view.admin.system.Generalsettings',
		'SIO.view.admin.projects.BaseLayersGrid',
		'SIO.view.admin.projects.OverlayLayersGrid',
		'SIO.view.admin.towns.TownAssociationPanel',
		'SIO.view.admin.projects.UploadWindow'
    ],

    layout: {
        type: 'card'
    },

    dockedItems: [
        {
            xtype: 'toolbar',
            docked: 'top',
            defaults: {
                scale: 'medium',
                iconAlign: 'top',
                width: 130,
                toggleGroup: 'adminBtns',
                allowDepress: false
            },
            items: [
                {
                    text: 'Utenti',
                    glyph: 61632,
                    pressed: true,
                    itemId: 'systemUser'
					
                },
                {
                    text: 'Enti',
                    glyph: 61746,
                    itemId: 'systemTown'
                },
                {
                    text: 'Impostazioni',
                    hidden: false,
                    glyph: 61459,
                    itemId: 'systemIni'
                },
				{
					text: 'Progetti',
					glyph: 61462,
					pressed: false,
					itemId: 'systemProject'
				}
            ]
        }
    ],

    defaults: {
        padding: 5
    },

    items: [
        {
            xtype: 'admin.users.grid'
        },
        {
            xtype: 'admin.towns.grid'
        },
        {
            xtype: 'admin.system.generalsettings'
        },
		{
			xtype: 'admin.projects.grid'
		},
    ]

});
