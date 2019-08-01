Ext.define('SIO.view.submissions.detail.OpinionsHistoryGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.submissions.detail.opinionshistorygrid',
    requires: [

    ],

    layout: 'fit',
    emptyText: 'Nessun parere precedente trovato',

    viewConfig: {
        markDirty: false,
        forceFit: true
    },

    config: {
        submissionId : null
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

            store: Ext.create('SIO.store.Opinions'),
            frame: false,
            sortableColumns: false,
            listeners: {
                render: me.loadData
            },

            columns: [

                { draggable: false, menuDisabled: true, text: "Ente/Comune coinvolto", flex: 1, dataIndex: 'town_name' },
                { draggable: false, menuDisabled: true, width: 150, text: "Data", xtype: 'datecolumn', format: 'd-m-Y H:i:s', dataIndex: 'modified' },
                { draggable: false, menuDisabled: true, text: "Parere", flex: 1, dataIndex: 'opinion', renderer: function(value) {
                    if (value == 1) {
                        return 'accordo';
                    }
                    else {
                        return 'mancato accordo';
                    }
                }
                },{
                    text: "Stato",
                    draggable: false,
                    width: 70,
                    xtype: 'actioncolumn',
                    dataIndex: 'opinion',
                    items: [
                        {
                            getClass: function(v, metadata, record){
                                if (v == 1) {
                                    return 'x-grid-center-icon icon-green-dot';
                                } else {
                                    return 'x-grid-center-icon icon-red-dot';
                                }
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    /*
    * carico i dati delle vecchie opinioni
     */
    loadData: function() {
        var me = this;
            gridStore = me.getStore();
        //filtro lo store con last false e submision_id coerente
        gridStore.filter([
            {property: 'submission_id' , value: me.getSubmissionId()},
            {property: 'last', value: false},
            {property: 'history', value: 1 }
        ]);

    }
});