Ext.define('SIO.view.submissions.UploadWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.submissions.uploadwindow',
    requires: [
        'SIO.ux.form.field.RestrictiveFile'
    ],

    title: 'Upload documenti',
    resizable: false,
    modal: true,
    draggable: false,
    autoShow: true,

    config: {
        record: null
    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            height: 135,
            items: [
                {
                    xtype: 'form',
                    padding: 5,
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Etichetta *',
                            labelAlign: 'left',
                            labelWidth: 90,
                            anchor: '100%',
                            maxLength: 50,
                            enforceMaxLength: true,
                            name: 'label',
                            itemId: 'label',
                            allowBlank: false
                        },
                        {
                            xtype: 'restfileupload',
                            buttonOnly: true,
                            formBind: true,
                            buttonConfig: {
                                text: 'Inserisci allegato',
                                scale: 'medium',
                                width: 265
                            },
                            accept: ['jpg','pdf'],
                            itemId: 'uploadAttachmentField',
                            name: 'attachment',
                            anchor: '100%',
                            margin: '20px 0px 0px 0px'
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});