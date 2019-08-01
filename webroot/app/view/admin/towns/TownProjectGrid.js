Ext.define('SIO.view.admin.towns.TownProjectGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.towns.townprojectgrid',

    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],

    title: 'Progetti Associati',

    emptyText: 'Nessun progetto trovato',
    config: {
        rowEditing:  null
    },
	layout:'fit',


    initComponent: function() {
        var me = this;

        me.rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false,
            errorSummary: true,
            saveBtnText  : 'Salva',
            cancelBtnText: 'Annulla',
           
        });
        var associationsStore = Ext.getStore('Townprojects');

        var associations = Ext.create('Ext.data.Store', {
            model: associationsStore.model
        });			
        //clono i dati
        associationsStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            associations.add(rec.copy())[0].commit(true);
        });		
        var r = Ext.create('SIO.model.Townproject');		
        associations.add(r)[0].commit(true);		
        Ext.apply(me, {
            items:[
			{
                store: 'Townprojects',
                sortableColumns: true,
                xtype: 'grid',			
                stripeRows: true,
                viewConfig:{
                    forceFit: true
                },
                listeners: {
                   // render: me.loadData
                },
                plugins: [
                    Ext.create('SIO.ux.grid.plugin.HeaderFilters'),
                    me.rowEditing
                ],
                columns: [
					{
                        draggable: false,
                        menuDisabled: true,
                        text: "Id Progetto",
                        flex: 1,
                        dataIndex: 'project_id',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                    },
					{
                        draggable: false,
                        menuDisabled: true,
                        text: "Nome Progetto",
                        flex: 1,
                        dataIndex: 'project_name',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                    },
					{
                        xtype: "actioncolumn",
                        menuDisabled: true,
                        width: 60,
                        items: [{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Disassocia',
                            itemId: 'admin-townproject-delete'
                        }]
                    }
					
					
                ],
                dockedItems: [{
                    xtype: 'pagingtoolbar',
                    displayInfo: true,
                    store: 'Associations',
                    dock: 'bottom'
                }]
            },
			
			]
        });

        me.callParent(arguments);
    },


});
