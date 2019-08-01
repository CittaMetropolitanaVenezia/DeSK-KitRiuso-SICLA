/**
 * Abstract REST proxy
 */
Ext.define('SIO.proxy.Rest', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.baserest',
    format: 'json',
    limitParam: 'limit',
    startParam: 'offset',
    sortParam: 'order',
    filterParam: 'conditions',
    writer: {
        type: 'json',
        writeAllFields: false
    },
    reader: {
        type: 'json',
        root: 'data',
        totalProperty: 'count'
    },
    constructor: function() {
        this.callParent(arguments);
        this.setExtraParam('rest', 1);
    },
    afterRequest: function( request, success ) {
        var me = this;
        // fire requestcomplete event
        me.fireEvent( 'requestcomplete', request, success );
    }
});