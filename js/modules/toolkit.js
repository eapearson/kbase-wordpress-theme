define([], function() {
	"use strict";
	var DOMTools = Object.create({} , {
		matches: {
            value: function (node, selector) {
                if (node.matches) {
                    return node.matches(selector);
                } else if (node.mozMatchesSelector) {
                    return node.mozMatchesSelector(selector);
                } else if (node.msMatchesSelector) {
                    return node.msMatchesSelector(selector);
                } else if (node.webkitMatchesSelector) {
                    return node.webkitMatchesSelector(selector);
                } else if (node.oMatchesSelector) {
                    return node.oMatchesSelector(selector);
                } else {
                    // throw "Can't match a selector for " +node + " in this browser";
                    return null;
                }
            }
        },
        findAncestor: {
            value: function (node, selector) {
                while (node = node.parentNode) {
                    if (this.matches(node, selector)) {           
                        return node;
                    }
                }
                return false;
            }
        },
        nodeListEach: {
            value: function (nodeList, fun, thisArg) {
                for (var i=0; i < nodeList.length; i++) {   
                    fun.call(thisArg || this, nodeList.item(i));
                }
            }
        },
        urlPath: {
        	value: function  (url, defaultRoot) {
				var re = new RegExp("http[s]?://([^/]*)(/[^\?#]*)"),
					matches = re.exec(url);
				if (matches) {
					if (matches.length == 3) {
						var path = matches[2];
						if (path == "/") {
							return defaultRoot;
						} else {
							return path;
						}
					}
				} else if (matches.length == 2) {
					return defaultRoot;
				}
			}
		},
 		
    	requestURL: {
    		value: function () {
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
		},


		JSON: {
			value: window.JSON
		},
		transitionEndEvent: {
			value: function (node) {
				// see: http: / / stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers
				var events = [
					'transition','transitionend',
		            'OTransition','otransitionend',  // oTransitionEnd in very old Opera
		            'MozTransition','transitionend',
		            'WebkitTransition','webkitTransitionEnd'
				];
				for (var i = 0; i < events.length; i += 2) {
					var testStyle = events[i];
					var eventName = events[i+1];
					if (node.style[testStyle] !== undefined) {
						return eventName;
					}
				}
			}
		},
		transitionStyleName: {
			value: function (node) {
				// see: http: / / stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers
				var events = [
					'transition','transitionend',
		            'OTransition','otransitionend',  // oTransitionEnd in very old Opera
		            'MozTransition','transitionend',
		            'WebkitTransition','webkitTransitionEnd'
				];
				for (var i = 0; i < events.length; i += 2) {
					var testStyle = events[i];
					var eventName = events[i+1];
					if (node.style[testStyle] !== undefined) {
						return testStyle;
					}
				}
			}
		},
		onTransitionEnd: {
			value: function (node, fun) {

				var event = this.transitionEndEvent(node);
        		var handler = function (e) {
        			try {
        				fun();
        				
        			} catch (e) {
        				console.log('** ERROR ** running handler for onTransitionEnd: '+e)
        			} finally {
        				node.removeEventListener(event, handler, false);
        			}
        		};
				node.addEventListener(event, handler, false);
			}
		}
	});

	var Utils = Object.create({
		nowISO: {
 			value: function () {
        		return Object.create(timezone.Date).init(new Date(), this.TimezoneManager, "Etc/UTC").toISOString();
    		}
    	}
    })

	var AJAX = Object.create({}, {
		getRequestObject: {
			value: function () {
				if (window.XMLHttpRequest) {
		            return new XMLHttpRequest();
		        } else if (window.ActiveXObject) {
		            try {
		                return new ActiveXObject('Msxm2.XMLHTTP');
		            } catch (e) {
		                try {
		                    return new ActiveXObject('Microsoft.XMLHTTP');
		                } catch (e) {
		                    throw ("Can't create AJAX object")
		                }
		            }
		        }
			}
		},
		ajaxHandler: {
			value: function (e, handler) {
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
	    },
		get: {
			value: function(config) {
		        var req = this.getRequestObject();
		        var that = this;
		        req.onreadystatechange = function (e) {
		            that.ajaxHandler(e, config);
		        };
		        req.open('GET', config.url);
		        if (config.header) {
		        	config.header.forEach(function (field) {
		        		req.setRequestHeader(field.name, field.value);
		        	});
		        }
		        req.send();
		        return this;
		    }
		},
		post: {
			value: function(config) {
		        var req = this.getRequestObject();
		        var that = this;
		        req.onreadystatechange = function (e) {
		            that.ajaxHandler(e, config);
		        };
		        req.open('POST', config.url);
		        req.send(config.data);
		        return this;
		    }
		}
	});	

	return {
		DOMTools: DOMTools,
		Utils: Utils,
		AJAX: AJAX
	}
 });
