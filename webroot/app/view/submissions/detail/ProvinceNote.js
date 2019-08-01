Ext.define('SIO.view.submissions.detail.ProvinceNote', {
    extend: 'Ext.window.Window',
    alias: 'widget.submissions.detail.provincenote',

    requires:[

    ],

    title: 'Note all\'osservazione',
    glyph: 61504,
    width: 500,
    height: 246,
    modal: true,
    layout: 'fit',

    config: {
        opener: null,
        record: null
    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'form',
                    items: [
                        {
                            xtype: 'textareafield',
                            name: 'province_note',
                            anchor: '100%',
                            rows: 10,
                            margin: 5,
                            allowBlank: false
                        },
                        {
                            xtype: 'hiddenfield',
                            name: 'id'
                        }
                    ],
                    buttons: [
                        {
                            text: 'Salva modifiche',
                            formBind: true, //only enabled once the form is valid
                            disabled: true,
                            handler: me.updateNote,
                            scope: me
                        }
                    ]
                }
            ],
            listeners: {
                afterrender: function() {
                    me.down('form').getForm().setValues(me.getRecord().data);
                },
                scope: me
            }

        });

        me.callParent(arguments);
    },

    updateNote: function() {
        var me = this,
            values = me.down('form').getValues();
        // mask the window
        me.el.mask('Salvataggio in corso');
        // make server call
        SIO.Utilities.confirm('Agggiornare le note?', 'Conferma', function(btn) {
            if (btn == 'yes') {
                SIO.Services.updateProvinceNote(values, function(response) {
                    // unmask the window
                    me.el.unmask();
                    if (response.result.success) {
                        // update opener record
                        me.getOpener().getRecord().set('province_note', values.province_note);
                        // close the window
                        me.close();
                    } else {
                        // send feedback
                        SIO.Utilities.alert('Errore', 'Impossibile aggiornare le note in questo momento.<br />Riprovare pi&ugrave; tardi.');
                    }
                }, function() {
                    // unmask the window
                    me.el.unmask();
                    // send feedback
                    SIO.Utilities.alert('Errore', 'Impossibile aggiornare le note in questo momento.<br />Riprovare pi&ugrave; tardi.');
                });
            }
        });
    }
});
