Ext.define('SIO.view.submissions.edit.DataVIew', {
    extend: 'Ext.form.Panel',
    alias: 'widget.submissions.edit.dataview',

    requires: [
        'Ext.view.View',
        'SIO.ux.form.field.RestrictiveFile'
    ],

    title: 'Allegati',
    autoScroll: true,

    // spostati stile su file SASS, aggiunto pulsante per dare opinione su OpinionsGrid
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'dataview',
                    store: Ext.create('Ext.data.ArrayStore', {
                        fields: [
                            {name: 'label', type: 'string'},
                            {name: 'type', type: 'string'},
                            {name: 'name', type: 'string'}
                        ]
                    }),
                    cls: 'attachments-view',
                    emptyText: 'Nessun allegato caricato',
                    autoScroll: true,
                    tpl: [
                        '<tpl for=".">',
                            '<div class="thumb-wrap" id="attach_{id}">',
                                '<div class="thumb"><img src="resources/images/{type}.jpg" title="{label:htmlEncode}"></div>',
                                '<span class="x-editable">{label:htmlEncode}</span>',
                            '</div>',
                        '</tpl>',
                        '<div class="x-clear"></div>'
                    ],
                    itemSelector: 'div.thumb-wrap',
                    multiSelect: false,
                    overItemCls: 'x-item-over'
                }
            ],
            collapseFirst: false,
            tools: [
                {
                    type: 'minus',
                    tooltip: 'Rimuovi allegato',
                    itemId: 'removeAttachmentFieldButton'
                },
                {
                    type: 'plus',
                    tooltip: 'Aggiungi allegato',
                    itemId : 'uploadAttachmentFieldButton'
                }
            ]
        });

        me.callParent(arguments);
    }
});