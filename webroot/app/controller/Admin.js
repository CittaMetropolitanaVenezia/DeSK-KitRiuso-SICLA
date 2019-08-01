Ext.define('SIO.controller.Admin', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'Viewport',
            selector: '[xtype=viewport]'
        },
        {
            ref: 'userGridPanel',
            selector: '[xtype=admin.users.grid]'
        },
		{
			ref: 'townGridPanel',
			selector: '[xtype=admin.towns.grid]'
		},
		{
			ref: 'projectGridPanel',
			selector: '[xtype=admin.projects.grid]'
		},
		{
			ref: 'baselayerGridPanel',
			selector: '[xtype=admin.projects.baselayersgrid]'
		},
		{
			ref: 'overlaylayerGridPanel',
			selector: '[xtype=admin.projects.overlaylayersgrid]'
		},
        {
            ref: 'systemForm',
            selector: '[xtype=admin.system.form]'
        },
        {
            ref: 'userGrid',
            selector: '[xtype=admin.users.grid] grid'
        },
		{
			ref: 'townGrid',
			selector: '[xtype=admin.towns.grid] grid'
		},
		{
			ref: 'projectGrid',
			selector: '[xtype=admin.projects.grid] grid'
		},
		{
			ref: 'baselayerGrid',
			selector: '[xtype=admin.projects.baselayersgrid] grid'
		},
		{
			ref: 'overlaylayerGrid',
			selector: '[xtype=admin.projects.overlaylayersgrid] grid'
		},
        {
            ref: 'systemPanel',
            selector: '[xtype=admin.panel]'
        },
	
    ],
    init: function() {
        this.listen({
            component: {
                '[xtype=admin.users.grid] #newUser': {
                    click: this.addNewUser
                },
                '[xtype=admin.users.grid] grid actioncolumn': {
                    click: this.switchUser
                },
                '[xtype=admin.projects.grid] #newProject': {
                    click: this.addNewProject
                },
				'[xtype=admin.towns.grid]  #newEntity': {
					click: this.addNewEntity
				},
				'[xtype=admin.projects.baselayersgrid] #newbLayer': {
					click: this.addNewBLayer
				},
				'[xtype=admin.projects.overlaylayersgrid] #newoLayer': {
					click: this.addNewOLayer
				},
                '[xtype=admin.projects.grid] grid actioncolumn': {
                    click: this.switchProject
                },
				'[xtype=admin.towns.grid] grid actioncolumn': {
					click: this.switchTowns
				},
				'[xtype=admin.projects.uploadwindow] restfileupload[itemId=uploadAttachmentField]': {
                    filechecked: this.doUpload
                },
				'[xtype=admin.towns.townprojectgrid] grid actioncolumn':{
					click: this.switchTownProject
				},
				'[xtype=admin.users.associationgrid] actioncolumn': {
					click: this.switchAssociation
				},
				'[xtype=admin.projects.baselayersgrid] actioncolumn': {
					click: this.switchBaseLayer
				},
				'[xtype=admin.projects.overlaylayersgrid] actioncolumn': {
					click: this.switchOverlayLayer
				},
				
                '[xtype=admin.system.form] #saveIni': {
                    click: this.saveIni
                },
				'[xtype=admin.system.generalsettings] #saveGeneralIni': {
					click: this.saveGeneralIni
				},
				'[xtype=admin.panel] #systemProject' : {
					click: this.activeProjectGrid
				},
                '[xtype=admin.panel] #systemUser': {
                    click: this.activeUserGrid
                },
                '[xtype=admin.panel] #systemTown': {
                    click: this.activeTownGrid
                },
                '[xtype=admin.panel] #systemIni': {
                    click: this.activeSystemIni
                },				
				'[xtype=admin.users.associationgrid]': {
					render: this.loadDataUserProjects
				},
				'[xtype=admin.towns.townprojectgrid]':{
					render: this.loadDataTownProjects
				},
				'[xtype=admin.projects.projectscombo] #comboProject': {
					select: this.onSelectProjectsCombo
				},
				'[xtype=admin.towns.townprojectcombo] #comboProject': {
					select: this.onSelectTownProjectCombo
				}
            },
            global: {
                adminopen: this.openAdminWindow
            }
        });
    },
	addNewBLayer: function() {
		   var me = this,
            gridPanel = me.getBaselayerGridPanel(),
            grid = me.getBaselayerGrid(),
            rowEditing = gridPanel.getRowEditing();
        rowEditing.cancelEdit();

        // Create a model instance
        var r = Ext.create('SIO.model.BaseLayer', {
            type: '',
            title: '',
            url: '',
            options_attribution: '',
            options_maxZoom: '',
        });

        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	addNewOLayer: function() {

			   var me = this,
            gridPanel = me.getOverlaylayerGridPanel(),
            grid = me.getOverlaylayerGrid(),
            rowEditing = gridPanel.getRowEditing();
        rowEditing.cancelEdit();

        // Create a model instance
        var r = Ext.create('SIO.model.OverlayLayer', {
			username: '',
			password: '',
			code: '',
            title: '',
            url: '',
            options_layers: '',
            options_format: '',
            options_trasparent: '',
			options_attribution: ''
        });

        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	switchBaseLayer: function(view, cell, rowIndex, colIndex, e) {		
        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteBaseLayer(view,rowIndex);
                break;
        }
    },
	switchTowns: function(view, cell, rowIndex, colIndex, e) {
		var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'bind':
                me.openTownBind(view,rowIndex);
                break;
			case 'black':
				me.deleteEntity(view,rowIndex);
				break;
        }
	},
	openTownBind: function(view, rowIndex) {
		 var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);	
		 Ext.create('Ext.window.Window', {
            glyph: 61573,
            title: 'Associa Progetti',
            width: 900,
            height: 500,
            modal: true,
            layout: 'fit',
            items: [{ 
					xtype: 'admin.towns.townassociationPanel',
					town_id : record.data.id
				}]
        }).show();
	},
	deleteEntity: function(view, rowIndex){
		    var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }
		
		if(record.get('entity') == 'Comune'){
			Ext.Msg.alert('Attenzione','Operazione disabilitata per i comuni');
			return;
		};

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo ente?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
	},
	deleteBaseLayer: function(view, rowIndex) {
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo layer?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());
                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();
                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
    },
	switchOverlayLayer: function(view, cell, rowIndex, colIndex, e) {		
        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];
        switch (action) {
            case 'black':
                me.deleteOverlayLayer(view,rowIndex);
                break;
			case 'picture':
				me.addlayerimage(view,rowIndex);
				break;
        }
    },
	addlayerimage: function(view, rowIndex){
			var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);			
			Ext.widget('admin.projects.uploadwindow', {
            record: record,
			});
	},
	deleteOverlayLayer: function(view, rowIndex) {
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo layer?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
    },
	
	unbindProjectAssociation: function(view,rowIndex) {
		var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }
		comboStore = view.up('grid').up('panel').up('panel').down('combo').getStore();		
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo associazione?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();							
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
								store.load();
								comboStore.load();
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
		
		
	},
	
	onSelectProjectsCombo: function(combo, records) {
			//user-project bind save
			projectCombo = combo;
			unbindedprojectStore = projectCombo.getStore();
			selectedProject = records[0]['raw'];
			gridStore = combo.up('panel').up('panel').down('grid').getStore();
			unbindedprojectStore.remove(selectedProject);
			var project_id = selectedProject.id;
			var user_id = combo.up('panel').up('panel').user_id;
			var params = {};
			params.project_id = project_id;
			params.user_id = user_id;
			SIO.util.ServicesFactory.saveUserProjects(
                params,
                // callback
                function(response) {
                    if (response.result.success) {					
                        Ext.MessageBox.alert('Attenzione','Salvata correttamente!');    
                    }
                    else {
                        //ha dato errore
                        Ext.MessageBox.alert('Attenzione',response.result.error);
                    }
                },
                // fallback
                function() {
                  
                    Ext.MessageBox.alert('Attenzione','Errore nel salvataggio riprovare!');
                }
            );
			
			projectCombo.clearValue();
			unbindedprojectStore.load();
			gridStore.load();
			

		},
	onSelectTownProjectCombo: function(combo, records) {
			//town-project bind save
			projectCombo = combo;
			unbindedprojectStore = projectCombo.getStore();
			selectedProject = records[0]['raw'];
			gridStore = combo.up('panel').up('panel').down('grid').getStore();
			unbindedprojectStore.remove(selectedProject);
			var project_id = selectedProject.id;
			var town_id = combo.up('panel').up('panel').town_id;
			var params = {};
			params.project_id = project_id;
			params.town_id = town_id;
			SIO.util.ServicesFactory.saveTownProjects(
                params,
                // callback
                function(response) {
                    if (response.result.success) {					
                        Ext.MessageBox.alert('Attenzione','Associazione salvata correttamente!');    
                    }
                    else {
                        //ha dato errore
                        Ext.MessageBox.alert('Attenzione',response.result.error);
                    }
                },
                // fallback
                function() {
                  
                    Ext.MessageBox.alert('Attenzione','Errore nel salvataggio riprovare!');
                }
            );
			
			projectCombo.clearValue();
			unbindedprojectStore.load();
			gridStore.load();
			

			
		},
    activeUserGrid: function() {
        var me = this,
            adminPanel = me.getSystemPanel();
        adminPanel.getLayout().setActiveItem(0);
    },
    activeTownGrid: function() {
        var me = this,
            adminPanel = me.getSystemPanel();

        adminPanel.getLayout().setActiveItem(1);
    },
    activeSystemIni: function() {
        var me = this,
            adminPanel = me.getSystemPanel();

        adminPanel.getLayout().setActiveItem(2);
    },
	 activeProjectGrid: function() {
        var me = this,
            adminPanel = me.getSystemPanel();
        adminPanel.getLayout().setActiveItem(3);
    },

    /**
     * scelgo che azione da fare sulla colonna degli utenti
     * @param view
     * @param cell
     * @param rowIndex
     * @param colIndex
     * @param e
     */
    switchUser: function(view, cell, rowIndex, colIndex, e) {

        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteUser(view,rowIndex);
                break;
            case 'key':
                me.generatePassword(view,rowIndex);
                break;
			case 'bind':
				me.openBind(view,rowIndex);
        }
    },
	openBind(view,rowIndex) {
		 var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);			
		 Ext.create('Ext.window.Window', {
            glyph: 61573,
            title: 'Associa Progetti',
            width: 900,
            height: 500,
            modal: true,
            layout: 'fit',
            items: [{ 
					xtype: 'admin.users.associationPanel',
					user_id : record.data.id
				}]
        }).show();
		
	},
	  switchProject: function(view, cell, rowIndex, colIndex, e) {		
        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteProject(view,rowIndex);
                break;
			case 'settings':
				me.openProjectSettings(view,rowIndex);
				break;
        }
    },
	openProjectSettings: function(view,rowIndex) {
		   var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
			var params = {};
			params.id = view.up('grid').store.data.items[rowIndex].data.id;
			Ext.create('Ext.window.Window', {
				glyph: 61573,
				title: 'Impostazioni Progetto',
				width: 1200,
				height: 500,
				autoScroll: true,
				modal: true,
				items: [{ 
							xtype: 'admin.system.form',
							admin_params: params,							
							width:1170,
							viewConfig: {
								forceFit: true
							},
					   },
					   {
							xtype: 'admin.projects.baselayersgrid',
							admin_params: params,
							autoScroll: true,
							width:1170,
					   },
					   {
						   xtype: 'admin.projects.overlaylayersgrid',
						   admin_params: params,
						   autoScroll: true,
						   width:1170,
					   }]
			}).show();
	  },
	switchAssociation: function(view, cell, rowIndex, colIndex, e) {

        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.unbindProjectAssociation(view,rowIndex);
                break;
        }
    },
	switchTownProject: function(view, cell, rowIndex, colIndex, e) {

        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.unbindTownProject(view,rowIndex);
                break;
        }
    },
	unbindTownProject: function(view,rowIndex) {

		var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }
		comboStore = view.up('grid').up('panel').up('panel').down('combo').getStore();		
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo associazione?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();							
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
								store.load();
								comboStore.load();
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }				
	},
	    
	loadDataUserProjects: function(panel) {
        var me = this;		
		var user_id = panel.up('panel').user_id;
		var grid = panel.down('grid');
		var store = grid.getStore();
		var combo = panel.up('panel').down('combo');
		var store2 = combo.getStore();
		store2.getProxy().extraParams = {
			user_id: user_id
		};
		store.getProxy().extraParams = {
			user_id: user_id
		};
        store.load();
		store2.load();
    },
	loadDataTownProjects: function(panel) {
        var me = this;		
		var town_id = panel.up('panel').town_id;
		var grid = panel.down('grid');
		var store = grid.getStore();
		var combo = panel.up('panel').down('combo');
		var store2 = combo.getStore();
		store2.getProxy().extraParams = {
			town_id: town_id
		};
		store.getProxy().extraParams = {
			town_id: town_id
		};
        store.load();
		store2.load();
    },

    generatePassword: function(view,rowIndex) {

        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        //se opt true invio la stessa password

        if (record.get('otp')) {
            var confirmMsg = "Inviare la password a questo utente?";
        }
        else {
            var confirmMsg = "Generare una nuova password per questo utente?"
        }

        Ext.Msg.confirm('Attenzione',confirmMsg,function(confirm){
            //se conferma postivia
            if (confirm == 'yes'){

                grid.el.mask('Generazione password...');

                //mando il parametro id
                var params = {
                    id: record.get('id')
                }

                SIO.util.ServicesFactory.generatePassword(
                    params,
                    // callback
                    function(response) {
                        if (response.result.success) {
                            // process server response here
                            // unmask the container
                            grid.el.unmask();

                            // send feedback to the user
                            Ext.MessageBox.alert('Attenzione','La nuova password è <b>'+response.result.data.computepassword+'</b>. &Egrave; stata inviata un mail');

                        }
                        else {
                            //ha dato errore il collegamento all'smtp
							grid.el.unmask();
                            Ext.MessageBox.alert('Attenzione', 'La nuova password è <b>'+response.result.data.computepassword);
                        }
                    },
                    // fallback
                    function() {
                        // unmask the container
                        opinionsForm.el.unmask();
                        // send feedback and redirect to home page
                        Ext.MessageBox.alert('Attenzione','Errore nel salvataggio riprovare!');
                    }
                );
            }
        });
    },

    deleteUser: function(view, rowIndex) {
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo utente?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
    },
	deleteProject: function(view, rowIndex) {
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo progetto?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
    },

    openAdminWindow: function() {
        Ext.create('Ext.window.Window', {
            glyph: 61573,
            title: 'Configura',
            width: 900,
            height: 500,
            modal: true,
            layout: 'fit',
            items: [{ xtype: 'admin.panel' }]
        }).show();
    },

    addNewUser: function() {
        var me = this,
            gridPanel = me.getUserGridPanel(),
            grid = me.getUserGrid(),
            rowEditing = gridPanel.getRowEditing();

        rowEditing.cancelEdit();

        // Create a model instance
        var r = Ext.create('SIO.model.User', {
            name: '',
            email: '',
            surname: '',
            town_name: '',
            active: true,
            username: ''
        });

        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
    },
	//agiungo la nuova riga
	 addNewProject: function() {
        var me = this,
            gridPanel = me.getProjectGridPanel(),
			
            grid = me.getProjectGrid(),
            rowEditing = gridPanel.getRowEditing();

        rowEditing.cancelEdit();

        // Create a model instance
        var r = Ext.create('SIO.model.Project', {
            name: '',
            description: ''
        });
        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
    },
	addNewEntity: function() {
        var me = this,
            gridPanel = me.getTownGridPanel(),			
            grid = me.getTownGrid(),
            rowEditing = gridPanel.getRowEditing();
			rowEditing.cancelEdit();
        // Create a model instance
        var r = Ext.create('SIO.model.Town', {
			entity: '',
            name: '',
			code: '',
            email: ''
        });
        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	//Salvataggio impostazioni
    saveIni: function(window) {
		
		
        var me = this;
        systemForm = window.up('form');
        //recupero i valori dal form
        var params = {};
        params.values = systemForm.getForm().getValues();
		params.id = systemForm.admin_params.id;
		if(systemForm.isValid()) {
		formValues = systemForm.getValues();
		if(formValues['geometries.allow_line'] === 'false' && formValues['geometries.allow_point'] === 'false' && formValues['geometries.allow_poligon'] === 'false'){
			Ext.Msg.alert('Attenzione', 'Selezionare almeno un tipo di geometria.');
		}else{
			baseLayer = window.up('window').down('#baselayerGrid');
			baseLayer.getStore().load();
			if(!baseLayer.getStore().getCount()>0){
				Ext.Msg.alert('Attenzione', 'Nessun BaseLayer presente. Inserirne almeno uno.');
			}else{
				systemForm.el.mask('Salvo impostazioni...');
				// make server call
				SIO.Services.setProjectSettings(params, function(response) {
					// unamsk the form
					systemForm.el.unmask();
					if (response.status) {
						// load values into the form
						Ext.Msg.alert('Attenzione', 'Impostazione salvate correttamente');

					} else {
						Ext.Msg.alert('Errore', 'Impossibile salvare le impostazioni');
					}
				});
			}			
		}
		}else{
			Ext.Msg.alert('Attenzione', 'Inserire tutti i campi obbligatori');
		}
		
    },
	saveGeneralIni: function(window) {
		systemForm = window.up('form');
        //recupero i valori dal form
        var params = {};
        params.values = systemForm.getForm().getValues();
		if(systemForm.isValid()) {
		formValues = systemForm.getValues();
				systemForm.el.mask('Salvo impostazioni...');
				// make server call
				SIO.Services.setSystemSettings(params, function(response) {
					// unamsk the form
					systemForm.el.unmask();
					if (response.status) {
						// load values into the form
						Ext.Msg.alert('Attenzione', 'Impostazione salvate correttamente');

					} else {
						Ext.Msg.alert('Errore', 'Impossibile salvare le impostazioni');
					}
				});
						
		
		}else{
			Ext.Msg.alert('Attenzione', 'Inserire tutti i campi obbligatori');
		}
	},
	
	doUpload: function(btn) {
        var me = this,
            form = btn.up('form'),
            uploadWindow = form.up('window'),
            overlayGrid = me.getOverlaylayerGrid(),
             params = {
                overlay_id: uploadWindow.getRecord().get('id'),
				project_id: overlayGrid.ownerCt.admin_params.id

            };

		if (!form.isValid()) {
            Ext.Msg.alert('Attenzione', 'Selezionare un file!', function() {
                uploadWindow.down('#uploadAttachmentField').focus();
            });
            return;
        } else {
            form.submit({
                url: 'overlay_layers/loadOverlaylayerIcon',
                waitMsg: 'Caricamento allegato in corso...',
                params: params,
                success: function(fp, o) {
                    // send feedback
					overlayGrid.getStore().load();
					//chiamo il salvataggio del layer e aggiungo anche l'url dell'immagine
					
                    Ext.Msg.alert('Attenzione', 'Immagine caricata e impostata correttamente');
                    // ricarico il dataview
                    // chiudo la finestra dell upload
                    uploadWindow.close();
                },
                failure: function(a,res) {
                    // console.info(res);
                    if (res.msgError) {
                        var error = res.msgError;
                    }
                    else {
                        var error = 'Impossibile caricare allegati in questo momento.<br />Riprovare più tardi.';
                    }
                    uploadWindow.close();
                    Ext.Msg.alert('Errore', error);
                }
            });
        }
    }

});
