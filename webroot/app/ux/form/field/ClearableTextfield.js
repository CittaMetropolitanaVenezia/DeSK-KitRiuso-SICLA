Ext.define('SIO.ux.form.field.ClearableTextfield', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.clearabletextfield',

    initComponent: function () {
        var me = this;

        me.triggerCls = 'x-form-clear-trigger'; // native ExtJS class & icon

        // add trigger event
        me.addEvents({
            empty: true
        });

        me.callParent(arguments);
    },

    // override onTriggerClick
    onTriggerClick: function() {
        this.setValue('');
    }
});