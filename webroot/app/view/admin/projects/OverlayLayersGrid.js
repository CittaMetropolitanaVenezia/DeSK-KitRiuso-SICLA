Ext.define('SIO.view.admin.projects.OverlayLayersGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.projects.overlaylayersgrid',

    requires:[
        'Ext.form.field.Checkbox'
    ],

    title: 'Overlay Layers - WMS',

    emptyText: 'Nessun layer trovato',
    config: {
        rowEditing:  null
    },
    initComponent: function() {
        var me = this;
		var layersformat = Ext.create('Ext.data.Store', {
			fields: ['format'],
						data: [{'format' : 'image/png'}, 
							   {'format': 'image/jpg'}]
		});
        me.rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false,
            errorSummary: true,
            saveBtnText  : 'Salva',
            cancelBtnText: 'Annulla',
            listeners: {

                beforeedit: function(editor, context, eOpts) {
                    //assegno alla combo il rispettivo valore
                    var cls = context.grid.columns;
                    for (var i=0; i< cls.length; i++) {
                        if (cls[i].dataIndex == 'username') {
                            if (context.record.get('username') != "") {
								cls[i].getEditor().setRawValue(context.record.get('username'));
								cls[i].getEditor().setRawValue(context.record.get('password'));
								cls[i].getEditor().setRawValue(context.record.get('code'));
                                cls[i].getEditor().setRawValue(context.record.get('title'));
                                cls[i].getEditor().setRawValue(context.record.get('url'));
								cls[i].getEditor().setRawValue(context.record.get('options_layers'));
								cls[i].getEditor().setRawValue(context.record.get('options_format'));
								cls[i].getEditor().setRawValue(context.record.get('options_transparent'));
								cls[i].getEditor().setRawValue(context.record.get('options_attribution'));
                            }
                        }

                    }
                },
                validateedit: function(editor, e, eOpts){
                    var newModel = e.record.copy(); //copy the old model
                    newModel.set(e.newValues); //set the values from the editing plugin form

                    var errors = newModel.validate(); //validate the new data
                    if(!errors.isValid()){
                        editor.editor.form.markInvalid(errors); //the double "editor" is correct
                        return false; //prevent the editing plugin from closing
                    }
                },
				//Salvo il record creato in progetto
                edit: function(editor, e) {
                    //salvo al server
                    e.grid.el.mask('Salvataggio in corso...');
                    e.record.save({

                        success: function(record,operation) {
                            //committo
                            e.grid.el.unmask();
							
                            var res = Ext.JSON.decode(operation.response.responseText);
							var decodedData = Ext.JSON.decode(res.result.data.OverlayLayer.layers_configurations);
							//Assegno al record dello store i nuovi valori salvati
                            //se uno nuovo
                            if (e.record.get('id')!=null) {
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
								e.record.set('photo',decodedData.Overlaylayers[e.record.get('id')].photo);
								e.record.set('username',decodedData.Overlaylayers[e.record.get('id')].username);
								e.record.set('password',decodedData.Overlaylayers[e.record.get('id')].password);
								e.record.set('code',decodedData.Overlaylayers[e.record.get('id')].code);
								e.record.set('title',decodedData.Overlaylayers[e.record.get('id')].title);
								e.record.set('url',decodedData.Overlaylayers[e.record.get('id')].url);
								e.record.set('options_layers',decodedData.Overlaylayers[e.record.get('id')].options_layers);
								e.record.set('options_format',decodedData.Overlaylayers[e.record.get('id')].options_format);
								e.record.set('options_transparent',decodedData.Overlaylayers[e.record.get('id')].options_transparent);
								e.record.set('options_attribution',decodedData.Overlaylayers[e.record.get('id')].options_attribution);
								e.record.set('active',decodedData.Overlaylayers[e.record.get('id')].active);
                            }
                            else { //nuovo record
                                //assegno l'id del db								
                                e.record.set('id',decodedData.Overlaylayers[decodedData.Overlaylayers.length-1].id);
								e.record.set('photo',decodedData.Overlaylayers[e.record.get('id')].photo);
								e.record.set('username',decodedData.Overlaylayers[e.record.get('id')].username);
								e.record.set('password',decodedData.Overlaylayers[e.record.get('id')].password);
								e.record.set('code',decodedData.Overlaylayers[e.record.get('id')].code);
								e.record.set('title',decodedData.Overlaylayers[e.record.get('id')].title);
								e.record.set('url',decodedData.Overlaylayers[e.record.get('id')].url);
								e.record.set('options_layers',decodedData.Overlaylayers[e.record.get('id')].options_layers);
								e.record.set('options_format',decodedData.Overlaylayers[e.record.get('id')].options_format);
								e.record.set('options_transparent',decodedData.Overlaylayers[e.record.get('id')].options_transparent);
								e.record.set('options_attribution',decodedData.Overlaylayers[e.record.get('id')].options_attribution);
								e.record.set('active',decodedData.Overlaylayers[e.record.get('id')].active);
								Ext.Msg.alert('Successo','Layer inserito correttamente!');
                            }

                            //committo sulla griglia
                            e.record.commit();
                        },
                        failure: function(record,operation) {
                            e.grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }

                            Ext.Msg.alert('Attenzione', msg);

                            //rimuovo se nuovo
                            if (!e.record.get('id')) {
                                e.record.store.remove(e.record);
                            }
                            else { //do un committ
                                e.record.commit();
                            }
                        }
                    });
                },

                canceledit: function(editor, context) {
                    if (context.record.get('id')!=null) {

                    }
                    else { //se nuovo
                        context.record.store.remove(context.record);
                    }
                }
            }
        });

        //creo uno store col valore provincia

        var oLayersStore = Ext.getStore('OverlayLayers')

        var olayers = Ext.create('Ext.data.Store', {
            model: oLayersStore.model
        });

        //clono i dati
        oLayersStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            olayers.add(rec.copy())[0].commit(true);
        });

        var r = Ext.create('SIO.model.BaseLayer');

        olayers.add(r)[0].commit(true);

        Ext.apply(me, {
            tools: [{
                tooltip: 'Nuovo overlay layer',
                type: 'plus',
                itemId: 'newoLayer'
            }],
            items:[{
                store: 'OverlayLayers',
                sortableColumns: true,
                xtype: 'grid',
				id: 'overlaylayerGrid',
                stripeRows: true,
                /*viewConfig:{
                    forceFit: true
                },*/
				height: 300,
                listeners: {
                    render: me.loadData
                },
                plugins: [
                    me.rowEditing
                ],
                columns: [
					{
						draggable: false,
						menuDisabled: false,
						header: 'Immagine',
						flex: 1,
						dataIndex: 'photo',
						editor: {
							msgTarget: 'under',
						},
						renderer: function(value){
							return '<img src="' + value + '"style="width:20px;height:20px" alt="No image">';
						},
					},
					{
						draggable: false,
						menuDisabled: false,
						header: 'Username',
						flex: 1,
						dataIndex: 'username',
						editor: {
							msgTarget: 'under'
						},
						hidden: true
					},
					{
						draggable: false,
						menuDisabled: false,
						header: 'Password',
						flex: 1,
						readonly: true,
						inputType: 'password',
						dataIndex: 'password',
						editor: {
							msgTarget: 'under',
							inputType: 'password',
						},
						renderer: function(val) {
							var toReturn = "";
							for (var x = 0; x < val.length; x++) {
								toReturn += "&#x25cf;";
							}
							return toReturn;
						},
						hidden: true
					},
					{
						draggable: false,
						menuDisabled: false,
						header: "Codice",
						flex: 1,
						dataIndex: 'code',
						editor: {
							msgTarget: 'under'
						}
					},
                    {
                        draggable: false,
                        menuDisabled: false,
                        header: "Titolo",
                        flex: 1,
                        dataIndex: 'title',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        draggable: false,
                        menuDisabled: false,
                        header: "Endpoint",
                        flex: 1,
                        dataIndex: 'url',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
                        draggable: false,
                        menuDisabled: false,
                        header: "Layers",
                        flex: 1,
                        dataIndex: 'options_layers',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
                        draggable: false,
                        menuDisabled: false,
                        header: "Formato",
                        flex: 1,
                        dataIndex: 'options_format',
                        editor: new Ext.form.field.ComboBox({
							typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
							store: layersformat,
							displayField: 'format',
							valueField: 'format',
							name: 'options_format'
                        }),
                    },
					{
                        draggable: false,
                        menuDisabled: false,
                        header: "Trasparenza(1/0)",
                        flex: 1,
                        dataIndex: 'options_transparent',
                        editor: {
                            msgTarget: 'under',
														
						}
                    },
					{
                        draggable: false,
                        menuDisabled: false,
                        header: "Attribution",
                        flex: 1,
                        dataIndex: 'options_attribution',
                        editor: {
                            msgTarget: 'under'
                        }
                    },			
					{
				        header: 'Acceso',                       
                        width: 60,
                        draggable: false,
                        sortable: false,
                        menuDisabled: false,
                        dataIndex: 'active',
                        editor: {
                            xtype: 'checkbox',
                            cls: 'x-grid-checkheader-editor'
                        },
						renderer: function(value){
							if(value){
								return '<img src="https://cdn-images-1.medium.com/max/1200/1*nZ9VwHTLxAfNCuCjYAkajg.png"style="width:20px;height:20px">';
							}else{
								return '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Location_dot_red.svg/1024px-Location_dot_red.svg.png" style="width:18px;height:18px">';
							}
						}
					},
                    {
                        xtype: "actioncolumn",
                        menuDisabled: true,
                        width: 40,
                        items: [
						{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Cancella overlaylayer',
                            itemId: 'admin-projects-deleteolayer'
                        },
						{
							icon: 'resources/images/picture.png',
                            tooltip: 'Carica icona',
                            iconCls: 'addIconOverlayLayer'
						}
						]
                    }
                ],
            }]
        });

        me.callParent(arguments);
    },

    loadData: function() {
        var me = this;
		var store = me.getStore();
		var ownerParams = this.ownerCt.admin_params;
		store.getProxy().extraParams = {
			admin_params: ownerParams
		};
        store.load();
    }

});