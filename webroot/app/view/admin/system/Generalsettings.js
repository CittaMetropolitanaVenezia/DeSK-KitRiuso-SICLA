Ext.define('SIO.view.admin.system.Generalsettings', {
    extend: 'Ext.form.Panel',
    alias: 'widget.admin.system.generalsettings',
	admin_params: null,
    requires:[
        'Ext.form.FieldSet',
        'SIO.ux.form.field.HelpText',
        'Ext.form.FieldContainer'
    ],

    title: 'Impostazioni Generali',
    glyph: 61459,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    autoScroll: true,

    config: {
        defaultValues: null
    },

    initComponent: function() {
		
        var me = this;
        Ext.apply(me, {
            tools: [
                {
                    tooltip: 'Salva modifiche',
                    type: 'save',
                    itemId: 'saveGeneralIni'
                }
            ],
            items: [
					{
						xtype: 'fieldset',
						style: {
							marginTop: '5px'
						},
						title: 'Login',
						collapsed: false,
						flex: 1,
						listeners: {
							//add a * when allowBlank false
							beforeadd: function(fs, field) {
								if (field.allowBlank === false)
									field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
							}
						},
						defaults: {
							labelWidth: 220,
							labelAlign: 'right'
						},
						items: [
							{											
								xtype: 'htmleditor',
								//enableColors: false,
								enableAlignments: false,
								allowBlank: false,
								//grow: true,
								name: 'general.message',
								anchor: '100%'
							},
						]
					}
				
            ]
        });

        // single fire activate event
        me.on({
            render: {fn: me.onActivate, scope: me, single: true, delay: 150}
        });

        me.callParent(arguments);
    },

    /**
     * load data from ini files
     */
    onActivate: function() {
        
		var me = this,
            form = me.getForm(),
            values = form.getValues(),
            fields = [];
        Ext.Object.each(values, function(key, value) {
            fields.push(key);
        });
			me.el.mask('Carico impostazioni...');
			SIO.Services.getSystemSettings({fields:fields}, function(response) {
				// unamsk the form
				me.el.unmask();
				if (response.status) {
					//form values
					form.setValues(response.settings);
					me.setDefaultValues(response.settings);
				} else {
					Ext.Msg.alert('Errore', 'Impossibile caricare le impostazioni');
				}
			});
    }
});
