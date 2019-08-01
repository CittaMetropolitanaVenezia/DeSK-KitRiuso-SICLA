Ext.define('SIO.view.submissions.edit.UploadForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.submissions.edit.uploadform',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Etichetta *',
                labelAlign: 'left',
                margin: '5px 10px 0px 10px',
                width: 265,
                maxLength: 50,
                enforceMaxLength: true,
                name: 'label',
                allowBlank: false
            },{
                xtype: 'restfileupload',
                buttonOnly: true,
                formBind: true,
                margin: '20px 10px 0px 10px',
                buttonConfig: {
                    text: 'Inserisci allegato',
                    scale: 'medium',
                    width: 265
                },
                accept: ['jpg','pdf'],
                itemId: 'uploadAttachmentField',
                name: 'attachment'
            }]
        });

        me.callParent(arguments);
    }
});