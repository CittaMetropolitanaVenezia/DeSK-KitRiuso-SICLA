Ext.define('SIO.view.submissions.TownsFilterToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.submissions.townsfiltertoolbar',

    config: {
        buttonValue: 0,
        filter: null
    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            defaults: {
                allowDepress: false,
                toggleGroup: 'towns',
                handler: me.buttonHandler,
                scope: me
            },
            items: [
                {
                    text: 'Tutte',
                    pressed: true,
                    glyph: 61453,
                    width: 70,
                    itemId: 'all',
                    value: 0
                },
                {
                    text: 'Proposte da questo Ente/Comune',
                    glyph: 61542,
                    tooltip: 'Visualizza osservazioni proposte da questo Ente/Comune',
                    flex: 1,
                    value: 1
                }
            ]
        });

        me.callParent(arguments);
    },

    reset: function() {
        var me = this,
            allButton = me.down('#all');
        allButton.toggle(true);
    },

    buttonHandler: function(button) {
        var me = this,
            filter = null;
        if (button.value != me.getButtonValue()) {
            var submissionsStore = Ext.getStore('Submissions');
            // remove previous filters (if present)
            if (me.getFilter()) {
                // submissionsStore.removeFilter(me.getFilter(), button.value == 0);
                // submissionsStore.removeFilter(me.getFilter());
                submissionsStore.filters.removeAtKey(me.getFilter());
                if (button.value == 0) {
                    submissionsStore.load();
                }
            }
            if (button.value > 0) {
                // set filter id
                filter = Ext.id();
                // filter the store
                submissionsStore.filter([
                    Ext.create('Ext.util.Filter', {
                        id: filter,
                        property: 'is_owner',
                        value: true,
                        root: 'data'
                    })
                ]);
            }
            me.setFilter(filter);
            me.setButtonValue(button.value);
        }
    }

});