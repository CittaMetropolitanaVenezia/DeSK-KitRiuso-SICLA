Ext.define('SIO.view.login.Loginprojectcombo', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.login.loginprojectcombo',

    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],

    emptyText: 'Nessun progetto trovato',
	
	layout: 'fit',

    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            items:[
			{
				xtype: 'combobox',
				layout: 'fit',
				margin: 10,
				emptyText: 'Nessun progetto selezionato',
				labelWidth: 150,
				fieldLabel:'Progetto da caricare',
				store: 'LoginProjects',
				queryMode: 'remote',
				displayField: 'name',
				valueField: 'id',
				editable: false,
				id: 'comboLoginProject',
				listeners: {
				},
			}
			],
			 listeners: {
                    render: me.loadData,
                },
        });
			

        me.callParent(arguments);
    },
	loadData: function() {
		var me = this;
		var user_id = this.user_id;
		var store = me.down('combobox').getStore();		
		store.getProxy().extraParams = {
			user_id: user_id
		};
		store.on('load',function() {
			me.down('combobox').setValue(store.getAt(0))});
        store.load();

	}

});
