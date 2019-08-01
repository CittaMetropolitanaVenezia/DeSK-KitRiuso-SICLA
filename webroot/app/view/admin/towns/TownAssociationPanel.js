Ext.define('SIO.view.admin.towns.TownAssociationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.towns.townassociationPanel',
    requires:[
        'SIO.view.admin.towns.TownProjectGrid',
		'SIO.view.admin.towns.TownProjectCombo'
    ],

    layout: {
        type: 'border'
    },
			
	items:[
		{
			xtype:'admin.towns.townprojectcombo',
			region:'north'
		},
		{
			xtype:'admin.towns.townprojectgrid',
			region:'center',		
		}				
	],
   
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
	


});
