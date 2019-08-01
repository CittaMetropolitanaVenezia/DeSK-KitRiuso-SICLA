Ext.define('SIO.controller.Submissions', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'mapPanel',
            selector: '[xtype=submissions.map]'
        },
        {
            ref: 'eastRegion',
            selector: '[xtype=app-main] > panel[region=east]'
        },
        {
            ref: 'submissionsGrid',
            selector: '[xtype=submissions.grid]'
        },
		{
			ref: 'townsGrid',
			selector: '[xtype=submissions.edit.grid]'
		},
        {
            ref: 'submissionsEditPanel',
            selector: '[xtype=submissions.edit.panel]'
        },
        {
            ref: 'submissionsDetailPanel',
            selector: '[xtype=submissions.detail.panel]'
        }
    ],

    init: function() {
        this.listen({
            component: {
                // Submissions Grid
                '[xtype=submissions.grid]': {
                },
				//towns Grid
				'[xtype=submissions.edit.grid]': {
					
				},
                // Map Panel
                '[xtype=submissions.map]': {
                    drawcreated: this.onDrawCreated,
                    drawmodified: this.onDrawModified,
                    drawmodechange: this.onDrawModeChange
                },
                // Submissions Edit Panel
                '[xtype=submissions.edit.panel]': {
                    startdraw: this.startDraw,
                    cleardraw: this.clearDraw,
                    beforecancel: this.cancelNewSubmission,
                    beforesave: this.saveNewSubmission,
			
                },
                // Submissions Detail Panel
                '[xtype=submissions.detail.opinionsgrid] button[itemId=historyOpinionsButton]': {
                    click: this.openHistoryOpinionWindow
                },
                '[xtype=submissions.grid]': {
                    itemdblclick: this.openSubmission
                },
                '[xtype=submissions.detail.attachmentsdataview] dataview': {
                    itemdblclick: this.openAttachWindow
                },
                '[xtype=submissions.detail.opinionsgrid] button[itemId=addOpionionBtn]': {
                    click: this.openOpinionsFormWindow
                },
                '[xtype=submissions.detail.opinionsform] button[itemId=opinionsFormSaveButton]': {
                    click: this.saveOpinionsForm
                },
                '[xtype=submissions.detail.opinionsform] button[itemId=opinionsFormResetButton]': {
                    click: this.resetOpinionsForm
                },
                '[xtype=submissions.detail.panel]': {
                    activate: this.loadData
                },
                '[xtype=submissions.edit.dataview] #uploadAttachmentFieldButton': {
                    click: this.openUploadWindowFromEdit
                },
                '[xtype=submissions.detail.attachmentsdataview] #uploadAttachmentFieldButton': {
                    click: this.openUploadWindowFromDetail
                },
                '[xtype=submissions.detail.attachmentsdataview] #removeAttachmentFieldButton': {
                    click: this.removeAttachmentFromDetail
                },
                '[xtype=submissions.edit.dataview] #removeAttachmentFieldButton': {
                    click: this.removeAttachmentFromEdit
                },
                '[xtype=submissions.edit.uploadform] restfileupload[itemId=uploadAttachmentField]': {
                    filechecked: this.doUpload
                },
                '[xtype=submissions.uploadwindow] restfileupload[itemId=uploadAttachmentField]': {
                    filechecked: this.doUpload
                }
            },
            global: {
                newsubmission: this.newSubmission,
                viewsubmission: this.viewSubmission,
                closesubmission: this.closeSubmission,
                opinionschange: this.opinionsChange,
				deletesubmission: this.deleteSubmission,
				drawfinished: this.onDrawFinished
            }
        });
    },
	onDrawFinished: function(geojson){
		var me = this,
		grid = me.getTownsGrid(),
		gridSelectionModel = grid.getSelectionModel(),
		store = grid.getStore();
		if(SIO.Settings.getDrawOverLimits()){
			if(SIO.Settings.getShapeTable()){
				store.getProxy().extraParams = {
					submission_geojson : JSON.stringify(geojson)
				};
				
				store.load();
			}
		}
	},
	deleteSubmission: function(record) {
        var me = this,
            submissionsDetailPanel = me.getSubmissionsDetailPanel(),
            submissionsGrid = me.getSubmissionsGrid(),
            mapPanel = me.getMapPanel(),
            eastRegion = me.getEastRegion();


        Ext.Msg.confirm('Attenzione','Eliminare l\'osservazione?',function(confirm) {
            //se conferma postivia
            if (confirm == 'yes') {
                var params = {
                    id: record.get('id')
                };

                // mask the app
                submissionsDetailPanel.el.mask('Cancellazione in corso...');

                // send to server
                SIO.util.ServicesFactory.deleteSubmission(
                    params,
                    // callback
                    function(response) {
                        if (response.result.success) {
                            // process server response here
                            // unmask the container
                            submissionsDetailPanel.el.unmask();
                            // send feedback to the user
                            Ext.MessageBox.alert('Attenzione','Segnalazione cancellata correttamente!');

                            // clear draw
                            mapPanel.clearDraw();

                            //torno alla tab principale
                            eastRegion.getLayout().setActiveItem(0);
                            //reload della griglia principale
                            submissionsGrid.getStore().refresh();
                        }
                        else {
                            //ha dato errore
                            Ext.MessageBox.alert('Attenzione',response.result.error);
                        }
                    },
                    // fallback
                    function() {
                        // send feedback and redirect to home page
                        Ext.MessageBox.alert('Attenzione','Errore nella cancellazione,riprovare!');
                    }
                );

            }
        });

    },
    openSubmission: function(grid,r,i,rowIndex) {
        var me = this;
        //recuperoil record e apro il dettaglio dell'osservazione
        var record = grid.getStore().getAt(rowIndex);
        Ext.globalEvents.fireEvent('viewsubmission', record);
    },


    removeAttachmentFromDetail: function() {
        var me = this,
            submissionsDetailPanel = me.getSubmissionsDetailPanel(),
            detailDataView = submissionsDetailPanel.down('[xtype=submissions.detail.attachmentsdataview] dataview'),
            selectionModel = detailDataView.getSelectionModel();
        // call common method
        me.removeAttachment(detailDataView, selectionModel.getSelection());
    },

    removeAttachmentFromEdit: function() {
        var me = this,
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            editDataView = submissionsEditPanel.down('[xtype=submissions.edit.dataview] dataview'),
            selectionModel = editDataView.getSelectionModel();
        // call common method
        me.removeAttachment(editDataView, selectionModel.getSelection());
    },

    removeAttachment: function(dataview, items) {
        if (items.length > 0) {
            Ext.Msg.confirm('Attenzione','Eliminare l\'allegato?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes') {
                    dataview.el.mask('Eliminazione in corso...');
                    var params = {
                        attachment: items[0].data
                    };
                    //riuovo il file dal server
                    SIO.util.ServicesFactory.removeUpload(
                        params,
                        // callback
                        function(response) {
                            if (response.result.success) {
                                // unmask the container
                                dataview.el.unmask();
                                //elimino dallo store
                                dataview.getStore().remove(items);
                                //aggiorno il numero di allegati
                                dataview.up('panel').setTitle('Allegati ('+dataview.getStore().count()+')');
                                // send feedback to the user
                                Ext.MessageBox.alert('Attenzione','Allegato eliminato correttamente!');
                            } else {
                                //ha dato errore
                                Ext.MessageBox.alert('Attenzione', response.result.msg);
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
        } else {
            Ext.Msg.alert('Attenzione','Selezionare un allegato');
            return;
        }
    },
    newSubmission: function(btn) {
        var me = this,
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            eastRegion = me.getEastRegion(),
            editDataView = submissionsEditPanel.down('[xtype=submissions.edit.dataview] dataview'),
			grid = submissionsEditPanel.down('grid'),
			store = grid.getStore(),
            mapPanel = me.getMapPanel();
			if(SIO.Settings.getDrawOverLimits()){
				if(SIO.Settings.getShapeTable()){
					store.clearFilter();
					store.removeAll();				
				}
			}else{
					store.load();
				}
        // reset map bounds
        //mapPanel.getMap().resetBounds(true);
        //reset editdataview store
        editDataView.getStore().removeAll();
        //reset textarea
        eastRegion.down('textarea').setValue();
        // activate new submission panel
        eastRegion.getLayout().setActiveItem(submissionsEditPanel);
    },

    viewSubmission: function(record) {
        var me = this,
            eastRegion = me.getEastRegion(),
            submissionsDetailPanel = me.getSubmissionsDetailPanel(),
            mapPanel = me.getMapPanel();
        // close the popup
        record.raw.closePopup();
        // zoom the map
        mapPanel.getMap().zoomToLayer(record.raw);
        // set record
        submissionsDetailPanel.setRecord(record);
        var activeItem = eastRegion.getLayout().getActiveItem();
        // show the panel (or emulate activate event)
        if (activeItem.xtype == submissionsDetailPanel.xtype) {
            submissionsDetailPanel.fireEvent('activate');
        } else {
            eastRegion.getLayout().setActiveItem(2);
        }
    },

    closeSubmission: function(btn) {
        var me = this,
            eastRegion = me.getEastRegion();
        eastRegion.getLayout().setActiveItem(0);

    },

    /*
    * apro una nuova window contenente la storia delle opinioni precedenti di quella submission_id
    */
    openHistoryOpinionWindow: function(btn) {
        var me = this,
            detailPanel = me.getSubmissionsDetailPanel();

        Ext.create('Ext.window.Window', {
            title: 'Pareri precedenti comuni coinvolti',
            height: 400,
            width: 800,
            modal: true,
            layout: 'fit',
            items: {
                xtype: 'submissions.detail.opinionshistorygrid',
                submissionId: detailPanel.getRecord().get('id')
            }
        }).show();
    },

    /*
     * apro una nuova window il form per cambiare opinione di quel comune e di quella submission_id
     */
    openOpinionsFormWindow: function(btn) {
        var me = this,
            detailPanel = me.getSubmissionsDetailPanel();

        //apro e passo il submission id -> il town_id lo prendo dalla sessione
        Ext.create('Ext.window.Window', {
            title: 'Inserisci un parere',
            width: 390,
            height: 400,
            resizable: false,
            modal: true,
            layout: 'fit',
            items: {
                xtype: 'submissions.detail.opinionsform',
                submissionId: detailPanel.getRecord().get('id')
            }
        }).show();
    },

    openAttachWindow: function(el, record, item, index, e, eOpts ) {

        window.open('attachments/download/'+record.get('id')+'.'+record.get('type'));
    },

    /**
     * Emesso all'aggiunta di una nuova opinion
     */
    opinionsChange: function() {
        var me = this,
            submissionsGrid = me.getSubmissionsGrid();
        // refresh the store -> la mappa non sposta
        submissionsGrid.getStore().refresh();
    },

    /**
     * salvo le opinion
     */
    saveOpinionsForm: function(btn) {
        var me = this,
            opinionsForm = btn.up('form'),
            submissionsDetailPanel = me.getSubmissionsDetailPanel();

        //recupero i valori
        var values = opinionsForm.getValues();
        //controllo se ha premuto il parere

        if (opinionsForm.down('#opinion').getValue() == "") {
            Ext.MessageBox.alert('Attenzione','Scegliere un parere!');
            return;
        }

        Ext.Msg.confirm('Attenzione','Inserire il nuovo parere?',function(confirm){
            //se conferma postivia
            if (confirm == 'yes'){
                //do save
                // mask the container
                opinionsForm.el.mask('Caricamento');

                //setto la submission_id
                values.submission_id = opinionsForm.getSubmissionId();

                //send to server
                SIO.util.ServicesFactory.saveOpinion(
                    values,
                    // callback
                    function(response) {
                        if (response.result.success) {
                            // process server response here
                            // unmask the container
                            opinionsForm.el.unmask();
                            // send feedback to the user
                            Ext.MessageBox.alert('Attenzione','Parere salvato correttamente!');

                            //creo il record di submission
                            var record = Ext.create('SIO.model.Submission',response.result.data);
                            //asegno il nuovo record al pannello di dettaglio
                            submissionsDetailPanel.setRecord(record);
                            //scateno l'evento globale activate sul dettaglio
                            submissionsDetailPanel.fireEvent('activate',submissionsDetailPanel);
                            //aggiorno anche la pagina riassuntiva iniziale store etc etc
                            Ext.globalEvents.fireEvent('opinionschange');
                            // chiudo la finestra
                            opinionsForm.up('window').close();
                        }
                        else {
                            //ha dato errore
                            Ext.MessageBox.alert('Attenzione',response.result.error);
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

    /**
     * reset della form delle nuove opinioni
     */
    resetOpinionsForm: function(btn) {
        var me = this,
            opinionsForm = btn.up('form'),
            agreeButton = opinionsForm.down('#agree'),
            disagreeButton = opinionsForm.down('#disagree'),
            descriptionArea = opinionsForm.down('[xtype=textarea]');

        //reset dei due pulsanti
        agreeButton.toggle(false);
        disagreeButton.toggle(false);
        //reset dell'hidden
        opinionsForm.down('#opinion').setValue("");
        //reset della textarea
        descriptionArea.setValue('');
    },

    loadData: function() {
        var me = this,
            panel = me.getSubmissionsDetailPanel(),
            record = panel.getRecord(),
            opinionsGrid = panel.down('[xtype=submissions.detail.opinionsgrid]'),
            opinionsGridStore = opinionsGrid.getStore(),
            attachmentsGridStore = panel.down('[xtype=submissions.detail.attachmentsdataview] dataview').getStore()
        // panel.up('container').setTitle('Osservazione ID:' + panel.getRecord().get('id') + ' del ' + Ext.Date.format(new Date(panel.getRecord().get('created')), 'd-m-Y'));

        if (SIO.Settings.isTown() && !record.get('is_owner')) {
            opinionsGrid.down('#addOpionionBtn').show();
        } else {
            opinionsGrid.down('#addOpionionBtn').hide();
        }

        //setto i valori al form
        panel.down('form').getForm().setValues(panel.getRecord().data);
        //svuota la griglia last opinions
        opinionsGridStore.removeAll();

        //filtro i dati
        opinionsGridStore.filter([
            {property: 'submission_id' , value: panel.getRecord().get('id')},
            {property: 'last', value: true}
        ]);

        //svuota la dataview precedente
        attachmentsGridStore.removeAll();

        //filtro i dati
        attachmentsGridStore.filter([
            {property: 'submission_id' , value: panel.getRecord().get('id')}
        ]);

    },

    startDraw: function(mode) {
        var me = this,
            mapPanel = me.getMapPanel();
        mapPanel.startDraw(mode);
    },

    clearDraw: function() {
        var me = this,
            mapPanel = me.getMapPanel(),
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            submissionsEditGrid = submissionsEditPanel.down('grid'),
            submissionsEditGridSelectionModel = submissionsEditGrid.getSelectionModel();
        // remove all selected (intersected towns)
        submissionsEditGridSelectionModel.deselectAll();
        // reset drawing stuffs
        mapPanel.clearDraw();
    },

    onDrawCreated: function(layer) {
        var me = this,
            mapPanel = me.getMapPanel(),
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            submissionsEditGrid = submissionsEditPanel.down('grid'),
            submissionsEditGridSelectionModel = submissionsEditGrid.getSelectionModel(),
            townsStore = Ext.getStore('Towns'),
            neighbors = mapPanel.getNeighborsLayer().features,
            feature = new OpenLayers.Format.GeoJSON().read(layer.toGeoJSON()),
            intersectedTowns = [],
            clearDrawBtn = submissionsEditPanel.down('#clearDrawBtn');
        // selected intersected towns (on neighbors towns grid)
        for (var i=0; i<neighbors.length; i++) {
            if (feature[0].geometry.intersects(neighbors[i].geometry)) {
                // console.info('INTERSECTS ' + neighbors[i].attributes.name, neighbors[i]);
                var record = townsStore.getById(neighbors[i].attributes.gid);
                if (record) {
                    intersectedTowns.push(record);
                }
            }
        }
        if (intersectedTowns.length) {
            submissionsEditGridSelectionModel.select(intersectedTowns);
        } else {
            submissionsEditGridSelectionModel.deselectAll();
        }
        // enable clear draw button
        clearDrawBtn.setDisabled(false);
    },

    onDrawModeChange: function() {
        var me = this,
            mapPanel = me.getMapPanel(),
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            submissionsEditGrid = submissionsEditPanel.down('grid'),
            submissionsEditGridSelectionModel = submissionsEditGrid.getSelectionModel(),
            townsStore = Ext.getStore('Towns'),
            neighbors = mapPanel.getNeighborsLayer().features,
            feature = new OpenLayers.Format.GeoJSON().read(layer.toGeoJSON()),
            intersectedTowns = [];
        // selected intersected towns (on neighbors towns grid)
        for (var i=0; i<neighbors.length; i++) {
            if (feature[0].geometry.intersects(neighbors[i].geometry)) {
                // console.info('INTERSECTS ' + neighbors[i].attributes.name, neighbors[i]);
                var record = townsStore.getById(neighbors[i].attributes.gid);
                if (record) {
                    intersectedTowns.push(record);
                }
            }
        }
        if (intersectedTowns.length) {
            submissionsEditGridSelectionModel.select(intersectedTowns);
        } else {
            submissionsEditGridSelectionModel.deselectAll();
        }
    },

    onDrawModified: function(layer) {
        var me = this,
            mapPanel = me.getMapPanel(),
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            submissionsEditGrid = submissionsEditPanel.down('grid'),
            submissionsEditGridSelectionModel = submissionsEditGrid.getSelectionModel(),
            townsStore = Ext.getStore('Towns'),
            neighbors = mapPanel.getNeighborsLayer().features,
            feature = new OpenLayers.Format.GeoJSON().read(layer.toGeoJSON()),
            intersectedTowns = [];
        for (var i=0; i<neighbors.length; i++) {
            if (feature[0].geometry.intersects(neighbors[i].geometry)) {
                // console.info('INTERSECTS ' + neighbors[i].attributes.name, neighbors[i]);
                var record = townsStore.getById(neighbors[i].attributes.gid);
                if (record) {
                    intersectedTowns.push(record);
                }
            }
        }
        if (intersectedTowns.length) {
            submissionsEditGridSelectionModel.select(intersectedTowns);
        } else {
            submissionsEditGridSelectionModel.deselectAll();
        }
        // console.info('onDrawModified', layer);
    },

    saveNewSubmission: function() {
        var me = this,
            mapPanel = me.getMapPanel(),
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            submissionsEditGrid = submissionsEditPanel.down('grid'),
            drawLayer = mapPanel.getDrawLayer(),
            description = submissionsEditPanel.down('#description'),
            editDataView = submissionsEditPanel.down('[xtype=submissions.edit.dataview] dataview'),
            towns = submissionsEditGrid.getSelectedTownsId(),
            eastRegion = me.getEastRegion(),
            status = { success: true, msg: '' };
        // user create a feature?
        if (Ext.isEmpty(drawLayer)) {
            status.success = false;
            status.msg = 'Non è stato effettuato nessun disegno sulla mappa.';
        }
        // user write a description?
        if (status.success && Ext.isEmpty(description.getValue())) {
            status.success = false;
            status.msg = 'Non è stata inserita una descrizione dell\'osservazione.';
        }
        // everything is ok, collect data and send it to server...
        if (status.success) {
            var params = {};
            // collect draw data
            params.geojson = drawLayer.toGeoJSON();
            // collect description
            params.description = description.getValue();
            // collect grid data (towns)
            params.towns = towns;
            //recupero al server gli allegati attualmente presenti
            params.attachmentsLoaded = Ext.JSON.encode(Ext.Array.pluck(editDataView.getStore().data.items, 'data'));
            // mask the app
            submissionsEditPanel.el.mask('Salvataggio in corso...');
            // send to server
            SIO.util.ServicesFactory.saveSubmission(
                params,
                // callback
                function(response) {
                    if (response.result.success) {
                        // process server response here
                        // unmask the container
                        submissionsEditPanel.el.unmask();
                        // send feedback to the user
                        Ext.MessageBox.alert('Attenzione','Segnalazione salvata correttamente!');

                        //aggiorno la pagina riassuntiva iniziale store etc etc
                        Ext.globalEvents.fireEvent('opinionschange');

                        // clear draw
                        mapPanel.clearDraw();

                        //resetto la griglia dei comuni limitrofi
                        eastRegion.down('[xtype=submissions.edit.grid]').getSelectionModel().deselectAll();
                        //torno alla tab principale
                        eastRegion.getLayout().setActiveItem(0);
                    }
                    else {
                        //ha dato errore
                        Ext.MessageBox.alert('Attenzione',response.result.error);
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

            // on success switch to main panel
        } else {
            SIO.Utilities.alert('Attenzione', status.msg, Ext.emptyFn());
        }
    },

    cancelNewSubmission: function() {
        var me = this,
            mapPanel = me.getMapPanel(),
            eastRegion = me.getEastRegion();
        // ask confirm
        SIO.Utilities.confirm('Sicuro di voler annullare?', 'Conferma', function(btn) {
            if (btn == 'yes') {
                // clear draw
                mapPanel.clearDraw();
                // switch to main panel
                eastRegion.getLayout().setActiveItem(0);
                //resetto il form
                eastRegion.down('textarea').setValue();
                //resetto la griglia dei comuni limitrofi
                eastRegion.down('[xtype=submissions.edit.grid]').getSelectionModel().deselectAll();
                //vado al server per cancellare gli allegati inseriti e anche quelli vecchi di un giorno
                var params = {};
                // remove old (unused) attachments
                SIO.util.ServicesFactory.removeOldUpload(params);
            }
        });
    },

    openUploadWindowFromDetail: function() {
        var me = this,
            detailPanel = me.getSubmissionsDetailPanel();
        Ext.widget('submissions.uploadwindow', {
            record: detailPanel.getRecord()
        });
    },

    openUploadWindowFromEdit: function() {
        var me = this,
            editPanel = me.getSubmissionsEditPanel();
        Ext.widget('submissions.uploadwindow', {
            record: null
        }).show();
    },

    doUpload: function(btn) {
        var me = this,
            form = btn.up('form'),
            uploadWindow = form.up('window'),
            submissionsPanel, dataview,
            params = {};

        // detail mode
        if (uploadWindow.getRecord()) {
            submissionsPanel = me.getSubmissionsDetailPanel();
            dataview = submissionsPanel.down('[xtype=submissions.detail.attachmentsdataview] dataview');
            params = {
                data: Ext.JSON.encode(Ext.Array.pluck(dataview.getStore().data.items, 'data')),
                submission_id: uploadWindow.getRecord().get('id')
            }
        }
        // edit mode
        else {
            submissionsPanel = me.getSubmissionsEditPanel();
            dataview = submissionsPanel.down('[xtype=submissions.edit.dataview] dataview');
            params = {
                data: Ext.JSON.encode(Ext.Array.pluck(dataview.getStore().data.items, 'data')),
                submission_id: 0
            };
        }
        // form is valid?
        if (!form.isValid()) {
            Ext.Msg.alert('Attenzione', 'Inserire un\'etichetta', function() {
                uploadWindow.down('#label').focus();
            });
            return;
        } else {
            form.submit({
                url: 'attachments/upload',
                waitMsg: 'Caricamento allegato in corso...',
                params: params,
                success: function(fp, o) {
                    // send feedback
                    Ext.Msg.alert('Informazione', 'Allegato inserito correttamente!');
                    // ricarico il dataview
                    var data = o.result.data;
                    dataview.getStore().loadData(data);
                    //aggiorno il nuovo numero di allegati
                    dataview.up('panel').setTitle('Allegati ('+data.length+')');
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
        return;



        var me = this,
            form = btn.up('[xtype=submissions.edit.uploadform]'),
            formWindow = form.up('window'),
            submissionsEditPanel = me.getSubmissionsEditPanel(),
            editDataView = submissionsEditPanel.down('[xtype=submissions.edit.dataview] dataview');

        // recupero al server gli allegati attualmente presenti
        var attachmentsLoaded = Ext.JSON.encode(Ext.Array.pluck(editDataView.getStore().data.items, 'data'));

        if(form.isValid()){
            form.submit({
                url: 'attachments/upload',
                waitMsg: 'Caricamento allegato in corso...',
                params: {
                    attachmentsLoaded: attachmentsLoaded //mando al server gli allegati attualmente presenti
                },
                success: function(fp, o) {

                    Ext.Msg.alert('Attenzione', 'Allegato inserito correttamente!');

                    //ricarico il dataview
                    var data = o.result.data;
                    editDataView.getStore().loadData(data);

                    //chiudo la finestra dell upload
                    formWindow.close();

                },
                failure: function(a,res) {
                    // console.info(res);
                    if (res.msgError) {
                        var error = res.msgError;
                    }
                    else {
                        var error = 'Impossibile caricare allegati in questo momento.<br />Riprorare più tardi.';
                    }
                    formWindow.close();
                    Ext.Msg.alert('Errore',error);
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Inserire un\'etichetta');
        }
    }
});
