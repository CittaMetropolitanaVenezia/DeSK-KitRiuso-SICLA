Ext.define('SIO.view.submissions.detail.OpinionsForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.submissions.detail.opinionsform',
    requires: [
    ],

    config: {
        submissionId: null
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },


    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            margin: '10 10 10 10',
            items: [
                {
                    xtype: 'container',
                    style: {
                        marginBottom: '10px'
                    },
                    layout: {
                        type: 'hbox',
                        pack: 'stretch'
                    },
                    defaults: {
                        xtype: 'button',
                        allowDepress: false,
                        enableToggle: true,
                        toggleGroup: 'opinion',
                        toggleHandler: me.setHiddenFieldValue,
                        flex: 1,
                        textAlign: 'left'
                    },
                    items: [
                        {
                            text: 'Accordo',
                            iconCls: 'icon-green-dot',
                            scale: 'medium',
                            itemId: 'agree',
                            //pressed:true,
                            value: 1,
                            name: 'opinion',
                            style: {
                                marginRight: '10px'
                            }
                        },{
                            text: 'Mancato accordo',
                            iconCls: 'icon-red-dot',
                            scale: 'medium',
                            itemId: 'disagree',
                            value: 2
                        },{
                            xtype: 'hiddenfield',
                            name: 'opinion',
                            itemId: 'opinion'
                        }
                    ]
                },{
                    xtype: 'textarea',
                    fieldLabel: 'Descrizione',
                    labelAlign: 'top',
                    flex: 1,
                    maxLength: 250,
                    enforceMaxLength: true,
                    name: 'description',
                    anchor: '100%'
                }
            ],
            bbar: [
                '->',
                {
                    text: 'Annulla',
                    glyph: 61540,
                    itemId: 'opinionsFormResetButton'
                },
                {
                    text: 'Salva',
                    glyph: 61639,
                    itemId: 'opinionsFormSaveButton'
                }
            ]
        });

        me.callParent(arguments);
    },

    /*
    * setto il valore del pulsante che è pressed sul campo hidden
    */
    setHiddenFieldValue: function(btn) {
        var me = this,
            opinionsForm = btn.up('[xtype=submissions.detail.opinionsform]');
       //solo di quello pressed setto il valore nel campo hidden
        if (btn.pressed) {
            opinionsForm.down('#opinion').setValue(btn.value);
        }
    }

});