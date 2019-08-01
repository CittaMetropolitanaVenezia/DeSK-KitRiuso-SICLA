Ext.define('SIO.view.submissions.TownsCombo', {
    extend: 'SIO.ux.form.field.ClearableComboBox',
    alias: 'widget.submissions.townscombo',

    store: 'Towncombos',
    valueField: 'id',
    displayField: 'name',
    emptyText: 'Seleziona Ente/Comune',
    forceSelection: true,
    queryMode: 'local',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            listeners: {
                select: me.onSelect,
                scope: me,
				render: me.loadData
            }
        });

        me.callParent(arguments);
    },

    onChange: function(newValue) {
        var me = this;

        if (Ext.isEmpty(newValue)) {
            // reset this combo
            Ext.getStore('Submissions').clearFilter();
            // reset grid towns filters
            var tb = me.up('grid').down('[xtype=submissions.townsfiltertoolbar]');
            tb.reset();
            tb.hide();
            // reset grid status filters
            var tb = me.up('grid').down('[xtype=submissions.statusesfiltertoolbar]');
            tb.reset();
        }

        me.callParent(arguments);
    },
	loadData: function(){
		    var me = this;

        me.getStore().load();
	},

    // TODO: spostare su controller
    onSelect: function(combo, records) {
        var me = this,
            submissionsStore = Ext.getStore('Submissions');
        if (records.length) {
            // zoom the map to selected town
            Ext.ComponentQuery.query('[xtype=submissions.map]')[0].zoomToBoundsArray(records[0].get('bounds'));
            submissionsStore.clearFilter(true);
            submissionsStore.filter('town_id', me.getValue());
            // enablee towns filter toolbar
            me.up('grid').down('[xtype=submissions.townsfiltertoolbar]').show();
        }
    }

});