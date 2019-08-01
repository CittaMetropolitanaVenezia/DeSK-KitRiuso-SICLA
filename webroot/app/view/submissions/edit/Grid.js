Ext.define('SIO.view.submissions.edit.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.submissions.edit.grid',
	requires: [
		'SIO.ux.grid.plugin.HeaderFilters',
		'SIO.ux.form.field.ClearableTextfield'
		],

    title: 'Enti/Comuni limitrofi coinvolti nell\'osservazione',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            selType: 'checkboxmodel',
            store: 'Towns',
			 plugins: [
                    Ext.create('SIO.ux.grid.plugin.HeaderFilters')
                ],
            columns: [
                { 
					draggable: false, 
					menuDisabled: true, 
					text: "Ente/Comune", 
					dataIndex: 'name', 
					flex: 1,  
					filter: {                          
							xtype: "clearabletextfield",
							   padding: '0 5 0 5'
					}
				}
            ]			
        });

        me.callParent(arguments);
    },
    getSelectedTownsId: function() {
        var me = this,
            selModel = me.getSelectionModel(),
            selection = selModel.getSelection(),
            ids = [];
        if (selection.length) {
            Ext.Array.each(selection, function(town) {
                ids.push(town.get('id'));
            });
        }
        // console.info(ids);
        return ids;
    }
});