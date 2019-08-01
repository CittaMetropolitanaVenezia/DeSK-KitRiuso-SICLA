Ext.define('SIO.view.submissions.detail.OpinionsGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.submissions.detail.opinionsgrid',

    requires: [

    ],

    emptyText: 'Nessun parere trovato',
    //cls: 'opinions-grid',

    viewConfig: {
        markDirty: false
    },

    config: {

    },

   plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl : new Ext.XTemplate(
            '<b>Motivazioni relative al parere:</b><br />{description}'
        )
    }],

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            store: 'Opinions',
            title: 'Pareri enti/comuni coinvolti',
            sortableColumns: false,

            columns: [

                { draggable: false, menuDisabled: true, text: "Ente/Comune coinvolto", flex: 1, dataIndex: 'town_name' },
                {
                    draggable: false,
                    menuDisabled: true,
                    width: 90,
                    text: "Data",
                    dataIndex: 'modified',
                    renderer: function(value, metadata, record) {
                        if (record.get('opinion') > 0) {
                            return Ext.Date.format(value, 'd-m-Y');
                        }
                    }
                },{
                    draggable: false,
                    menuDisabled: true,
                    text: "Parere",
                    flex: 1,
                    dataIndex: 'opinion',
                    renderer: function(value) {
                        if (value == 0) {
                            return "In attesa di risposta"
                        } else if (value == 1) {
                            return 'Accordo';
                        } else {
                            return 'Mancato accordo';
                        }
                    }
                },{
                    text: "Stato",
                    draggable: false,
                    width: 50,
                    xtype: 'actioncolumn',
                    dataIndex: 'opinion',
                    items: [
                        {
                            getClass: function(v, metadata, record){
                                if (v == 0) {
                                    return 'x-grid-center-icon icon-gray-dot default-cursor';
                                } else if (v == 1) {
                                    return 'x-grid-center-icon icon-green-dot default-cursor';
                                } else {
                                    return 'x-grid-center-icon icon-red-dot default-cursor';
                                }
                            }
                        }
                    ]
                }
            ],
            bbar:[
                {
                    text: 'Apri lo storico',
                    itemId: 'historyOpinionsButton',
                    glyph: 61463
                },
                '->',
                {
                    text: 'Dai un parere',
                    margin: 0,
                    cls: 'btn-red',
                    glyph: 61504,
                    hidden: true,
                    itemId: 'addOpionionBtn'
                }
            ]
        });

        me.callParent(arguments);
    }
});