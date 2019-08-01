Ext.define("SIO.util.Labels", {
    singleton: true,

    label: function(key) {
        var labels = SIO.Labels;
        // split keys
        var keys = key.split('.');
        var value = labels[key] || '*'+key+'*';
        for (var i=0; i<keys.length; i++) {
            if (i > 0) {
                if (value[keys[i]]) {
                    value = value[keys[i]];
                } else return '*'+key+'*';
            } else {
                if (labels[keys[i]]) {
                    value = labels[keys[i]];
                } else return '*'+key+'*';
            }
        }
        // return value.replace(/ /g, '&nbsp;');
        return value;
    }
});