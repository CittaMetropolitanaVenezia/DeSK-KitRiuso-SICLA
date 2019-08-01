Ext.define('SIO.view.submissions.edit.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.submissions.edit.form',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'textarea',
                    fieldLabel: 'Descrizione',
                    labelAlign: 'top',
                    margin: '5px 10px 0px 10px',
                    itemId: 'description',
                    anchor: '100%',
                    height: 150
                }
            ]
        });

        me.callParent(arguments);
    }
});