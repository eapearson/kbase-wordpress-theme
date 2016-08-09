
// DFW Page App
define([], function () {
	var Applet = Object.create({}, {
		/*
		name: {
			value: undefined, writable: true
		},
		parent:  {
			value: undefined, writable: true
		},
		*/
		init: {
			value: function(config) {
				this.parent = config.parent;
				this.name = config.name;
				return this;
			}
		},

		start: {
			value: function() {
				// nothing to do in the base case.
				return this;
			}
		},

		stop: {
			value: function() {
				// nothing to do in the base case.
				return this;
			}
		}
	});

	var App = Object.create({}, {
		/*
		instance properties:
		applets: Object
		messageQueue: MessageQueue object
		messageHandlers: Object
		*/
		/*
		applets: {
			value: undefined, writable: true
		},

		messageQueue: {
			value: undefined, writable: true
		},
		
		messageHandlers: {
			value: undefined, writable: true
		},
		*/

		// Lifecycle
		init: {
			value: function (config) {
				if (config === undefined) {
					config = {};
				}
				this.applets = {};
				this.messageQueue = Object.create(MessageQueue).init({app: this, timerInterval: config.interval});

				this.messageHandlers = {};
				return this;
			}
		},

		start: {
			value: function() {
				// Start all applets.
				var that = this;
				Object.keys(this.applets).forEach(function(key) {
					var applet = that.applets[key];
					applet.start();
				});
				return this;
			}
		},
		stop: {
			value: function() {
				return this;
			}
		},

		// Applet management

		addApplet: {
			value: function(applet) {
				this.applets[applet.id] = applet;
				applet.parent = this;
				return this;
			}
		},

		removeApplet: {
			value: function(appletId) {
				this.applets = this.applets.filter(function() {
					if (appletId === this.name) {
						return false;
					} else {
						return true;
					}
				});
				return this;
			}
		},

		getApplet: {
			value: function(appletId) {
				return this.applets[appletId];
			}
		}
	});


	/* MESSAGES */
	var Message = Object.create({}, {
		id: {
			value: null, writable: true
		},
		to: {
			value: null, writable: true
		},
		broadcast: {
			value: false, writable: true
		},
		init: {
			value: function(from, to, data) {
				this.from = from;
				this.to = to;

				this.data = data;
				return this;
			}
		}
	});

	// Holds all info needed to handle a message.
	// Each message handler holds an array of applets that
	// want to receive this message. 
	var MessageHandler = Object.create({}, {
		/*applets: {
			value: {}, writable: true
		},
		*/
		init: {
			value: function () {
				this.targets =  {};
				return this;
			}
		},
		addTarget: {
			value: function (targetObject, targetFun, filter) {
				if (! this.targets[targetObject.id]) {
					this.targets[targetObject.id] = {
						obj: targetObject,
						fun: targetFun,
						filter: filter
					};
				}
				return this;
			}
		},
		removeTarget: {
			value: function () {
				// To be done.
			}
		},
		clearTargets: {
			value: function () {
				this.targets = [];
			}
		},
		getTargets: {
			value: function () {
				return this.targets;
			}
		}
	});

	var MessageQueue = Object.create({}, {
		/* Instance properties 
		messages: Array
		app: reference to the app that owns this.

		*/

		/*
		messages: {
			value: [], writable: true
		},
		app: {
			value: null, writable: true
		},
		*/
		/* Object Properties */
		sendRate: {
			// Rate at which to send messages. The value is the # of messages
			// per second. Set to null for no limit (all pending messages sent
			// at once).
			value: 60, writable: true
		},
		lastMessageTime: {
			// Last time a message was sent.
			value: null, writable: true
		},
		messageProcessedCount: {
			value: 0, writable: true
		},
		timer: {
			// Holds the current timer, if any.
			value: null, writable: true
		},
		/* Init */
		init: {
			value: function(cfg) {
				this.messages = [];
				this.app = cfg.app;
				return this;
			}
		},
		/* Methods */
		addMessage: {
			value: function(msg) {
				// We don't look up anything when we get the message
				// we do this when handling.
				this.messages.unshift(msg);
				this.ensureTimer();
				return this;
			}
		},
		handleError: {
			value: function(error, msg, targetObject, funName) {
				// Do nothing now.
				alert("Error is "+error+" for message: "+msg.id+", target "+targetObject+", fun "+funName);
			}
		},
		processMessage: {
			value: function(msg) {
				// loop through the registered applets, calling the method for
				// each one with the message data.
				// var applet = this.app.getApplet(msg.from);
				// alert("Processing message "+msg.id);
				var handler = this.app.getMessageHandler(msg.id);
				//if (msg.id === "domready") {
				//	alert("Processing domready:"+handler);
				//}
				if (handler) {
					var targets = handler.getTargets();
					if (msg.broadcast) {
						var msgq = this;
						Object.keys(targets).forEach(function(key) {
							var target = targets[key];
							var targetObject = target.obj;
							var filter = target.filter;
							var pass;
							if (targetObject) {
								pass = true;
							}
							if (target.filter && pass) {
								pass = false;
								// Hmm, filters.
								// Does the sender match one we are interested in?
								if (target.filter.from) {
									if (target.filter.from == msg.from) {
										pass = true;
									}
								}
							}
							if (pass) {
								try {
									targetObject[target.fun](msg);
								} catch(e) {
									msgq.handleError(e, msg, key, target.fun);
								} finally {
									msgq.lastMessageTime = (new Date()).getTime();
									msgq.messageProcessedCount++;
								}
							}
						});
					} else {
						var targetId = msg.to;
						var target = targets[targetId];
						var targetObject = target.obj;
						if (targetObject) {
							try {
								targetObject[target.fun](msg);
							} catch(e) {
								this.handleError(e, msg, targetId, target.fun);
							} finally {
								this.lastMessageTime = (new Date()).getTime();
								this.messageProcessedCount++;
							}
						}
					}
				}
				return this;
			}
		},
		processQueue: {
			value: function() {	
				// alert("processing..." + this.messages.length);
				//var msg = this.messages.pop();
				//this.checkTimer();
				//this.processMessage(msg);

				// Only process one message at a time if we have a rate limited
				// message queue.
				if (this.sendRate) {
					if (this.messages.length > 0) {
						this.processMessage(this.messages.pop());
					}
					this.checkTimer();
				} else {
					while (this.messages.length > 0) {
						this.processMessage(this.messages.pop());
					}
					this.checkTimer();
				}
			}
		},
		getMessages: {
			value: function() {
				return this.messages;
			}
		},
		clearQueue: {
			value: function() {
				this.messages = [];
				return this;
			}
		},
		cancelTimer: {
			value: function() {
				if (this.timer) {
					window.clearTimeout(this.timer);
					delete this.timer;
				}
				return this;
			}
		},
		startTimer: {
			value: function(fun) {
				var interval;
				if (this.sendRate) {
					interval = this.sendRate / 1000;
				} else {
					interval = 0;
				}
				var that = this;
				this.timer = window.setTimeout(fun, interval);
				return this;
			}
		},
		isTimer: {
			value: function() {
				if (this.timer) {
					return true;
				} else {
					return false;
				}
			}
		},
		ensureTimer: {
			// RUN WHENEVER A MESSAGE IS ADDED
			// Set up the timer based on the sendRate and the
			// length of the queue. 
			// If there is no queue, we don't set the timer, the timer is always
			// created when the first new message is queued.
			// If there is a sendRate, we set the timer to rate/1000. If there
			// is no sendRate, we use the default timerInterval.
			value: function() {
				if (this.messages.length > 0) {
					// We don't know if a timer is active -- if it is we assume it has been
					// set by a previous add, and we leave it alone.
					if (!this.isTimer()) {
						var that = this;
						this.startTimer(function() {that.handleMessageTimer();});
					}
				} else {
					this.cancelTimer();
				}
				return this;
			}
		},
		checkTimer: {
			// RUN AFTER QUEUE IS PROCESSED
			// Set up the timer based on the sendRate and the
			// length of the queue. 
			// If there is no queue, we don't set the timer, the timer is always
			// created when the first new message is queued.
			// If there is a sendRate, we set the timer to rate/1000. If there
			// is no sendRate, we use the default timerInterval.
			value: function() {
				if (this.messages.length > 0) {
					// This blanks out the timer, and if by some twisted logic it is 
					// still active it will be cancelled.
					this.cancelTimer();
					var that = this;
					this.startTimer(function() { that.handleMessageTimer();});
				} else {
					this.cancelTimer();
				}
				return this;
			}
		},

		// Called by the timer.
		handleMessageTimer: {
			value: function() {
				// Process the queue
				this.processQueue();
				return this;
			}
		}
	});


 	var MessageManager = Object.create({}, {
		/*
		instance properties:
		messageQueue: MessageQueue object
		messageHandlers: Object
		*/

		// Lifecycle
		init: {
			value: function (config) {
				if (config === undefined) {
					config = {};
				}
				this.messageQueue = Object.create(MessageQueue).init({app: this, timerInterval: config.interval});
				this.messageHandlers = {};
				return this;
			}
		},
		start: {
			value: function() {
				return this;
			}
		},
		stop: {
			value: function() {
				return this;
			}
		},
		// Messages
		setMessageQueue: {
			value: function(q) {
				this.messageQueue = q;
			}
		},
		addMessageHandler: {
			value: function(messageId, targetConfig, filterConfig) {
				// See if there is a message handler for this messageId.
				var handler = this.messageHandlers[messageId];

				// If so, add the applet to it.
				if (!handler) {
					handler = Object.create(MessageHandler, {id: {value: messageId}}).init();
					this.messageHandlers[messageId] = handler;
				}
				// The target fun is either targetConfig.callback or is "on"+messageId.
				var callback;
				if (targetConfig) {
					if (targetConfig.method) {
						callback = targetConfig.method;
					} else {
						callback = "on"+messageId;
					}
				}
				handler.addTarget(targetConfig.object, callback, filterConfig);
			}
		},
		getMessageHandler: {
			value: function(messageId) {
				return this.messageHandlers[messageId];
			}
		},

		broadcastMessage: {
			value: function(msg) {
				this.messageQueue.addMessage(msg);
			} 
		},

		broadcastSimpleMessage: {
			value: function(msgString, data, from) {
				var msg = Object.create(Message, {
					id: {value: msgString}
				});
				msg.from = from;
				msg.broadcast = true;
				msg.data = data;
				// alert("Adding "+msgString+", from:" + from);
				this.messageQueue.addMessage(msg);
			}
		},
		sendMessage: {
			value: function(msg) {
				this.messageQueue.addMessage(msg);
			} 
		},

		sendSimpleMessage: {
			value: function(messageId, targetObject, from) {
				var msg = Object.create(Message, {
					id: {value: messageId}
				}).init({from: from, to: targetObject});
				this.sendMessage(msg);
			}
		}

	});


	var MainApp = Object.create(App, {
		messageManager: {
			value: Object.create(MessageManager).init()
		}
	});



	var mod = {
		'App': App,
		'MainApp': MainApp,
		'Applet': Applet,
		'Message': Message,
		'MessageQueue': MessageQueue
	};
	return mod;
});