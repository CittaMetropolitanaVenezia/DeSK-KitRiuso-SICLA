Ext.define('SIO.view.Main', {
    extend: 'Ext.container.Container',
    requires:[
        'SIO.view.submissions.Map',
        'SIO.view.submissions.Grid',
        'SIO.view.submissions.edit.Panel',
        'SIO.view.submissions.detail.Panel'
    ],
    
    xtype: 'app-main',

    layout: {
        type: 'border'
    },
    style: {
        backgroundColor: 'white'
    },

    items: [
        {
            xtype: 'panel',
            region: 'north',
            height: 65,
            html: [
                '<img style="float: left;" src="resources/logos/header-left.png" />',
                '<img style="float: right;" src="resources/logos/header-right.png" />'
            ].join(''),
            bodyStyle: 'background-position: top center; background-image: url(resources/logos/background.jpg)'
        },{
            xtype: 'panel',
            layout: 'fit',
            title: 'SiCLA - Sistema Concertativo',
            region: 'center',
            items: [
                {
                    xtype: 'submissions.map',
                    initialLocation: [45.51019654498558, 9.14337158203125],
                    initialZoomLevel: 10
                }
            ]
            /*
            header:{
                titlePosition: 0,
                items:[{
                    xtype:'button',
                    glyph: 61504,
                    text: 'Nuova Osservazione',
                    handler: function(){
                        alert('button clicked!');
                    }
                }],
                style: {
                    paddingTop: '6px',
                    paddingBottom: '6px'
                }
            }
            */
        },{
            region: 'east',
            layout: 'card',
            width: 450,
            style: {
                //paddingRight: '10px'
            },
            bodyStyle: {
                //backgroundColor: '#efefef'
            },
            //title: 'Elenco Osservazioni',
            items: [
                { xtype: 'submissions.grid'},
                { xtype: 'submissions.edit.panel' },
                { xtype: 'submissions.detail.panel' }
            ],
            bbar: [
                '&copy;2019 - <a href="http://www.corvallis.it/" target="_blank" title="Vai al sito ufficiale di Corvallis Spa">Corvallis Spa</a>',
                '->',
                {
                    glyph: 61459,
                    tooltip: 'Configura',
                    hidden: true,
                    disabled: true,
                    listeners: {
                        render: function(btn) {
                            // visible only for province
                            if(SIO.Settings.isProvince() && SIO.Settings.isAdmin()) this.show();
                            // enable only after towns loaded
                            var store = Ext.getStore('Towns');
                            if (store.getCount()) {
   								btn.setDisabled(false);
                            } else {
                                store.on({
                                    load: {
                                        fn: function() {
                                            btn.setDisabled(false);
                                        },
                                        single: true
                                    }
                                });
                            }
                        },
                        click: function() {
                            Ext.globalEvents.fireEvent('adminopen');
                        }
                    }
                },
                {
                    glyph: 61546,
                    hidden: true,
                    listeners: {
                        render: function() {
                            if (SIO.Settings.isTown()) this.show();
                        }
                    },
                    text: 'Disclaimer',
                    handler: function() {
                        window.open('files/disclaimer.pdf');
                    }
                },
                {
                    glyph: 61529,
                    text: 'Manuale',
                    handler: function() {
                        window.open('files/manuale.pdf');
                    }
                },
                {
                    glyph: 61457,
                    //text: 'Esci',
                    cls: 'btn-red',
                    handler: function() {
                        Ext.globalEvents.fireEvent('logout');
                    }
                }
            ]

        }
    ]
});