Ext.define('SIO.view.submissions.detail.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.detail.panel',
    requires: [
        'SIO.view.submissions.detail.OpinionsGrid',
        'SIO.view.submissions.detail.OpinionsHistoryGrid',
        'SIO.view.submissions.detail.OpinionsForm',
        'SIO.view.submissions.detail.AttachmentsDataView',
        'SIO.view.submissions.detail.ProvinceNote'
    ],

    config: {
        record: null
    },

    layout: 'border',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'form',
                    region: 'north',
                    padding: 5,
                    style: 'background-color: white;',
                    defaults: {
                        layout: 'hbox',
                        anchor: '100%'
                    },
                    items: [{
                        xtype: 'container',
                        defaultType: 'displayfield',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 10 0'
                        },
                        items: [,{
                            fieldLabel: 'Proponente',
                            flex: 1,
                            name: 'from_town_name'
                        }]
                    },{
                        xtype: 'container',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 5 0'
                        },
                        items: [{
                            fieldLabel: 'Data',
                            flex: 2,
                            xtype: 'datefield',
                            name: 'created'
                        }]
                    },{
                        xtype: 'container',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 5 0'
                        },
                        items: [{
                            fieldLabel: 'Pareri richiesti',
                            flex: 1,
                            name: 'opinions_needed'
                        },{
                            fieldLabel: 'Pareri ottenuti',
                            flex: 1,
                            name: 'opinions_given'
                        }]
                    },{
                        xtype: 'container',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 10 0'
                        },
                        items: [{
                            fieldLabel: 'Attuale stato',
                            flex: 1,
                            name: 'opinions_status',
                            listeners: {
                                change: function(el,v) {
                                    //sospendo evento change
                                    el.suspendEvent('change');
                                    //cambio etichetta a seconda del valore intero
                                    if (v == 1) {
                                        el.setValue('in discussione');
                                    }
                                    else if (v == 2) {
                                        el.setValue('mancato accordo');
                                    }
                                    else if (v == 3) {
                                        el.setValue('in accordo');
                                    }
                                    //ripristino evento
                                    el.resumeEvent('change');
                                }
                            }
                        }]
                    },{
                        xtype: 'container',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 10 0'
                        },
                        items: [{
                            fieldLabel: 'Descrizione',
                            flex: 1,
                            xtype: 'textarea',
                            name: 'description'
                        }]
                    },{
                        xtype: 'container',
                        hidden: SIO.Settings.isTown(),
                        margin: '-5 10 5 0',
                        items: [
                            {
                                xtype: 'button',
                                text: 'Note (Città Metropolitana / Provincia MB)',
                                cls: 'btn-blue',
                                glyph: 61504,
                                handler: function() {
                                    Ext.widget('submissions.detail.provincenote', {
                                        record: me.getRecord(),
                                        opener: me
                                    }).show();
                                },
                                scope: me
                            },
							{
								xtype: 'button',
								text: 'Cancella',
								cls: 'btn-red',
								glyph: 61453,
								handler: function(btn) {
									Ext.globalEvents.fireEvent('deletesubmission',me.getRecord(), btn);
								},
							}
                        ]
                    }]
                },{
                    xtype: 'submissions.detail.opinionsgrid',
                    region: 'center'
                },{
                    xtype: 'submissions.detail.attachmentsdataview',
                    itemId: 'attachmentsPanel',
                    region: 'south',
                    collapsed: true,
                    collapsible: true,
                    height: 150
                }
            ],
            /*
            buttons: [
                {
                    text: 'Chiudi',
                    glyph: 61714,
                    handler: function(btn) {
                        Ext.globalEvents.fireEvent('closesubmission', me, btn);
                    },
                    scope: me
                }
            ],
            */
            tools: [
                {
                    xtype: 'button',
                    text: 'Chiudi',
                    glyph: 61714,
                    handler: function(btn) {
                        Ext.globalEvents.fireEvent('closesubmission', me, btn);
                    },
                    scope: me,
                    width: 90
                }
            ],
            title: 'Osservazione',
            header: {
                padding: '6px 5px 6px 10px'
            },
            listeners: {
                activate: me.onActivate
            }
        });

        me.callParent(arguments);
    },

    onActivate: function() {
        var me = this,
            date = me.getRecord().get('created'),
            attachmentsPanel = me.down('#attachmentsPanel');
        // change title
        me.setTitle('Osservazione ID:' + me.getRecord().get('id') + ' del ' + Ext.Date.format(new Date(date), 'd-m-Y'));
        // collapse attachments panel
        attachmentsPanel.collapse('bottom', false);
        if (me.getRecord().get('is_owner') && SIO.Settings.isTown()) {
            attachmentsPanel.showTools();
        } else {
            attachmentsPanel.hideTools();
        }
    }
});