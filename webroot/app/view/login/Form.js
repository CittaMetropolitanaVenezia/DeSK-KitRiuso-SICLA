Ext.define('SIO.view.login.Form', {
    extend: 'Ext.Window',
    alias: 'widget.login.form',
    requires: [
		'SIO.view.login.Loginprojectcombo'
    ],

    closable: false,
    width: 490,
    height: 275,
    autoShow: true,
    draggable: false,


    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            title: 'SI.C.L.A. Login',
            glyph: 61457,
            // glyph: parseInt(SIO.CONF.login.window.icon),
            items: [{
                xtype : 'box',
                width : 483,
                height : 135,
                html : '<img src="resources/login/header.png" />'
            }, me.getLoginForm()]
        });

        me.callParent(arguments);
    },

    onRender: function() {
        var me = this;
        // remove entry mask
        Ext.get('sio-loading').hide();
        Ext.get('sio-loading-mask').fadeOut({
            remove: false
        });
        me.callParent(arguments)
    },

    getLoginForm: function() {
        var me = this,
            form;
        form = Ext.create('Ext.form.FormPanel', {
            bodyStyle : 'background: #ffffff; padding:5px',
            defaultType : 'textfield',
            waitMsgTarget : true,
            frame : false,
            border : false,
            fieldDefaults: {
                msgTarget : 'side',
                labelWidth : 120,
                labelAlign: 'right',
                width: 310
            },
            items: [{
                xtype : 'textfield',
                fieldLabel : 'Username',
                blankText : 'Inserire lo username',
                name : 'data[User][username]',
                itemId : 'username',
                minLengthText : 'Lo username deve essere di almeno 6 caratteri',
                minLength : 4,
                maxLength : 50,
                allowBlank : false,
                validationEvent : false,
                listeners : {
                    scope : me,
                    specialkey : me.onEnter,
                    afterrender: function(field) {
                        setTimeout(function(){
                            field.bodyEl.dom.firstChild.focus();
                        }, 300)
                    }
                }
            },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                        xtype : 'textfield',
                        blankText : 'Inserire la password',
                        inputType : 'password',
                        name : 'data[User][password]',
                        itemId: 'password',
                        fieldLabel : 'Password',
                        minLengthText : 'La password deve essere di almeno 6 caratteri',
                        validationEvent : false,
                        allowBlank : false,
                        minLength : 4,
                        maxLength : 20,
                        listeners : {
                            scope : me,
                            specialkey : me.onEnter
                        }
                    }]
                }],
            buttons: me.getButtonsDefinition()
        });
        return form;
    },

    getButtonsDefinition: function() {
        var me = this,
            buttons = [];
        buttons.push({
            text : 'Login',
            action: 'login',
            scope : me,
            handler : me.loginSubmit,
            margin: '0 5 0 0',
            cls: 'btn-login'
        });
        buttons.push({
            text : 'Reset',
            action: 'reset',
            margin: '0 10 0 5',
            handler: function() {
                me.down('form').getForm().reset();
            },
            scope: me
        });
        return buttons;
    },

    /**
     * when keyboard ENTER key press
     * @param field
     * @param e
     */
    onEnter : function(field, e) {
        if (e.getKey() == e.ENTER) {
            this.loginSubmit();
        }
    },

    /**
     * Form Submit/Logon function
     */
    loginSubmit : function() {
        var me = this,
            formPanel = me.down('form'),
            form = formPanel.getForm(),
            usernameField = formPanel.down('#username'),
            remembermeField = formPanel.down('#rememberme'),
            params = form.getValues();
		
        // add remember me checkbox value
        if (remembermeField) {
            params.rememberme = remembermeField.getValue();
        } else {
            params.rememberme = false;
        }
        // form is valid?
        if (form.isValid()) {
            // mask the form
            me.getEl().mask('Invio credenziali...');			
            // make server call
            Ext.Ajax.request({
                url: 'users/login',
                params: params,
                success: function(response){
                    // parse server response
                    response = Ext.JSON.decode(response.responseText);
                    if (response.success === true) {
                        // show main loading mask
                        SIO.showLoadingMask();
                        // destroy this window
                        me.close();
						Ext.globalEvents.fireEvent('loggedinuser', response.data);
						SIO.hideLoadingMask();
                        // fire global event
                        //Ext.globalEvents.fireEvent('loggedin', response.data);
                    } else if (response.success === false) {
                        // unmask
                        me.getEl().unmask();
                        // OTP?
                        if (response.data.otp) {
                            // fire global event
                            Ext.globalEvents.fireEvent('passwordexpired', response.data.message);
                        } else {
                            // send user feedback
                            SIO.showNotification(response.message);
                            // set focus to username field
                            usernameField.focus(true);
                            // reset the form
                            form.reset();
                        }
                    }
                },
                failure: function() {
                    // unmask
                    me.getEl().unmask();
                    // send feedback
                    Ext.Msg.alert('Attenzione', 'Impossibile accedere in questo momento.<br />Riprovare pi&ugrave; tardi.')
                }
            });
        } else {
            // send user feedback
            SIO.showNotification('Compilare tutti i campi');
            // set focus to username field
            usernameField.focus(true);
        }
    }
});