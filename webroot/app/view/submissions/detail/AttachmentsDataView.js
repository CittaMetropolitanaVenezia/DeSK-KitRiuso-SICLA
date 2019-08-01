Ext.define('SIO.view.submissions.detail.AttachmentsDataView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.detail.attachmentsdataview',
    requires: [
        'Ext.view.View',
        'SIO.view.submissions.UploadWindow'
    ],

    config: {

    },

    title: 'Allegati',
    autoScroll: true,

    // spostati stile su file SASS, aggiunto pulsante per dare opinione su OpinionsGrid
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'dataview',
                    cls: 'attachments-view',
                    store: 'Attachments',
                    emptyText: 'Nessun allegato caricato',
                    autoScroll: true,
                    tpl: [
                        '<tpl for=".">',
                            '<div data-qtip="Doppio click per aprire" class="thumb-wrap" id="attach_{id}">',
                                '<div class="thumb"><img src="resources/images/{type}.jpg"></div>',
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
                    itemId: 'removeAttachmentFieldButton',
                    hidden: true
                },
                {
                    type: 'plus',
                    tooltip: 'Aggiungi allegato',
                    itemId : 'uploadAttachmentFieldButton',
                    hidden: true
                }
            ]
        });

        me.callParent(arguments);
    },

    showTools: function() {
        var me = this;
        me.down('#removeAttachmentFieldButton').show();
        me.down('#uploadAttachmentFieldButton').show();
    },

    hideTools: function() {
        var me = this;
        me.down('#removeAttachmentFieldButton').hide();
        me.down('#uploadAttachmentFieldButton').hide();
    },

    onRender: function() {
        var me = this,
            store = me.down('dataview').getStore();
        // add attachments count on panel title
        store.on('load', function() {
            var count = store.getCount(),
                title = 'Allegati';
            if (count) {
                title += ' (' + count + ')';
            }
            me.setTitle(title);
        }, me);

        me.callParent(arguments);
    }
});