Ext.define('SIO.util.Logger', {
    singleton: true,
    active: false,

    log: function(msg, obj) {
        if (SIO.util.Logger.active) {
            if (obj) {
                console.log(msg, obj);
            } else {
                console.info(msg);
            }
        }
    },

    constructor: function() {
        try {
            if (devMode) this.active = devMode
        } catch(e) {}
    }
});