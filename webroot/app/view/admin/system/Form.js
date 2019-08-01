Ext.define('SIO.view.admin.system.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.admin.system.form',
	admin_params: null,
    requires:[
        'Ext.form.FieldSet',
        'SIO.ux.form.field.HelpText',
        'Ext.form.FieldContainer',
		'Ext.form.field.HtmlEditor'
    ],

    title: 'Impostazioni',
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
                    itemId: 'saveIni'
                }
            ],
            items: [
                {
                    xtype: 'fieldset',
                    style: {
                        marginTop: '5px'
                    },
                    title: 'Generale',
                    collapsed: false,
					collapsible: true,
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
                            xtype: 'textfield',
                            fieldLabel: 'Titolo Applicazione',
                            anchor: '70%',
                            allowBlank: false,
                            name: 'general.title'
                        },
                        {
                            xtype: 'datefield',
                            fieldLabel: 'Data inizio concertazione',
                            allowBlank: false,
                            vtype: 'daterange',
                            itemId: 'startdt',
                            endDateField: 'enddt',
                            name: 'general.startDate'
                        },
                        {
                            xtype: 'datefield',
                            fieldLabel: 'Data fine concertazione',
                            allowBlank: false,
                            vtype: 'daterange',
                            itemId: 'enddt',
                            startDateField: 'startdt',
                            name: 'general.endDate'
                        },        
						{
							xtype: 'fieldset',
							style: {
								marginTop: '5px'
							},
							title: 'Tema Concertazione',
							collapsed: false,
							collapsible: true,
							defaults: {
								labelWidth: 220,
								labelAlign: 'right'
							},
							items: [
									{
										xtype: 'restfileupload',
										buttonOnly: true,
										formBind: true,
										fieldLabel: 'Importa Shape',
										labelSeparator: '<br>Geometrie accettate: <b>POLYGON,MULTIPOLYGON</b><br>File necessari: <b>SHP,DBF,SHX',
										buttonConfig: {
											text: 'Carica file',	
											//scale: 'medium',
											//width: 265
										},
										accept: ['shp','dbf','shx'],
										//accept: ['pdf','jpg','png'],
										id: 'shapefield',
										name: 'shape[]',
										anchor: '70%',
									},
									{
										xtype: 'textfield',
										readOnly: true,
										name: 'shape_table',
										fieldLabel: 'Tema di concertazione: ',
										emptyText: 'Nessun tema'
									},
									{
										xtype: 'button',
										margin: '5 5 5 225',
										text: 'Avvia importazione ',
										formBind: true,
										handler: me.uploadShape
									},
									{
										xtype: 'button',
										//margin: '5 5 5 270',
										text: 'Elimina shape esistente',
										formBind: true,
										handler: me.deleteShape
									}
									
									]
						},
						{
                            xtype: 'numberfield',
                            fieldLabel: 'Numero massimo allegati',
                            allowBlank: false,
                            name: 'general.uploadLimit',
                            minValue: 0,
                            maxValue: 10
                        },
						{
							xtype: 'textfield',
							fieldLabel: 'Percorso upload',
							name: 'general.uploadPath',
							anchor: '70%',
							readOnly: true,
						},
						{
							xtype: 'fieldcontainer',
							fieldLabel: 'Disegna oltre i confini comunali',
							defaultType: 'checkboxfield',
							items: [
								{
									boxLabel: 'Attivo',
									name: 'general.drawOverLimits',
									inputValue: true,
									uncheckedValue: false,												
								}
							],
						},
						{
							xtype: 'textfield',
							fieldLabel: 'Numero massimo utenti per ente/comune',
							allowBlank: false,
							name: 'general.maxUserXtown'
						},
						{
							xtype: 'textfield',
							name: 'map.dataProj',
							fieldLabel: 'dataProj',
							allowBlank: false,
							readOnly: true,
							anchor: '70%',
						},
						{
							xtype: 'textfield',
							name: 'map.displayProj',
							fieldLabel: 'displayProj',
							allowBlank: false,
							readOnly: true,
							anchor: '70%',
						},
						{
							xtype: 'textfield',
							name: 'map.draw.buffer',
							fieldLabel: 'drawBuffer(Metri)',
							allowBlank: false,
							anchor: '70%',
						},
						{
							xtype: 'fieldcontainer',
							fieldLabel: 'Tipo di geometrie',
							allowBlank: false,
							defaultType: 'checkboxfield',
							defaults: {
								hideLabel: true,
								allowBlank: false,
							},
							items: 
							[{
								boxLabel: 'Punto',
								name: 'geometries.allow_point',
								inputValue: 'true',
								uncheckedValue: 'false'
							},
							{
								boxLabel: 'Linea',
								name: 'geometries.allow_line',
								inputValue: 'true',
								uncheckedValue: 'false'
							},
							{
								boxLabel: 'Poligono',
								name: 'geometries.allow_poligon',
								inputValue: 'true',
								uncheckedValue: 'false'
							},
							],
						}


                    ]
                },
				{
					xtype: 'fieldset',
					title: 'Extent del progetto (Riferimento EPSG:4326)',
					collapsed: false,
					collapsible: true,
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
							xtype: 'textfield',
							fieldLabel: 'x min',
							allowBlank: false,
							name: 'general.x_min'
						},
						{
							xtype: 'textfield',
							fieldLabel: 'y min',
							allowBlank: false,
							name: 'general.y_min'
						},
						{
							xtype: 'textfield',
							fieldLabel: 'x max',
							allowBlank: false,
							name: 'general.x_max'
						},
						{
							xtype: 'textfield',
							fieldLabel: 'y max',
							allowBlank: false,
							name: 'general.y_max'
						},
					]
					
				},
                {
                    xtype: 'fieldset',
                    title: 'Notifiche',
                    collapsed: false,
					collapsible: true,
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
                            xtype: 'textfield',
                            name: 'mail.smtp.host',
							allowBlank: false,
                            fieldLabel: 'Host SMTP',
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.port',
							allowBlank: false,
                            fieldLabel: 'Porta SMTP',
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.user',
                            fieldLabel: 'Username SMTP',
							allowBlank: false,
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.pswd',
                            fieldLabel: 'Password SMTP',
							allowBlank: false,
                            anchor: '70%'
                        },
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Email mittente',
                            allowBlank: false,
                            anchor: '100%',
                            plugins: [{
                                ptype: 'fieldhelptext',
                                text: 'Email indicata nella pagina principale quando il sistema &egrave; in manutenzione'
                            }],
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [{
                                xtype: 'textfield',
                                name: 'mail.notification.from.address',
                                emptyText: 'Indirizzo mail',
                                flex: 1,
                                allowBlank: false
                            },{
                                xtype: 'textfield',
                                name: 'mail.notification.from.name',
                                emptyText: 'Nome visualizzato',
                                flex: 1,
                                margin: '0 0 0 5',
                                allowBlank: false
                            }]
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.subject.newSubmission',
                            fieldLabel: 'Oggetto nuova osservazione',
                            anchor: '100%',
                            allowBlank: false,
                            plugins: [{
                                ptype: 'fieldhelptext',
                                text: 'Oggetto delle mail di notifica inviate al salvataggio di una nuova osservazione'
                            }]
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.subject.newOpinion',
                            fieldLabel: 'Oggetto nuovo parere',
                            anchor: '100%',
                            allowBlank: false,
                            plugins: [{
                                ptype: 'fieldhelptext',
                                text: 'Oggetto delle mail di notifica inviate al salvataggio di una nuovo parere di un\'osservazione'
                            }]
                        }
                    ]
                },
				{
					xtype: 'fieldset',
                    title: 'Minimap',
                    collapsed: false,
					collapsible: true,
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
						xtype: 'textfield',
						name: 'map.layers.minimap.url',
						flex: 1,
						fieldLabel: 'Endpoint',
						anchor: '70%',
						
					},
					{
						xtype: 'textfield',
						name: 'map.layers.minimap.options.attribution',
						fieldLabel: 'Attribution',
						anchor: '70%',
					},
					{
						xtype: 'numberfield',
						name: 'map.layers.minimap.options.maxZoom',
						fieldLabel: 'Zoom massimo(5-16)',
						anchor: '70%',
					}],
				},
            ]
        });

        // single fire activate event
        me.on({
            render: {fn: me.onActivate, scope: me, single: true, delay: 150}
        });

        me.callParent(arguments);
    },
	uploadShape: function() {
		var me = this;
		form = me.up('form');
		if(form.getValues().shape_table != ""){
			Ext.Msg.alert("Attenzione","Il progetto ha già un tema di concertazione. Eliminarlo prima di caricarne un altro.");
		}else{
			params = {};
			params.id = form.admin_params.id;
				  form.submit({
					url: 'projects/addNewShape',
					waitMsg: 'Caricamento shape in corso...',
					params: params,
					success: function(fp, o) {
						form.getForm().setValues(
							{
								shape_table : o.result.data
						});
						Ext.getCmp('shapefield').fileInputEl.set({'multiple' : true});
						Ext.Msg.alert('Attenzione', o.result.msgError);
						// ricarico il dataview
					},
					failure: function(a,res) {
						Ext.getCmp('shapefield').fileInputEl.set({'multiple' : true});
						if (res.result.msgError) {
							var error = res.result.msgError;
						}
						else {
							var error = 'Impossibile caricare lo shape in questo momento.<br />Riprovare più tardi.';
						}
						Ext.Msg.alert('Errore', error);
					}
				});
		}
	},
	deleteShape: function() {
		var me = this;
		form = me.up('form');
		params = {};
		params.id = form.admin_params.id;
		params.table_name = form.getValues().shape_table;
		Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo shape?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){
		SIO.Services.deleteProjectShape(params, function(response) {
				// unamsk the form
				me.el.unmask();
				if (response.result.success) {
					form.getForm().setValues(
						{
							shape_table : null
					});
					Ext.Msg.alert('Attenzione', 'Shape eliminato correttamente');
				
				} else {
					Ext.Msg.alert('Errore', response.result.msg);
				}
			});
		}});
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
		var isproject = me.admin_params==null ? false : true;		
		//controllo se arrivano i parametri dall'admin
		if(isproject){
			var params = me.admin_params; //id progetto
			me.el.mask('Carico impostazioni...');
			SIO.Services.getProjectSettings(params, function(response) {
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
		}else{
			Ext.Msg.alert('Errore','Impossibile caricare le impostazioni. Riprovare più tardi');
		}
    }
});
