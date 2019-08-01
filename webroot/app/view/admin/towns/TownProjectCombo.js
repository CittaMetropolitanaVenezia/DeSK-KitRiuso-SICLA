Ext.define('SIO.view.admin.towns.TownProjectCombo', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.towns.townprojectcombo',

    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],

    //title: 'Progetti non associati',

    emptyText: 'Nessun progetto trovato',

    config: {
        rowEditing:  null
    },
	
	layout: 'fit',

    initComponent: function() {
        var me = this;
		      me.rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false,
            errorSummary: true,
            saveBtnText  : 'Salva',
            cancelBtnText: 'Annulla',
           
        });
        Ext.apply(me, {
            items:[
			{
				xtype: 'combobox',
				layout: 'fit',
				margin: 10,
				emptyText: 'Nessun progetto selezionato',
				labelWidth: 150,
				fieldLabel:'Progetto da associare',
				store: 'Bindedtownprojects',
				queryMode: 'remote',
				displayField: 'name',
				valueField: 'id',
				editable: false,
				id: 'comboProject',
				listeners: {
					//select: me.onSelect
					
				},
			}
			]
        });
			

        me.callParent(arguments);
    },
	
	


});
