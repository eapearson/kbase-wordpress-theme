define(["timezone", "mustachio", "jquery", "lodash", "marked", "dfwapp"], 
       function(timezone, mustachio, _, marked, dfwapp) {
    "use strict";

    var app = Object.create({});

    app.init = function () {
        this.TimezoneManager = Object.create(timezone.TimezoneManager).init({
            zoneFileBasePath: '/scripts/modules/timezone/files',
            loadingScheme: timezone.TimezoneManager.loadingSchemes.MANUAL_LOAD,
            defaultZoneFile: [],
            zoneJSONPath: '/scripts/modules/timezone/files/all_cities.json'
        });

        // The main app has the message manager.
        this.app = Object.create(dfwapp.MainApp, {
            id: {
                value: "main"
            }
        }).init();

        this.msgMan = this.app.messageManager;

        return this;
    }

    // window.timezoneManager = app.TimezoneManager;   

    app.Template = Object.create(mustachio.Base, {
        modifiers: {
            value: {
                upper: function(value) {
                    if (value) {
                        return value.toUpperCase();
                    } else {
                        return value;
                    }
                },
                lower: function(value) {
                    if (value) {
                        return value.toLowerCase();
                    } else {
                        return value;
                    }
                },
                markdown: function(value) {
                    if (value) {
                        return marked(value);
                    } else {
                        return value;
                    }
                }
            }
        },
        tagFunctions: {
            value: {
                tzFormatDate: function(timeString, tzString, format) {
                    switch (tzString) {
                    case "BROWSER":
                        tzString = undefined;
                        break;
                    }
                    var formatter = Object.create(timezone.Format);
                    var time = Object.create(timezone.Date).init(timeString, app.TimezoneManager, tzString);
                    return formatter.strftime(format, time);
                }
            }
        }
    });

    app.fetchTemplate = function (config) {
        var url = "/templates/" + config.name + ".mustache";
        return app.ajax(url, config);
        // return JQ.get(url);
    };

    /*app.fetchContent = function (config) {
        // alert("Config type is "+config.type);
        var path = "/test/rest/content/some/" + config.type + "/" + config.view,
            keys = JSON.stringify(config.keys),
            config = config ? config : {},
            reverse = config.reverse ? "true" : "false",
            query = "startkey=" + encodeURIComponent(JSON.stringify(config.startkey)) +
                    "&endkey="+ encodeURIComponent(JSON.stringify(config.endkey)) +
                    "&reverse=" + reverse,
            url = path + "?" + query;
        // alert("Path="+path+", query="+query);
        return app.ajax(url, config);
        // return JQ.get(url);
    }
    */

     app.fetchContent = function (config) {
        // alert("Config type is "+config.type);
        var path = "/view/" + config.name,
            // keys = JSON.stringify(config.keys),            
            reverse = config.reverse ? "true" : "false",
            query = [];
        Object.keys(config.query).forEach(function (key) {
            query.push(key + "=" + encodeURIComponent(config.query[key]));
        });
        // alert("query:"+JSON.stringify(query));
        return app.ajax(path+"?"+query.join("&"), config);
        // return JQ.get(url);
    }


    app.fetchContentItem = function (config) {
        var path = "/rscgi/rest/content/one/" + config.type + "/" + config.view,
            key = JSON.stringify(config.id),
            query = "key="+encodeURIComponent(key),
            url = path + "?" + query;

        return app.ajax(url, config);
    }


    app.nowISO = function () {
        return Object.create(timezone.Date).init(new Date(), this.TimezoneManager, "Etc/UTC").toISOString();
    }

    app.requestURL = function () {
        var url = window.location.href,
            re = new RegExp(/^([^?]*)(?:\?([^#]*))?(?:\#(.*))?$/),
            parsed = re.exec(url),
            fields = {};
        if (parsed[2]) {
            LD.forEach(parsed[2].split("&"), function (field) {
                var pair = field.split("=");
                fields[pair[0]] = pair[1];
            });
        }
        return {url: parsed[1], query: fields, queryString: parsed[2], fragment: parsed[3]};
    }

    function ajaxHandler (e, handler) {
        var req = e.currentTarget;
        try {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    try {
                        if (handler.onSuccess) {
                            handler.onSuccess(req);
                        }
                    } catch (ex) {
                        if (handler.onError) {
                            handler.onError({message: "Exception running 'success' callback: "+ex.toString()+","+ex.toString()});
                        }
                    }
                } else {
                    if (handler.onError) {
                        handler.onError({message: "Error getting data ("+req.status+")"});
                    }
                }
            } else {
                if (handler.onProgress) {
                    handler.onProgress(req);
                }
            }
        } catch (ex) {
            if (handler.onError) {
                handler.onError({message: "Exception processing data ajax "+ex.toString()});
            }
        }
    }

    app.ajax = function(url, config) {
        var req;
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                req = new ActiveXObject('Msxm2.XMLHTTP');
            } catch (e) {
                try {
                    req = new ActiveXObject('Microsoft.XMLHTTP');
                } catch (e) {
                    // Do nothing.
                }
            }
        }

        if (!req) {
            return false;
        }
        // alert("About to ajax: "+url)
        req.onreadystatechange = function (e) {
            ajaxHandler(e, config.handler);
        };
        req.open('GET', url);
        req.send();
        return true;

    }

    app.DisplayApplet = Object.create(dfwapp.Applet, {
        /* 
        Instsance Vars
        template: Template object
        Data: Object
        domReady: boolean
        containerSelector: string 
        fetchContent: Function, sets the data instance variable
        fetchTemplate function, sets the template instance variable


        template: {
            value: undefined, writable: true
        },
        data: {
            value: undefined, writable: true
        },
        domReady: {
            value: undefined, writable: true
        },
        containerSelector: {
            value: undefined, writeable: true
        },
         fetchContent: {
            value:  function() {
                    // noop
                    return undefined;
                }, writable: true
        },
        fetchTemplate: {
            value:  function() {
                    // noop
                    return undefined;
                }, writable: true
        },
        */
        /* Init */
        init: {
            value: function (config) {
                this.domReady = false;
                this.data = undefined;
                this.template = undefined;
                this.messageManager = config && config.messageManager;
                this.containerSelector = config.containerSelector;
                this.container = JQ(config.containerSelector);
                this.displayLoading("Waiting...");

                return this;
            }
        },

        /* Methods */
        data: {
            get: function() {
                return this._data;
            },
            set: function(value) {
                this._data = value;
                if (this.messageManager) {
                    this.messageManager.broadcastSimpleMessage('setdata', {applet: this}, this.id);
                }
            }
        },
        /*getData: {
            value: function () {
                // Default behavior is to just return
                // the data object.
                return this.data;
            }, writable: true
        },
        setData: {
            value: function () {
                return 
            }
        }
        */
       
        updateDisplay: {
            value: function(from) {
                //  alert("Updating "+this.id+" from "+from+". template? "+(this.template?"yes":"no")+", data?" +(this.data?"yes":"no") + ", dom? "+ (this.domReady?"yes":"no")+".");
                //                 
                if (this.template && this.data && this.container) {
                   //alert(JSON.stringify(this.data.content[0].value.item));
                   //alert(this.template.tempateString);
                    this.container.html(this.template.render(this.data));
                }
                return this;
            }
        },
        displayLoading: {
            value: function(msg) {
                if (this.container) {
                    this.container.html(msg || "Loading...");
                }
                return this;
            }
        },
        showError: {
            value: function(location, msg) {
                if (this.container) {
                    this.container.html(this.id+" => "+ msg + " @ " + location);
                }
                return this;
            }
        },
        onStart: {
            value: function(msg) {
                if (this.fetchContent) {
                    this.fetchContent();
                }
                if (this.fetchTemplate) {
                    this.fetchTemplate();
                }
                return this;
            }
        },
        onRefresh: {
            value: function(msg) {
                this.data = undefined;
                this.template = undefined;
                 if (this.fetchContent) {
                    this.fetchContent();
                }
                if (this.fetchTemplate) {
                    this.fetchTemplate();
                }
                return this;
            }
        },
        onRender: {
            value: function(msg) {
                this.updateDisplay();
                return this;
            }
        },
        onDOMReady: {
            value: function(msg) {
                this.container = JQ(this.containerSelector);
                this.domReady = true;
                this.updateDisplay("onDOMReady");
                return this;
            }
        },
        onStop: {
            value: function(msg) {
                alert("Saying goodbye, then.");
            }
        }
    });


    /*
    A form is created by a inserting the template once, then rendering the data once,
    then handling the updates from the form fields to the data.

    The form will be scanned the first time that either fetchContent, fetchData, or domReady
    

    Refresh will just re render the data into the template not reinsert the template.
    onStart - insert template, update data, hook up events.
    onRefresh - update form from data
    onSave - send data from form to server

    */
    app.FormApplet = Object.create(dfwapp.Applet, {
        /* 
        Instsance Vars
        template: Template object
        Data: Object
        domReady: boolean
        containerSelector: string 
        fetchContent: Function, sets the data instance variable
        fetchTemplate function, sets the template instance variable
        /* Init */
        init: {
            value: function (config) {
                this.domReady = false;
                this.data = undefined;
                this.template = undefined;
                this.rendered = false;                
                this.msgMan = config.messageManager;
                this.containerSelector = config.containerSelector;
               
                return this;
            }
        },

        /* Methods */
        getData: {
            value: function () {
                // Default behavior is to just return
                // the data object.
                return this.data;
            }, writable: true
        },
        scanForm: {
            value: function () {
                var that = this;
                if (this.rendered) {
                    var data = this.getData();
                    var form = JQ('#journalEntryEditor');
                    if (form) {
                        // Set up fields.
                        form.children().each(function() {
                            var node = JQ(this);
                            var fieldName = node.data('dfwField');
                            if (fieldName) {
                                var value = data.content.item[fieldName];
                                var htmlFriendlyValue = value.replace(/\n/g, '<br>');
                                node.
                                    find(".control").html(htmlFriendlyValue).
                                    attr('contentEditable', true).
                                    addClass('editable').
                                    on('DOMSubtreeModified', function (event) {
                                        var n = JQ(event.target);
                                        var text = n.html().replace(/<br>/g, '\n');
                                        data.content.item[fieldName] = text;
                                        that.msgMan.broadcastSimpleMessage("formUpdated" )
                                    });
                            }
                        });
                        // Set up controls.
                        var saveButton = form.find(".button.save");
                        if (saveButton) {
                            saveButton.on('click', function() {
                                that.onSave();
                            });
                        } else {
                            window.alert("No save button for this form!")
                        }
                        
                    }
                }
            }
        },
        refreshForm: {
            value: function () {
                // nothing for now.
            }
        },
        updateDisplay: {
            value: function(from) {
                // alert("Updating "+this.id+" from "+from+". template? "+(this.template?"yes":"no")+", data?" +(this.data?"yes":"no") + ", dom? "+ (this.domReady?"yes":"no")+".");
                if (this.template && this.getData() && this.domReady) {
                    if (!this.rendered) {
                        this.container.html(this.template.render(this.getData()));
                        this.rendered = true;
                        this.scanForm();
                        
                    }
                }
                return this;
            }
        },
        displayLoading: {
            value: function() {
                if (this.domReady) {
                    this.container.html("Loading...");
                }
                return this;
            }
        },
        showError: {
            value: function(location, msg) {
                if (this.domReady) {
                    this.container.html(this.id+" => "+ msg + " @ " + location);
                }
                return this;
            }
        },
        onStart: {
            value: function(msg) {
                if (this.fetchContent) {
                    this.fetchContent();
                }
                if (this.fetchTemplate) {
                    this.fetchTemplate();
                }
                var that = this;
                JQ(document).ready(function() {    
                    that.onDOMReady();    
                });
                return this;
            }
        },
        onRefresh: {
            value: function(msg) {
                this.data = undefined;
                this.template = undefined;
                this.onStart(msg);
                return this;
            }
        },
        onRender: {
            value: function(msg) {
                this.updateDisplay();
                return this;
            }
        },
        onDOMReady: {
            value: function(msg) {
                
                this.domReady = true;

                this.updateDisplay("onDOMReady");
                return this;
            }
        },
        onStop: {
            value: function(msg) {
                alert("Saying goodbye, then.");
            }
        },
        onSave: {
            value: function(msg) {
                var data = this.getData();
                // For now we are just saving the item.
                var id = data.content._id;
                var json = JSON.stringify({
                    id: id,
                    rev: data.content.rev,
                    item: data.content.item
                });

                // DO jquery ajax for now...
                
                JQ.ajax({
                    method: 'PUT',
                    url: '/coco/rest/_crud/content/item/'+id,
                    processData: false,
                    data: json,
                    contentType: 'application/json; charset=UTF-8',
                    success: function (res, status, xhr) {
                        alert("Yay, it worked~");
                    },
                    error: function (xhr, status, err) {
                        alert("Boo, hiss, error: "+err);
                    }
                })
                  
                // alert("Saving, really..." + id);
            }
        }
    });

    app.ContentHandler = Object.create({}, {
        /*applet: {
            value: undefined, writable: true
        },
        */
        init: {
            value: function(config) {
                this.applet = config.applet;
                return this;
            }
        },
        onError: {
            value: function(error) {
                this.applet.showError("fetchContent", error.message);
            }
        },
        onProgress: {
            value: function(req) {
                this.applet.displayLoading();
            }
        },
        onSuccess: {
            value: function (req) {   
                var t = req.responseText;
                // alert("Content: "+t);
                this.applet.data = JSON.parse(t);
                this.applet.updateDisplay("ContentHandler");
            }
        }
    });

    app.TemplateHandler = Object.create({}, {
        /*
        applet: {
            value: undefined, writable: true
        },
        */
        init: {
            value: function (config) {
                this.applet = config.applet;
                return this;
            }
        },
        onError: {
            value: function(error) {
                alert("error: "+error.message);
                this.applet.showError("fetchTemplate", error.message);
            }
        },
        onProgress: {
            value: function(req) {
                this.applet.displayLoading();
            }
        },
        onSuccess: {
            value: function (req) {   
                var t = req.responseText;
                this.applet.template = Object.
                                        create(app.Template).
                                        init({template: t}).
                                        compile();
                this.applet.updateDisplay("TemplateHandler");
            }
        }
    });

    app.EditorApp = Object.create(dfwapp.App, {   
        /* Instance vars:
        data: Object, used by all child applets for display.
        domReady: boolean - flag
        fetchContent: function, shhould be added via create.
        data: {
            // One data object for this app, each applet uses this data.
            value: undefined, writable: true
        },
        domReady: {
            // One dom ready flag.
            value: undefined, writable: true
        },
        fetchContent: {
            // One method for fetching data
            value: undefined, writable: true
        },
        */
        init: {
            value: function (config) {
                /*var superInit = Object.getPrototypeOf(this).init;
                if (superInit) {
                    // superInit.bind(this).call(config);
                    superInit.apply(this, [config]);
                } 
                */ 
                dfwapp.App.init.bind(this).call(config);          
                if (config) {
                    this.data = config.data;
                    this.domReady = config.domReady;
                }

                return this;
            }
        },
        getData: {
            value: function() {
                return this.data;
            }
        },
        updateDisplay: {
            value: function() {
                //alert("Updating "+this.id+"template? "+(this.template?"yes":"no")+", data?" +(this.data?"yes":"no") + ", dom? "+ (this.domReady?"yes":"no")+".");
                //  alert("here:" + this.editorTemplate +", "+ this.previewTemplate +", "+this.data + ", "+this.domReady);
                if (this.editorTemplate && this.previewTemplate && this.data && this.domReady) {
                    // Find the editor form.

                    // Maybe don't need to render a template ...
                    JQ(this.previewcontainerSelector).html(this.previewTemplate.render(this.data));
                    JQ(this.editorcontainerSelector).html(this.editorTemplate.render({}));

                    var form = JQ(this.editorQuery);
                   
                    if (form) {
                        // first pass, just shallow.
                        // alert('here'+form.children().length);
                        var that = this;  
                        form.children().each(function() {
                            var node = JQ(this);
                            var fieldName = node.data('dfwField');
                            if (fieldName) {
                                var value = that.data.content.item[fieldName];                               
                                node.find(".control").text(value).attr('contentEditable', true).addClass('editable');
                            }
                        });
                    }                        
                }
                return this;
            }
        },
        displayLoading: {
            value: function() {
                if (this.domReady) {
                    LD.forEach(this.subApplets, function (applet) {
                        applet.displayLoading('Loading...');
                    });
                }
            }
        },
        onStart: {
            value: function() {
                this.fetchContent();    
                LD.forEach(this.subApplets, function (applet) {
                    // shortcut sending messages??
                    applet.onStart();
                });
                return this;
            }
        },
        onRefresh: {
            value: function() {
                this.fetchContent();    
                LD.forEach(this.subApplets, function (applet) {
                    applet.onRefresh();
                });
                return this;
            }
        },
        onDOMReady: {
            value: function() {
                LD.forEach(this.subApplets, function (applet) {
                    applet.onDOMReady();
                });
                return this;
            }
        },
        onStop: {
            value: function(msg) {
                alert("Saying goodbye, then.");
            }
        }
    });

    app.insertScript = function (url, urlssl, id) {
        var scriptNode = document.createElement('script');
        scriptNode.type = 'text/javascript';
        scriptNode.async = true;
        if (id) {
            if (document.getElementById(id)) {
                return;
            }
            scriptNode.id = id;
        }
        if (url) {
            if (document.location.protocol == 'https') {
                scriptNode.src = 'https://' + (urlssl ? urlssl : url);
            } else {
                scriptNode.src = 'http://' + url;
            }
        } else {
            scriptNode.src = 'https://' + urlssl;
        }
        var scriptHolder = document.getElementById('scriptHolder');
        if (!scriptHolder) {
            scriptHolder = document.createElement('div');
            scriptHolder.id = 'scriptHolder';
            var parent = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0];
            parent.appendChild(scriptHolder);
        }
        scriptHolder.appendChild(scriptNode);
    }

    app.facebookWidget = function () {
        app.insertScript('/connect.facebook.net/en_US/all.js#xfbml=1', null, 'facebook-jssdk');
    }
    app.twitterWidget = function () {
        app.insertScript('/platform.twitter.com/widgets.js', null, 'twitter-wjs');
    }

    return app;
});
