Ext.define('SIO.Application', {
    name: 'SIO',

    extend: 'Ext.app.Application',
    requires: [
        'SIO.util.ServicesFactory',
        'SIO.util.Settings',
        'SIO.util.Utilities',
        'SIO.util.Logger',
        'SIO.util.Labels',

        'SIO.ux.window.Notification',
        'SIO.ux.panel.GlyphTool',

        'Ext.grid.*',
        'Ext.layout.container.Border',
        'Ext.layout.container.Card',
        'Ext.ux.RowExpander'
    ],

    views: [
        'SIO.view.Viewport',
        'SIO.view.login.Form',
        'SIO.view.login.ChangePwd',
        'SIO.view.admin.Panel',
    ],

    controllers: [
        'Login',
        'Main',
        'Submissions',
        'Admin'
    ],

    stores: [
        'Submissions',
        'Towns',
        'Opinions',
        'Attachments',
        'Users',
		'Projects',
		'Associations',
		'bindedProjects',
		'BaseLayers',
		'OverlayLayers',
		'LoginProjects',
		'Townprojects',
		'Bindedtownprojects',
		'Towncombos'
    ],

    /**
     * before the launch
     */
    init: function() {
        var me = this;
        // set logger
        log = SIO.util.Logger.log;
        // set label translator
        __ = SIO.util.Labels.label;
        // set glyph family
        Ext.setGlyphFontFamily('FontAwesome');
        //extend vtype
        me.extendVTypes();
        // init shortcuts
        me.initShortcuts();
        // disable mouse right button
        Ext.getBody().on('contextmenu', Ext.emptyFn, null, {preventDefault: true});
    },

    /**
     * launch is called immediately upon availability of our app
     */
    launch: function() {
        var me = this;
        // load configuration
        SIO.Services.checksession(function(response) {
            if (response && response.data && response.data.loggedin) {
                // fire global event
                Ext.globalEvents.fireEvent( 'loggedin', response.data);
            } else {
                // create login panel
                Ext.create('SIO.view.login.Form');
            }
        });
    },

    /**
     * Assign app shortcuts
     * @param response
     */
    initShortcuts: function(response) {
        var me = this;
        // set mask and unmask helpers
        SIO.mask = me.maskApp;
        SIO.unmask = me.unmaskApp;
        SIO.showLoadingMask = me.showLoadingMask;
		SIO.hideLoadingMask = me.hideLoadingMask;
        // set submissions map helpers (coming from map popups)
        SIO.viewSubmission = me.viewSubmission;
        // set notification helper
        SIO.showNotification = me.showNotification;
    },

    mask: function(msg) {
        Ext.getBody().mask(msg || 'Attendere...');
    },

    unmask: function() {
        Ext.getBody().unmask();
    },

    showLoadingMask: function() {
        Ext.get('sio-loading-mask').show();
        Ext.get('sio-loading').show();
    },
	
	hideLoadingMask: function() {
        Ext.get('sio-loading-mask').hide();
        Ext.get('sio-loading').hide();
    },

    /**
     * Show toast notification
     * @param msg
     * @param position
     */
    showNotification: function(msg, position, duration) {
        Ext.create('SIO.ux.window.Notification', {
            title: 'Notifica',
            position: position || 'b',
            padding: 10,
            border: false,
            useXAxis: true,
            glyph: 61546,
            bodyPadding: 10,
            slideInDuration: 800,
            slideBackDuration: 1500,
            autoCloseDelay: duration || 4000,
            slideInAnimation: 'elasticIn',
            slideBackAnimation: 'elasticIn',
            closable: false,
            spacing: 20,
            width: 250,
            html: msg || __('success')
        }).show();
    },

    viewSubmission: function(id) {
        // find record
        var record = Ext.getStore('Submissions').getById(id);
        if (record) {
            Ext.globalEvents.fireEvent('viewsubmission', record);
        }
    },

    extendVTypes: function() {

        Ext.apply(Ext.form.field.VTypes, {
            daterange: function(val, field) {
                var date = field.parseDate(val);

                if (!date) {
                    return false;
                }
                if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
                    var start = field.up('form').down('#' + field.startDateField);
                    start.setMaxValue(date);
                    start.validate();
                    this.dateRangeMax = date;
                }
                else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
                    var end = field.up('form').down('#' + field.endDateField);
                    end.setMinValue(date);
                    end.validate();
                    this.dateRangeMin = date;
                }
                /*
                 * Always return true since we're only using this vtype to set the
                 * min/max allowed values (these are tested for after the vtype test)
                 */
                return true;
            },

            daterangeText: 'La data partenza è successiva a quella di fine validà'
        });

    }
});
