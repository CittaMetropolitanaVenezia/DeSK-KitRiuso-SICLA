Ext.define('SIO.view.login.ChangePwd', {
    extend: 'Ext.Window',
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Hidden'
    ],

    closable: false,
    width: 490,
    height: 310,

    initComponent: function() {
        var me = this;

        Ext.apply(Ext.form.field.VTypes, {
            password: function(val, field) {
                if (field.initialPassField) {
                    var pwd = field.up('form').down('#' + field.initialPassField);
                    return (val == pwd.getValue());
                }
                return true;
            },
            passwordText: 'Password non coincidente'
        });

        Ext.apply(me, {
            title: 'Cambio password',
            glyph: 61457,
            items: [{
                xtype : 'box',
                width : 483,
                height : 135,
                html : '<img src="resources/login/header.png" />'
            },me.getLoginForm()]
        });

        me.callParent(arguments);
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
                width: 310,
                validationEvent : false,
                allowBlank : false,
                inputType : 'password'
            },

            items: [{
                xtype: 'hiddenfield',
                name: 'data[User][username]',
                itemId: 'username'
            }, {
                name: 'data[User][password]',
                itemId: 'password',
                fieldLabel : 'Password attuale',
                minLengthText : 'Lo username deve essere di almeno 6 caratteri',
                minLength : 6,
                maxLength : 50,
                listeners : {
                    scope : me,
                    specialkey : me.onEnter
                }
            }, {
                name: 'new_password',
                itemId: 'new_password',
                fieldLabel: 'Nuova password',
                minLengthText : 'Lo username deve essere di almeno 6 caratteri',
                minLength : 6,
                maxLength : 50,
                listeners : {
                    scope : me,
                    specialkey : me.onEnter,
                    afterrender: function(field) {
                        setTimeout(function(){
                            field.bodyEl.dom.firstChild.focus();
                        }, 300)
                    }
                }
            }, {
                name: 'confirm_new_password',
                itemId: 'confirm_new_password',
                fieldLabel: 'Conferma password',
                vtype: 'password',
                initialPassField: 'new_password',
                minLengthText : 'Lo username deve essere di almeno 6 caratteri',
                minLength : 6,
                maxLength : 50,
                listeners : {
                    scope : me,
                    specialkey : me.onEnter
                }
            }],
            buttons: me.getButtonsDefinition()
        });
        return form;
    },

    getButtonsDefinition: function() {
        var me = this,
            buttons = [];
        buttons.push('->');
        buttons.push({
            text : 'Cambia',
            action: 'change',
            scope : me,
            handler : me.changeSubmit,
            margin: '0 5 0 0'
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
            this.changeSubmit();
        }
    },

    /**
     * Form Submit/Logon function
     */
    changeSubmit : function() {
        var me = this,
            formPanel = me.down('form'),
            form = formPanel.getForm(),
            newPasswordField = formPanel.down('#new_password'),
            confirmNewPasswordField = formPanel.down('#confirm_new_password'),
            params = form.getValues();

        if (form.isValid()) {
            // mask the form
            me.getEl().mask('Invio credenziali...');
            // make server call
            Ext.Ajax.request({
                url: 'users/changepwd',
                params: params,
                success: function(response){
                    // unmask
                    me.getEl().unmask();
                    // parse server response
                    response = Ext.JSON.decode(response.responseText);
                    if (response.success === true) {
                        Ext.Msg.alert('Successo', 'Password aggiornata con successo!<br />Torno al login..', function() {
                            // show main loading mask
                            SIO.showLoadingMask();
                            // destroy this window
                            me.close();
                            // fire global event
                            Ext.create('SIO.view.login.Form');
							SIO.hideLoadingMask();
                        });
                    } else if (response.success === false) {
                        // send user feedback
                        SIO.showNotification(response.message);
                        // reset fields
                        newPasswordField.setValue('');
                        confirmNewPasswordField.setValue('');
                        // set focus to username field
                        newPasswordField.focus(true);
                    }
                },
                failure: function() {
                    // unmask
                    me.getEl().unmask();
                    // send user feedback
                    SIO.showNotification('Impossibile accedere in questo momento, riprovare più tardi.');
                    // set focus to username field
                    newPasswordField.focus(true);
                }
            });
        } else {
            // send user feedback
            SIO.showNotification('Errori nel modulo, controllare.');
            // set focus to username field
            usernameField.focus(true);
        }
    }

});