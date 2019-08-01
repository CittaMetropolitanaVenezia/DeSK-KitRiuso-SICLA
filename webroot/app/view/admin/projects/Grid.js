Ext.define('SIO.view.admin.projects.Grid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.projects.grid',

    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],

    title: 'Progetti',

    emptyText: 'Nessun progetto trovato',
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
                        if (cls[i].dataIndex == 'name') {
                            if (context.record.get('name') != "") {
                                cls[i].getEditor().setRawValue(context.record.get('name'));
                                cls[i].getEditor().setRawValue(context.record.get('description'));
								cls[i].getEditor().setRawValue(context.record.get('active'));
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
						
							
							
							//Assegno al record dello store i nuovi valori salvati
                            e.record.set('name',res.result.data.name);
							e.record.set('description',res.result.data.description);
							e.record.set('active', res.result.data.active);

                            //se uno nuovo
                            if (e.record.get('id')) {
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
                            }
                            else { //nuovo record
                                //assegno l'id del db
                                e.record.set('id',res.result.data.id);
								Ext.Msg.alert('Successo','Progetto inserito correttamente!');
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
                    if (context.record.get('id')) {

                    }
                    else { //se nuovo
                        context.record.store.remove(context.record);
                    }
                }
            }
        });


        var projectsStore = Ext.getStore('Projects')

        var projects = Ext.create('Ext.data.Store', {
            model: projectsStore.model
        });
        //clono i dati
        projectsStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            projects.add(rec.copy())[0].commit(true);
        });

        var r = Ext.create('SIO.model.Project');

        projects.add(r)[0].commit(true);

        Ext.apply(me, {
            tools: [{
                tooltip: 'Nuovo progetto',
                type: 'plus',
                itemId: 'newProject'
            }],
            items:[{
                store: 'Projects',
                sortableColumns: true,
                xtype: 'grid',
                stripeRows: true,
                viewConfig:{
                    forceFit: true
                },
                listeners: {
                    render: me.loadData
                },
                plugins: [
                    Ext.create('SIO.ux.grid.plugin.HeaderFilters'),
                    me.rowEditing
                ],
                columns: [

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
                        text: "Descrizione",
                        flex: 1,
                        dataIndex: 'description',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
				        header: 'Attivo',
                       
                        width: 60,
                        draggable: false,
                        sortable: false,
                        menuDisabled: true,
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
                        width: 60,
                        items: [
						{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Cancella Progetto',
                            itemId: 'admin-projects-delete',
                        },
						{
							icon: 'resources/images/settings-icon.png',
							tooltip: 'Impostazioni Progetto',
							itemId: 'admin-projects-settings'
						},
						]
                    }
                ],
                dockedItems: [{
                    xtype: 'pagingtoolbar',
                    displayInfo: true,
                    store: 'Projects',
                    dock: 'bottom'
                }]
            }]
        });

        me.callParent(arguments);
    },

    loadData: function() {
        var me = this;

        me.getStore().load();

    }

});
