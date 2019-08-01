Ext.define('SIO.view.submissions.edit.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.edit.panel',
    requires: [
        'SIO.view.submissions.edit.Form',
        'SIO.view.submissions.edit.Grid',
        'SIO.view.submissions.edit.DataVIew',
        'SIO.view.submissions.edit.UploadForm'
    ],

    title: 'Nuova Osservazione',

    config: {
        thisPanelTitle: 'Nuova Osservazione',
        record: null,
        drawMode: ''
    },

    layout: 'border',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'submissions.edit.form',
                    height: 175,
                    region: 'north'
                },
                {
                    xtype: 'submissions.edit.grid',
                    region: 'center'
                },
                {
                    xtype: 'submissions.edit.dataview',
                    height: 150,
                    region: 'south',
                    collapsed: true,
                    collapsible: true
                }
            ],
            tbar: [
                'Strumenti',
                {
                    glyph: 'xe042@Icomoon',
                    tooltip: 'Inserisci/Modifica punto',
                    text: 'Punto',
                    toggleGroup: 'drawButtons',
                    itemId: 'drawPointBtn',
                    flex: 1,
                    allowDepress: false,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'point',
					disabled: !SIO.Settings.getAllowPoint()
                },
                {
                    glyph: 'xe15e@Icomoon',
                    tooltip: 'Inserisci/Modifica linea',
                    text: 'Linea',
                    toggleGroup: 'drawButtons',
                    itemId: 'drawLineBtn',
                    flex: 1,
                    allowDepress: false,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'line',
					disabled: !SIO.Settings.getAllowLine()
                },
				{
					glyph: 'xe15e@Icomoon',
                    tooltip: 'Inserisci/Modifica poligono',
                    text: 'Poligono',
                    toggleGroup: 'drawButtons',
                    itemId: 'drawPoligonBtn',
                    flex: 1,
                    allowDepress: false,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'polygon',
					disabled: !SIO.Settings.getAllowPoligon()
				},
                {
                    glyph: 61741,
                    tooltip: 'Cancella le geometrie disegnate',
                    text: 'Pulisci',
                    itemId: 'clearDrawBtn',
                    //disabled: true,
                    flex: 1,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'clear'
                }

            ],
            /*
            buttons: [
                {
                    text: 'Annulla',
                    glyph: 61540,
                    handler: function(btn) {
                        me.fireEvent('beforecancel', me, btn);
                    },
                    scope: me
                },
                {
                    text: 'Salva',
                    glyph: 61639,
                    handler: function(btn) {
                        me.fireEvent('beforesave', me, btn);
                    },
                    scope: me,
                    cls: 'btn-black'
                }
            ],
            */
            tools: [
                {
                    text: 'Annulla',
                    xtype: 'button',
                    glyph: 61714,
                    handler: function(btn) {
                        me.fireEvent('beforecancel', me, btn);
                    },
                    scope: me,
                    style: {
                        marginRight: '10px'
                    },
                    width: 90
                },
                {
                    text: 'Salva',
                    xtype: 'button',
                    glyph: 61639,
                    handler: function(btn) {
                        me.fireEvent('beforesave', me, btn);
                    },
                    scope: me,
                    cls: 'btn-green',
                    width: 90
                }
            ],

            header: {
                padding: '6px 5px 6px 10px'
            },
            listeners: {
                activate: me.onActivate
            }
        });

        me.callParent(arguments);
    },

    onActivate: function() {
        var me = this;
        // reset draw toolbar
        me.resetDrawToolbar();
        // filter neighbors grid
        me.filterNeighborsGrid();
    },

    filterNeighborsGrid: function() {
        var me = this,
            store = Ext.getStore('Towns'),
            neighborsIds = SIO.Settings.getTownNeighborsId();
        store.clearFilter();	
			store.on('load',function(){
				store.filterBy(function(record, id){
				if (neighborsIds.indexOf(id) > -1)
					return true
				});
			});	
    },

    resetDrawToolbar: function() {
        var me = this,
            drawPointBtn = me.down('#drawPointBtn'),
            drawLineBtn = me.down('#drawLineBtn'),
			drawPolyBtn = me.down('#drawPoligonBtn'),
            clearDrawBtn = me.down('#clearDrawBtn');
        // toggle draw buttons
        drawPointBtn.toggle(false, true);
        drawLineBtn.toggle(false, true);
		drawPolyBtn.toggle(false, true);
        // blur draw buttons
        drawPointBtn.blur();
        drawLineBtn.blur();
		drawPolyBtn.blur();
        // disable clearBtn
        clearDrawBtn.setDisabled(true);
        // set draw mode
        me.setDrawMode('');
    },

    changeContainerTitle: function() {
        var me = this;
        if (me.getRecord()) {
            me.up('container').setTitle('Modifica osservazione');
        } else {
            me.up('container').setTitle('Nuova osservazione');
        }
    },

    drawButtonsHandler: function(btn) {
        var me = this,
            currentDrawMode = me.getDrawMode();
        // clear drawed feature
		me.down('#clearDrawBtn').setDisabled(false);
        if (btn.drawMode == 'clear') {
            // ask confirmation
            SIO.Utilities.confirm('Sicuro di voler cancellare il disegno?', 'Conferma', function(res) {
                if (res == 'yes') {
                    // disable this button
                    me.resetDrawToolbar();
                    // fire clear event
                    me.fireEvent('cleardraw');
                    // reset draw mode
                    me.setDrawMode('');
                }
            });
        } else {
            if (btn.drawMode != currentDrawMode) {
                if (currentDrawMode != '') {
                    SIO.Utilities.confirm('Cambiando tipologia il precedente disegno verrà cancellato. Continuare?', 'Conferma', function(res) {
                        if (res == 'yes') {
                            // fire draw event
							if(SIO.Settings.getDrawOverLimits()){
								if(SIO.Settings.getShapeTable()){
									var store = Ext.getStore('Towns');
									store.removeAll();
								}
							}
                            me.fireEvent('startdraw', btn.drawMode);
                            // save mode
                            me.setDrawMode(btn.drawMode);
                        }
                    });
                } else {
                    // fire draw event
                    me.fireEvent('startdraw', btn.drawMode);
                    // save mode
                    me.setDrawMode(btn.drawMode);
                }
            }
        }
    }
});