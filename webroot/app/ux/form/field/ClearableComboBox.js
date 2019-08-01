Ext.define('SIO.ux.form.field.ClearableComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.clearablecombobox',


    trigger2Cls: 'x-form-clear-trigger',


    initComponent: function() {
        var me = this;


        me.callParent(arguments);
    },


    onTrigger2Click: function(event) {
        var me = this;
        me.clearValue();
    }


});