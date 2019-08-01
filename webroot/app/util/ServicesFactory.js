Ext.define('SIO.util.ServicesFactory', {
    singleton : true,
    alternateClassName : ['SIO.Services'],

    serviceUrl : '',

    rpc: function(config) {
        var me = this,
            method = config.method || 'GET',
            headers = {
                'X-Application-Name' : 'add'
            },
            timeout = config.timeout || 120000;

        Ext.Ajax.request({
            url      : me.serviceUrl + config.url,
            method   : method,
            headers  : headers,
            jsonData : config.params,
            timeout  : timeout,
            success  : function (response) {
                var o = Ext.decode(response.responseText);
                if (config.callback) {
                    config.callback(o);
                }
                else {
                    log('debug', o);
                }
            },
            failure  : function (response) {
                var o = null;
                try {
                    var o = Ext.decode(response.responseText);
                } catch (e) {}
                if (o && config.fallback) {
                    config.fallback(o);
                } else {
                    config.fallback();
                }
            }
        });
    },

    checksession: function(callback) {
        this.rpc({
            url      : 'users/checksession',
            callback : callback
        });
    },

    loadConfiguration: function (callback) {
        this.rpc({
            url      : 'configurations.json',
            callback : callback
        });
    },

    loadSubmissions: function(callback) {
        this.rpc({
            url      : 'submissions.json',
            callback : callback
        });
    },

    saveOpinion: function(params, callback, fallback) {
        this.rpc({
            url     : 'opinions/save',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback
        });
    },

    saveSubmission: function(params, callback, fallback) {
        this.rpc({
            url     : 'submissions/save',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback
        });
    },
	saveUserProjects: function(params, callback, fallback) {
        this.rpc({
            url     : 'user_projects/save',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback
        });
    },
	saveTownProjects: function(params, callback, fallback) {
		this.rpc({
			url     : 'town_projects/save',
			params  : params,
			method  : 'POST',
			callback: callback,
			fallback: fallback
			
		});
	},
    updateProvinceNote: function(params, callback, fallback) {
        this.rpc({
            url     : 'submissions/updatePronviceNote',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback
        });
    },
	deleteProjectShape: function(params,callback, fallback, timeout) {
		this.rpc({
			url     : 'projects/deleteShape',
			params  : params,
			method  : 'POST',
			callback: callback,
            fallback: fallback,
            timeout : timeout
		});
	},
	exportShape: function(params,callback,fallback) {
		this.rpc({
		url         : 'submissions/export_shapes',
		params      :  params,
		method      :  'POST',
		callback    : callback,
		fallback    : fallback
		});
	},
	 deleteSubmission: function(params, callback) {
        this.rpc({
            url      : 'submissions/delete',
            callback : callback,
            params  : params,
            method  : 'POST'
        });
    },

    removeUpload: function(params, callback, fallback) {
        this.rpc({
            url     : 'attachments/removeUpload',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback
        });
    },

    removeOldUpload: function(params) {
        this.rpc({
            url     : 'attachments/removeOldUpload',
            params  : params,
            method  : 'POST'
        });
    },

    generatePassword: function(params, callback, fallback) {
        this.rpc({
            url     : 'users/generatePassword',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback
        });
    },

    setSystemSettings: function(params, callback, fallback, timeout) {
        this.rpc({
            url     : 'configurations/setSystemSettings',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback,
            timeout : timeout
        });
    },

    getSystemSettings: function(params, callback, fallback, timeout) {
        this.rpc({
            url     : 'configurations/getSystemSettings',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback,
            timeout : timeout
        });
    },
	    getProjectSettings: function(params, callback, fallback, timeout) {
        this.rpc({
            url     : 'configurations/getProjectSettings',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback,
            timeout : timeout
        });
    },
		setProjectSettings: function(params, callback, fallback, timeout) {
        this.rpc({
            url     : 'configurations/setProjectSettings',
            params  : params,
            method  : 'POST',
            callback: callback,
            fallback: fallback,
            timeout : timeout
        });
    },
	
});