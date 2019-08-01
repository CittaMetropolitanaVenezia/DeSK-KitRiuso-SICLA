Ext.define('SIO.view.admin.users.Grid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.users.grid',

    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox',
		'SIO.view.admin.users.AssociationPanel'
    ],

    title: 'Utenti',

    emptyText: 'Nessun utente trovato',
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

                    //controllo che se siamo iun edit di un record esistente username non possa essere cambiato
                    var edit = false;

                    if (context.record.get('id')) {
                        edit = true;
                    }
                    //assegno alla combo il rispettivo valore
                    var cls = context.grid.columns;
                    for (var i=0; i< cls.length; i++) {
                        if (cls[i].dataIndex == 'town_id') {
                            if (context.record.get('town_name') != "") {
                                cls[i].getEditor().setValue(parseInt(context.record.get('town_id')));
                                cls[i].getEditor().setRawValue(context.record.get('town_name'));
                            }
                        }

                        //disabilito username se edit
                        if (edit && cls[i].dataIndex == 'username') {
                            cls[i].getEditor().setReadOnly(true);
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

                edit: function(editor, e) {
                    //salvo al server
                    e.grid.el.mask('Salvataggio in corso...');
                    e.record.save({
                        success: function(record,operation) {
                            //committo
                            e.grid.el.unmask();

                            var res = Ext.JSON.decode(operation.response.responseText);
                            //assegno il town_name
                            e.record.set('town_name',res.result.data.town_name);

                            //se uno nuovo
                            if (e.record.get('id')) {
                                Ext.Msg.alert('Attenzione', 'Dati modificati correttamente!');
                            }
                            else { //nuovo record
                                //assegno l'id del db
                                e.record.set('id',res.result.data.id);
                                Ext.Msg.alert('Attenzione', 'Utente salvato correttamente. La password temporanea è: '+res.result.data.computepassword);
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

        //creo uno store col valore provincia

        var townsStore = Ext.getStore('Towns')

        var provinceTowns = Ext.create('Ext.data.Store', {
            model: townsStore.model
        });

        //clono i dati
        townsStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            provinceTowns.add(rec.copy())[0].commit(true);
        });

        //aggiungo il record con la pronvia
        var r = Ext.create('SIO.model.Town', {
            id: 0,
            gid: 0,
            name: 'ADMIN',
            code: 'admin',
            province: 'admin'
        });

        provinceTowns.add(r)[0].commit(true);

        Ext.apply(me, {
            tools: [{
                tooltip: 'Nuovo utente',
                type: 'plus',
                itemId: 'newUser'
            }],
            items:[{
                store: 'Users',
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
                        text: "Username",
                        flex: 1,
                        dataIndex: 'username',
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
                        text: "Cognome",
                        flex: 1,
                        dataIndex: 'surname',
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
                        text: "Ente/Comune",
                        flex: 1,
                        dataIndex: 'town_id',
                        renderer: function(v,metadata,record) {
                            if (record.get('town_name') != "") {
                                return record.get('town_name');
                            }else return "";

                        },
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                        editor: new Ext.form.field.ComboBox({
                            typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
                            displayField: 'name',
                            name: 'town_id',
                            valueField: 'id',
                            //emptyText: 'Inserisci comune',
                            store: provinceTowns
                        })
                    },
                    {
                        header: 'Attivo',
                        renderer: function(value){
							if(value){
								return '<img src="https://cdn-images-1.medium.com/max/1200/1*nZ9VwHTLxAfNCuCjYAkajg.png"style="width:20px;height:20px">';
							}else{
								return '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Location_dot_red.svg/1024px-Location_dot_red.svg.png" style="width:18px;height:18px">';
							}
						},
                        width: 60,
                        draggable: false,
                        sortable: false,
                        menuDisabled: true,
                        dataIndex: 'active',
                        editor: {
                            xtype: 'checkbox',
                            cls: 'x-grid-checkheader-editor'
                        }
                    },
                    {
                        xtype: "actioncolumn",
                        menuDisabled: true,
                        width: 60,
                        items: [/*{
                            icon: 'resources/icons/key-small.png',
                            tooltip: 'Cambia password',
                            itemId: 'admin-users-changePassword'
                        },*/{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Cancella utente',
                            itemId: 'admin-users-delete'
                        },{
                            icon: 'resources/images/key.png',
                            tooltip: 'Invia password', //invia pass se otp a true, se otp a false rigenera e invia password
                            itemId: 'admin-users-sendPassword' //se otp a true invio quella generata primo giro -> se opt a false rigenero una nuova , inserisco quella nuova su tutti e due i campi e metto otp a true
                        },
						{
							icon: 'resources/images/bind.png',
							tooltip: 'Associa Progetto',
							itemId: 'admin-users-bind'
						}]
                    }
                ],
                dockedItems: [{
                    xtype: 'pagingtoolbar',
                    displayInfo: true,
                    store: 'Users',
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
