/***********************************************
 Adds extension validation at the client side
 for the extjs File Upload field. You must
 set the extension in an array of strings.
 **********************************************/
Ext.define('SIO.ux.form.field.RestrictiveFile', {
    extend: 'Ext.form.field.File',
    alias: 'widget.restfileupload',
    // Array of acceptable file extensions
    // overridden when decalred with a string
    // of extensions minus the period.
    accept: [],

    initComponent: function() {
        var me = this;
		me.on('render', function () {
			me.fileInputEl.set({ multiple: true });
        });
        me.callParent(arguments);
    },

    onChange: function(f) {
        var me = this;
        // fix accept (all uppercase)
        var extensions = [];
        Ext.Array.each(me.accept, function(a) {
            extensions.push(a.toUpperCase());
        });
        // me gets the part of the file name after the last period
        var indexofPeriod = me.getValue().lastIndexOf("."),
            uploadedExtension = me.getValue().substr(indexofPeriod + 1, me.getValue().length - indexofPeriod).toUpperCase();

        // See if the extension is in the
        //array of acceptable file extensions
        if (!Ext.Array.contains(extensions, uploadedExtension)){
            // Add the tooltip below to
            // the red exclamation point on the form field
            me.setActiveError('Selezionare un file con una delle seguenti estensioni:  ' + extensions.join());
            // Let the user know why the field is red and blank!
            Ext.MessageBox.show({
                title   : 'Tipo di file errato',
                msg   : 'Selezionare un file<br />con una delle seguenti estensioni: <b>' + extensions.join() + '</b>',
                buttons : Ext.Msg.OK,
                icon  : Ext.Msg.ERROR
            });
            // Set the raw value to null so that the extjs form submit
            // isValid() method will stop submission.
            me.setRawValue(null);
        } else {
            me.fireEvent('filechecked', me, me.getValue());
        }
    },
	onFileChange: function (button, e, value) {
        this.duringFileSelect = true;
        var me = this,
            upload = me.fileInputEl.dom,
            files = upload.files,
            names = [];

        if (files) {
            for (var i = 0; i < files.length; i++)
                names.push(files[i].name);
            value = names.join(', ');
        }
        Ext.form.field.File.superclass.setValue.call(this, value);

        delete this.duringFileSelect;
    }
});
