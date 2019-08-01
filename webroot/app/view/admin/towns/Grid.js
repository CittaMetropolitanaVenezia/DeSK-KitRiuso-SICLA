Ext.define('SIO.view.admin.towns.Grid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.towns.grid',

    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield'
    ],

    title: 'Enti',

    emptyText: 'Nessun ente trovato',
    layout: 'fit',
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
                        if (cls[i].dataIndex == 'entity') {
                            if (context.record.get('entity') != "") {
								cls[i].getEditor().setRawValue(context.record.get('entity'));
                                cls[i].getEditor().setRawValue(context.record.get('name'));
                                cls[i].getEditor().setRawValue(context.record.get('code'));
								cls[i].getEditor().setRawValue(context.record.get('email'));
                            }
                        }

                    }

                },
                validateedit: function(editor, e, eOpts){
                   /* var newModel = e.record.copy(); //copy the old model
                    newModel.set(e.newValues); //set the values from the editing plugin form

                    var errors = newModel.validate(); //validate the new data

                    if(e.newValues.email != "" && !errors.isValid()){
                        editor.editor.form.markInvalid(errors); //the double "editor" is correct
                        return false; //prevent the editing plugin from closing
                    }*/
					 var newModel = e.record.copy(); //copy the old model
                    newModel.set(e.newValues); //set the values from the editing plugin form

                    var errors = newModel.validate(); //validate the new data
                    if(!errors.isValid()){
                        editor.editor.form.markInvalid(errors); //the double "editor" is correct
                        return false; //prevent the editing plugin from closing
                    }
                },

                edit: function(editor, e) {
                    //salvo al server
                    e.grid.el.mask('Salvataggio in corso...');
                    e.record.save({

                        success: function(record,operation) {
                            //committo
                            e.grid.el.unmask();
                            var res = Ext.JSON.decode(operation.response.responseText);
							e.record.set('entity', res.result.data.entity);
							e.record.set('name', res.result.data.name);
							e.record.set('code', res.result.data.code);
							e.record.set('email', res.result.data.email);
							 if (e.record.get('id')) {
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
                            }
                            else { //nuovo record
                                //assegno l'id del db
                                e.record.set('id',res.result.data.id);
								Ext.Msg.alert('Successo','Ente inserito correttamente!');
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
					if (context.record.get('id')) {

                    }
                    else { //se nuovo
                        context.record.store.remove(context.record);
                    }
                }
            }
        });


      //creo uno store col valore provincia
				var entities = Ext.create('Ext.data.Store', {
			fields: ['entity'],
			data: [{'entity' : 'Ente'}, 
				   {'entity': 'Comune'}]
		});
		
        var townsStore = Ext.getStore('Towns')

        var towns = Ext.create('Ext.data.Store', {
            model: townsStore.model
        });

        //clono i dati
        townsStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            towns.add(rec.copy())[0].commit(true);
        });

        var r = Ext.create('SIO.model.Town');

        towns.add(r)[0].commit(true);
        //townCopy.load();


        Ext.apply(me, {
			tools: [{
                tooltip: 'Nuovo ente',
                type: 'plus',
                itemId: 'newEntity'
            }],
            items:[{
                store: 'Towns',
                sortableColumns: true,
                xtype: 'grid',
                stripeRows: true,
                listeners: {
                    render: me.loadData
                },
                viewConfig:{
                    forceFit: true
                },
                plugins: [
                    Ext.create('SIO.ux.grid.plugin.HeaderFilters'),
                    me.rowEditing
                ],
                columns: [
					{
                        draggable: false,
                        menuDisabled: true,
						allowBlank: false,
                        text: "Tipologia",
                        flex: 1,
                        dataIndex: 'entity',
						filter:  {
							xtype: "clearabletextfield",
							padding: '0 5 0 5'
						},
                        editor: new Ext.form.field.ComboBox({
							typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
							store: entities,
							displayField: 'entity',
							valueField: 'entity',
							name: 'entity'
                        }),
                    },

                    {
                        draggable: false,
                        menuDisabled: true,
                        text: "Nome",
                        flex: 1,
                        dataIndex: 'name',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
						  editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        draggable: false,
                        menuDisabled: true,
                        text: "Codice",
                        flex: 1,
                        dataIndex: 'code',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
						  editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        draggable: false,
                        menuDisabled: true,
                        text: "Email",
                        flex: 1,
                        dataIndex: 'email',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
						menuDisabled: true,
						xtype: 'actioncolumn',
						width: 60,
						items: 
						[{
							icon: 'resources/images/bind.png',
							tooltip: 'Associa progetto',
							itemId: 'admin-towns-bind'
						},
						{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Cancella Ente',
                            itemId: 'admin-towns-delete',

                        }]
					}
                ]
            }]
        });

        me.callParent(arguments);
    },

    loadData: function() {
        var me = this;

        me.getStore().load();

    }

});
