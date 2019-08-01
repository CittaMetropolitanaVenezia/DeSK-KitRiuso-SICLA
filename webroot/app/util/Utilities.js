Ext.define('SIO.util.Utilities', {
    singleton: true,
    alternateClassName : ['SIO.Utilities'],

    msgBox: null,

    confirm: function(message, title, callback) {
        var t = msg = '',
            cb = null;
        if (arguments.length == 1) {
            t = 'Attenzione';
            msg = title;
        } else {
            t = title;
            msg = message;
            cb = callback;
        }
        if (msg) {
            // Ext.device.Notification.show({
            this.msgBox = Ext.Msg.show({
                title: t,
                msg: msg,
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                // callback: cb
                fn: cb,
                listeners: {
                    hide: function(msgBox) {
                        SIO.Utilities.msgBox = null;
                    }
                }
            });
        }
    },

    alert: function(title, message, callback) {
        var t = msg = '',
            cb = null;
        if (arguments.length == 1) {
            t = 'Attenzione';
            msg = title;
        } else {
            t = title;
            msg = message;
            cb = callback;
        }
        if (msg) {
            // Ext.device.Notification.show({
            this.msgBox = Ext.Msg.show({
                title: t,
                msg: msg,
                buttons: Ext.MessageBox.OK,
                // callback: cb
                fn: cb,
                listeners: {
                    hide: function(msgBox) {
                        SIO.Utilities.msgBox = null;
                    }
                }
            });
        }
    }
});