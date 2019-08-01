Ext.define('SIO.controller.Login', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'loginForm',
            selector: '[xtype=login.form]'
        }
    ],

    init: function() {
        this.listen({
            global: {
                passwordexpired: this.onPasswordExpired,
				loggedinuser: this.loggedinuser,
            }
        });
    },

	//dopo aver inserito user e password apro finestra della selezione progetti
	loggedinuser: function(userData) {
		var me = this;
	     Ext.create('Ext.window.Window', {
			title: 'Seleziona progetto',
			width: 400,
			height: 150,
			autoScroll: true,
			modal: true,
			items: [{ 
						xtype: 'login.loginprojectcombo',
						user_id: userData
					}],
			buttons: 
			[{
				text: 'Carica',
				handler: this.loadProject,
				flex: 1
			},
			{
				text: 'Esci',
				handler: this.backToLogin,
				flex: 1
			}],
		}).show();
		
		
		
	},
	loadProject : function(view) {		
		user_id = view.up('panel').down('combobox').ownerCt.user_id;
		project_id = view.up('panel').down('combobox').lastValue;
		if(!project_id){
			Ext.Msg.alert('Attenzione','Selezionare un progetto.');
		}else{
			
		var params = {'user_id': user_id, 'project_id': project_id};
		 Ext.Ajax.request({
                url: 'users/checksession',
                params: params,
				method: 'POST',
                success: function(response){
                    // parse server response
                    response = Ext.JSON.decode(response.responseText);
                    if (response.success === true) {
                        // show main loading mask
                        SIO.showLoadingMask();
                        // destroy this window
                        //me.close();
						SIO.hideLoadingMask();
						
                        // fire global event
						if(response.data.settings.endDate == ''){
							Ext.Msg.alert('Attenzione','il progetto selezionato non ha impostazioni. Contattare l\'amministratore.');
						}else{
							
						if(response.message != ''){
							console.log('ciao');
							Ext.Msg.alert('Attenzione', 'il progetto non è attivo.');
						}
                        Ext.globalEvents.fireEvent('loggedin', response.data);
						view.up('window').close();
						}
                    } else if (response.success === false) {
                            // send user feedback
                            SIO.showNotification(response.message);                       
                    }
                },
                failure: function() {
                    // unmask
                    me.getEl().unmask();
                    // send feedback
                    Ext.Msg.alert('Attenzione', 'Impossibile caricare il progetto in questo momento.<br />Riprovare pi&ugrave; tardi.')
                }
            });
		}
		},
	backToLogin : function() {
		Ext.globalEvents.fireEvent('logout');
		},
		
    onPasswordExpired: function(message) {
        var me = this,
            loginForm = me.getLoginForm(),
            // copy username value
            username = loginForm.down('#username'),
            // copy password value
            oldPassword = loginForm.down('#password');
        // request feedback
        /*Ext.Msg.confirm('Attenzione', 'Per continuare devi cambiare la password provvisoria.', function(btn) {
            if (btn == 'yes') {
                // close loginForm window
                loginForm.close();
                // define password renew window
                var renewwin = Ext.create('SIO.view.login.ChangePwd');
                // set username to renew form
                renewwin.down('#username').setValue(username.getValue());
                renewwin.down('#password').setValue(oldPassword.getValue());
                // show renew window
                renewwin.show();
            }
        });*/
		
		/*var fields = ['general.message'];
		SIO.Services.getSystemSettings({fields:fields}, function(response) {
				// unamsk the form
				me.el.unmask();
				if (response.status) {
					//form values
					settings = [];
					Ext.Object.each(response.settings,function(key, value) {
						settings.push(value);
					});
					
				} else {
					Ext.Msg.alert('Errore', 'Impossibile caricare le impostazioni');
				}
			});*/
        var acceptWindow = Ext.create('Ext.window.Window', {
            title: 'Attenzione',
            height: 550,
            width: 800,
            modal: true,
            layout: 'fit',
            items: {
                xtype: 'form',
                tbarCfg:{
                    buttonAlign:'center'  //for center align
                },
                padding: 10,
                items:[{
                    xtype : 'box',
                    width : 483,
                    height : 135,
                    html : '<img src="resources/login/header_long.png" />'
                },{
                    xtype: 'container',
                    html: '<center><h3>Per continuare devi cambiare la password provvisoria e accettare le condizioni, continuare?</h3></center>',
                    height: 40
                },{
                    xtype: 'container',
                    style: 'border: 1px solid grey;padding:10px',
                    margin: 10,
					html: message,
                   /* html: '<h3>Progetto di Database Topografico – Sistema Concertativo Territoriale - Dichiarazione di condivisione dei confini territoriali e accettazioni delle condizioni d\'uso</h3>' +
                        '<b style="text-decoration: underline;">Premesse amministrative</b>' +
                        '<p>La Provincia di Milano/Citt&agrave; Metropolitana sin dal 2006 si &egrave; attivamente impegnata a:' +
                        '<ul>' +
                        '<li>Partecipare a 5 bandi di cofinanziamento regionale in qualit&agrave; di Proponente Unico, curando la progettazione tecnica specifica e differenziata per ogni comune, nella salvaguardia della coerenza complessiva e nell\'interesse di massimizzare le economie di sistema derivanti da ciascun bando;</li>' +
                        '<li>Svolgere in proprio attivit&agrave; direzione lavori e coordinamento tecnico amministrativo dell\'appalto.</li>' +
                        '<li>Sviluppare possibili percorsi tecnici, formativi, collaborativi e gestionali in partnership con la Regione.</li>' +
                        '<li>Sono coinvolti direttamente tramite la citt&agrave; metropolitana 189 comuni, nell\'area metropolitana e nella provincia di Monza e Brianza, per un totale di circa di 4.000.000 € di finanziamenti dei diversi enti partecipati</li>' +
                        '</ul>'+
                        '</p>' +
                        '<p>Attualmente &egrave; in corso l\'ultimo progetto di produzione di cartografia ex novo per 47 comuni e l\'omogeneizzazione geometrica, tematica e funzionale dei DBT dell\'intero territorio, per svolgere il quale &egrave; stato affidato, mediante un bando ad evidenza pubblica, un contratto alle societ&agrave; Sit Srl e Corvallis Spa (RTI) a decorrere dal 29/1/2015.</p>' +
                        '<p>La definizione dei limiti amministrativi &egrave; tra le informazioni necessarie da reperire per la costituzione del Data base Topografico; secondo le modalit&agrave; previste dal Decreto Regionale Territorio e Urbanistica del 10/11/2006 n. 12520 "Approvazione di linee guida per la realizzazione degli strumenti SIT integrato per la pianificazione locale ai sensi dell\'art. 3 della l.r. 12/2005" <b>&egrave; necessario individuare in modo univoco il confine del territorio comunale;</b></p>' +
                        '<p>Dato atto che, ai sensi della DGR 8/6650 del 20/02/2008, per ottenere questo nuovo strato informativo &egrave; necessario  che  la  nuova  geometria  sia  accompagnata  da  una  dichiarazione  congiunta  sottoscritta  dalle Amministrazioni confinanti che certifichi l\'avvenuto accordo e con la quale esse convergono sul fatto che <b>la nuova dividente sia da utilizzare in tutti gli archivi gestiti da Regione Lombardia;</b></p>' +
                        '<p>A tale scopo la Citt&agrave; Metropolitana di Milano, in qualit&agrave; di Ente capofila, ha  attivato un progetto di omogeneizzazione di tutte le attivit&agrave; di produzione DBT pregresse e a completamento dell\'intero territorio dei 189 Comuni; in tale progetto &egrave; stato predisposto il portale SICLA: <b>Sistema Concertativo Limiti Amministrativi</b>  con il quale si prevede di ottemperare a quanto richiesto da Regione Lombardia in merito al riporto dei limiti amministrativi.</p>' +
                        '<b style="text-decoration: underline;">Risultato finale dell\'attivit&agrave; concertativa</b>' +
                        '<p>La definizione delle nuove geometrie, derivante dai processi di concertazione definiti sul webgis SICLA, diventer&agrave; il dato ufficiale di riferimento per la cartografia regionale andando  a  sostituire  gli  attuali  limiti  amministrativi  presenti  sulla  Carta  Tecnica  Regionale  (CTR)  e  dovr&agrave; essere usato quale confine comunale per la cartografia ufficiale dei Piani di Governo del Territorio (PGT).</p>' +
                        '<b style="text-decoration: underline;">Accettazione Attivit&agrave; Concertativa e Tempi</b>' +
                        '<p>I comuni che si registrano al sito "Sistema Concertativo Limiti Amministrativi" mediante accredito con credenziali certificate e protette nel sito webgis ACCETTANO CONTESTUALMENTE:' +
                        '<ul>' +
                        '<li>di condividere  i  limiti  amministrativi  così  come  risultano  dalla/e  planimetria/e derivanti dal processo di concertazione via web;</li>' +
                        '<li>di essere edotti che il processo di concertazione potr&agrave; essere svolto da un unico utente per ciascun comune e che tale processo dovr&agrave; concludersi entro e non oltre il 30/05/2015;</li>' +
                        '<li>di essere  edotti  in  merito  al  fatto  che  le  nuove  geometrie  così  definite  saranno  utilizzate  in  tutti  gli archivi del SIT integrato ed, in particolare, per la Carta  Tecnica  Regionale  (CTR) e per la cartografia ufficiale dei Piani di Governo del Territorio (PGT);</li>' +
                        '<li>di dare  mandato  alla  Citt&agrave; Metropolitana di Milano  di  inoltrare  lo storico delle interazioni avvenute sul sito in  segno  di  trovato  accordo,  al  RTI appaltatore per il riporto nel Database Topografico;</li>' +
                        '<li>di dare  mandato  alla  Citt&agrave; Metropolitana di Milano di  inoltrare a  Regione Lombardia, alla consegna  del  prodotto  finito, copia dello storico quale certificazione.</li>' +
                        '</ul>' +
                        '</p>',*/
                    height: 200,
                    autoScroll: true
                },{
                    xtype: 'checkbox',
                    boxLabel  : 'Accetta le condizioni',
                    name      : 'accept',
                    itemId    : 'accept',
                    margin    : '0 0 0 10',
                    inputValue: '1'
                }],
                dockedItems: [{
                    xtype: 'toolbar',
                    layout:{
                        pack: 'center'
                    },
                    buttonAlign:'center',
                    dock: 'bottom',
                    items: [{
                        text: 'SI',
                        width: 100,
                        scale: 'medium',
                        handler: function() {
                            var me = this,
                                acceptWindow = me.up('window'),
                                acceptCheckBox = acceptWindow.down('#accept');

                            if (!acceptCheckBox.getValue()) {
                                acceptCheckBox.markInvalid('E\' obbligatorio accettare le condizioni');
                                Ext.Msg.alert('Attenzione','E\' obbligatorio accettare le condizioni');
                                return false;
                            }
                            // close loginForm window
                            loginForm.close();

                            acceptWindow.close();
                            // define password renew window
                            var renewwin = Ext.create('SIO.view.login.ChangePwd');
                            // set username to renew form
                            renewwin.down('#username').setValue(username.getValue());
                            renewwin.down('#password').setValue(oldPassword.getValue());
                            // show renew window
                            renewwin.show();
                        }
                    },{
                        text: 'NO',
                        width: 100,
                        scale: 'medium',
                        handler: function() {
                            this.up('window').close();
                        }
                    }]
                }]
            }
        }).show();

    }
});