Ext.define('SIO.ux.panel.GlyphTool', {
    extend: 'Ext.panel.Tool',
    alias: 'widget.glyphtool',
    type: '0xf0c9',//default

    renderTpl: ['<span role="img" id="{id}-toolEl" class="x-btn-icon-el  x-btn-glyph x-menu-tool" unselectable="on" style="font-family:FontAwesome; color: {color};">&#{glyph}</span>'],

    initComponent: function() {
        var me = this,
            glyphParts;
        me.callParent();

        if (typeof me.type === 'string') {
            glyphParts = me.type.split('@');
            me.type = glyphParts[0];
        }

        Ext.applyIf(me.renderData, {
            baseCls: me.baseCls,
            blank: Ext.BLANK_IMAGE_URL,
            glyph: me.type,
            color: me.color || 'white'
        });
    }

});
