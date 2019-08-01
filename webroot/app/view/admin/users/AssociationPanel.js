Ext.define('SIO.view.admin.users.AssociationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.users.associationPanel',
    requires:[
        'SIO.view.admin.users.AssociationGrid',
		'SIO.view.admin.projects.ProjectsCombo'
    ],

    layout: {
        type: 'border'
    },
			
	items:[
		{
			xtype:'admin.projects.projectscombo',
			region:'north'
		},
		{
			xtype:'admin.users.associationgrid',
			region:'center',		
		}				
	],
   
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
	


});
