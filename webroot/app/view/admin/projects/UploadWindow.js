Ext.define('SIO.view.admin.projects.UploadWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.admin.projects.uploadwindow',
    requires: [
        'SIO.ux.form.field.RestrictiveFile'
    ],

    title: 'Upload immagine',
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
            height: 150,
			html: "<div style='padding-bottom: 5px; padding-top: 5px; padding-left:5px'> Formati validi: <b>png & jpg</b> <br> Dimensioni consigliate: <b>16x16</b></div>",
            items: [
                {
                    xtype: 'form',
                    //padding: 5,
                    items: [
                        {
                            xtype: 'restfileupload',
                            buttonOnly: true,
                            formBind: true,
                            buttonConfig: {
                                text: 'Inserisci immagine',
                                scale: 'medium',
                                width: 265
                            },
                            accept: ['jpg','png'],
                            itemId: 'uploadAttachmentField',
                            name: 'image',
                            margin: '20px 0px 0px 0px'
                        }
                    ]
                },

            ]
        });

        me.callParent(arguments);
    }
});