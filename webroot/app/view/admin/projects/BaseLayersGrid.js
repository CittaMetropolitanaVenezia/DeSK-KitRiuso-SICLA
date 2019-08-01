Ext.define('SIO.view.admin.projects.BaseLayersGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.projects.baselayersgrid',

    requires:[
        'Ext.form.field.Checkbox'
    ],

    title: 'Base Layers',

    emptyText: 'Nessun layer trovato',
    config: {
        rowEditing:  null
    },
    initComponent: function() {
        var me = this;
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
                        if (cls[i].dataIndex == 'type') {
                            if (context.record.get('type') != "") {
                                cls[i].getEditor().setRawValue(context.record.get('type'));
                                cls[i].getEditor().setRawValue(context.record.get('title'));
								cls[i].getEditor().setRawValue(context.record.get('url'));
								cls[i].getEditor().setRawValue(context.record.get('options_attribution'));
								cls[i].getEditor().setRawValue(context.record.get('options_maxZoom'));
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
							var decodedData = Ext.JSON.decode(res.result.data.Baselayer.layers_configurations);
							//Assegno al record dello store i nuovi valori salvati
														
                            //se uno nuovo
                            if (e.record.get('id')!=null) {
								e.record.set('type',decodedData.Baselayers[e.record.get('id')].type);
								e.record.set('title',decodedData.Baselayers[e.record.get('id')].title);
								e.record.set('url',decodedData.Baselayers[e.record.get('id')].url);								
								e.record.set('options_attribution',decodedData.Baselayers[e.record.get('id')].options_attribution);
								e.record.set('options_maxZoom',decodedData.Baselayers[e.record.get('id')].options_maxZoom);
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
                            }
                            else { //nuovo record
                                //assegno l'id del db
                                e.record.set('id',decodedData.Baselayers[decodedData.Baselayers.length-1].id);
								e.record.set('type',decodedData.Baselayers[e.record.get('id')].type);
								e.record.set('title',decodedData.Baselayers[e.record.get('id')].title);		
								e.record.set('url',decodedData.Baselayers[e.record.get('id')].url);
								e.record.set('options_attribution',decodedData.Baselayers[e.record.get('id')].options_attribution);
								e.record.set('options_maxZoom',decodedData.Baselayers[e.record.get('id')].options_maxZoom);
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

        //creo uno store
		var layertypes = Ext.create('Ext.data.Store', {
			fields: ['type'],
			data: [
				{'type' : 'wms'}, 
				{'type': 'tms'},
				{'type': 'osm'}
			]
		});
        var bLayersStore = Ext.getStore('BaseLayers');

        var blayers = Ext.create('Ext.data.Store', {
            model: bLayersStore.model
        });

        //clono i dati
        bLayersStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            blayers.add(rec.copy())[0].commit(true);
        });

        var r = Ext.create('SIO.model.BaseLayer');
        blayers.add(r)[0].commit(true);
		this.filters = 
        Ext.apply(me, {
            tools: [{
                tooltip: 'Nuovo base layer',
                type: 'plus',
                itemId: 'newbLayer'
            }],
            items:[{
                store: 'BaseLayers',
                sortableColumns: true,
                xtype: 'grid',
				id: 'baselayerGrid',
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
						allowBlank: false,
                        text: "Tipo",
                        flex: 1,
                        dataIndex: 'type',
                        editor: new Ext.form.field.ComboBox({
							typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
							store: layertypes,
							displayField: 'type',
							valueField: 'type',
							name: 'type'
                        }),
                    },
                    {
                        draggable: false,
                        menuDisabled: false,
                        text: "Titolo",
                        flex: 1,
                        dataIndex: 'title',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
						draggable: false,
						menuDisabled: false,
						text: "Endpoint",
						flex: 1,
						dataIndex: 'url',
						editor: {
							msgTarget: 'under'
						}
					},
					{
                        draggable: false,
                        menuDisabled: false,
                        text: "Attribution",
                        flex: 1,
                        dataIndex: 'options_attribution',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
							{
                        draggable: false,
                        menuDisabled: false,
                        text: "Zoom(1-18)",
                        flex: 1,
                        dataIndex: 'options_maxZoom',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        xtype: "actioncolumn",
                        menuDisabled: true,
                        width: 40,
                        items: [
						{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Cancella Progetto',
                            itemId: 'admin-projects-deleteblayer'
                        },

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