Ext.define('SIO.view.submissions.Grid', {
    extend: 'Ext.grid.Panel',
    // extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.grid',
    requires: [
        'SIO.view.submissions.TownsCombo',
        'SIO.view.submissions.TownsFilterToolbar',
        'SIO.view.submissions.StatusesFilterToolbar'
    ],

    title: 'Elenco Osservazioni',

    layout: 'fit',
    emptyText: 'Nessun risultato trovato',


    viewConfig: {
        markDirty: false
    },

    config: {

    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            store: 'Submissions',
            listeners: {
                select: function(grid, selected) {
                    var layer = selected.raw,
                        map = layer._map;
                    map.zoomToLayer(layer, true);
                }
            },
            columns: [

                {
                    text: "Stato",
                    draggable: false,
                    width: 50,
                    xtype: 'actioncolumn',
                    dataIndex: 'opinions_status',
                    renderer: function(v, metadata, r) {
                        var t = '- <b>' + metadata.record.get('opinions_needed') + '</b>';
                        if (metadata.record.get('opinions_needed') > 1 || metadata.record.get('opinions_needed') == 0) {
                            t += ' opinioni richieste<br />';
                        } else {
                            t += ' opinione richiesta<br />';
                        }
                        t += '- <b>' + metadata.record.get('opinions_given') + '</b>';
                        if (metadata.record.get('opinions_given') > 1 || metadata.record.get('opinions_given') == 0) {
                            t += ' opinioni ricevute';
                        } else {
                            t += ' opinione rivevuta';
                        }

                        if (v == 1) {
                            metadata.tdAttr = 'data-qtip="In discussione<br />' + t + '"';
                        } else if (v == 2) {
                            metadata.tdAttr = 'data-qtip="Mancato accordo<br />' + t + '"';
                        } else {
                            metadata.tdAttr = 'data-qtip="Accordo<br />' + t + '"';
                        }
                    },
                    items: [
                        {
                            getClass: function(v, metadata, record){
                                if (v == 1) {
                                    return 'x-grid-center-icon icon-yellow-dot';
                                } else if (v == 2) {
                                    return 'x-grid-center-icon icon-red-dot';
                                } else {
                                    return 'x-grid-center-icon icon-green-dot';
                                }
                            }
                        }
                    ]
                },
                { draggable: false, text: "Ente/Comune proponente", flex: 1, dataIndex: 'from_town_name' },
                { width: 90, draggable: false, text: "Data", renderer: Ext.util.Format.dateRenderer('d/m/Y'), dataIndex: 'created' },
                {
                    width: 30,
                    sortable: false,
                    draggable: false,
                    menuDisabled: true,
                    xtype: 'actioncolumn',
                    dataIndex: 'is_owner',
                    renderer: function(v, metadata, r) {
                        if (v || SIO.Settings.isProvince()) {
                            metadata.tdAttr = 'data-qtip="Visualizza dettaglio osservazione"';
                        } else {
                            metadata.tdAttr = 'data-qtip="Partecipa alla discussione"';
                        }
                    },
                    items: [
                        {
                            handler: function(grid, rowIndex, colIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                Ext.globalEvents.fireEvent('viewsubmission', record);
                            },
                            getClass: function(v, metadata, record) {
                                if (v || SIO.Settings.isProvince()) {
                                    return 'icon-document';
                                } else {
                                    return 'icon-document-edit';
                                }
                            }
                        }
                    ]
                }
                /*
                {
                    width: 30,
                    sortable: false,
                    draggable: false,
                    menuDisabled: true,
                    xtype: 'actioncolumn',
                    dataIndex: 'is_owner',
                    renderer: function(v, metadata, r) {
                        if (v) {
                            metadata.tdAttr = 'data-qtip="Elimina segnalazione"';
                        }
                    },
                    items: [
                        {
                            handler: function(grid, rowIndex, colIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                Ext.globalEvents.fireEvent('deletesubmission', record);
                            },
                            getClass: function(v, metadata) {
                                if (v) {
                                    return 'icon-red-cross';
                                }
                            }
                        }
                    ]
                }
                */
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    docked: 'top',
                    hidden: SIO.Settings.isTown(),
                    items: [
                        {
                            xtype: 'submissions.townscombo',
                            flex: 1
                        }
                    ]
                },
                {
                    //docked: 'top',
                    xtype: 'submissions.townsfiltertoolbar',
                    hidden: SIO.Settings.isProvince()
                },
                {
                    xtype: 'submissions.statusesfiltertoolbar'
                }
            ]
        });

        me.callParent(arguments);
    },

    configureTownFiltersToolbar: function() {
        var me = this;
        // if (SIO.Settings.user.can('status.filter')) {
            return {
                xtype: 'toolbar',
                docked: 'top',
                defaults: {
                    allowDepress: false,
                    toggleGroup: 'towns'
                },
                items: [
                    {
                        text: 'Tutte',
                        pressed: true,
                        glyph: 61453,
                        width: 80,
                        itemId: 'townFilterAll'
                    },
                    {
                        text: 'Questo Ente/Comune',
                        glyph: 61542,
                        tooltip: 'Visualizza osservazioni proposte da questo Ente/Comune',
                        flex: 1
                    },
                    {
                        text: 'Confinanti',
                        glyph: 61541,
                        tooltip: 'Visualizza osservazioni proposte da comuni confinanti',
                        flex: 1
                    }
                ]
            }
        // }
    },

    configureStatusFiltersToolbar: function() {
        var me = this;
        // if (SIO.Settings.user.can('status.filter')) {
        return {
            xtype: 'toolbar',
            docked: 'top',
            defaults: {
                allowDepress: false,
                toggleGroup: 'statuses'
            },
            items: [
                {
                    text: 'Tutte',
                    pressed: true,
                    glyph: 61453,
                    width: 80,
                    itemId: 'statusFilterAll'
                },
                {
                    iconCls: 'icon-red-dot',
                    tooltip: 'Mancato accordo'
                },
                {
                    iconCls: 'icon-yellow-dot',
                    tooltip: 'In discussione'
                },
                {
                    iconCls: 'icon-green-dot',
                    tooltip: 'Accordo'
                }
            ]
        }
        // }
    }
});