"use strict;"
define(['toolkit', 'lightMessage'], function(TK, LM) {

	var Module = Object.create({});
	Module.version = '0.0.2';

	// Utilities

	// OID Service: Each managed object is assigned an OID. Useful
	// for various things where we need to address an object by 
	// a unique (for this browser session) string. E.g. events.
	var _OID=0;
	function OID() {
		_OID += 1;
		return "light-mvc_oid_"+_OID;
	}

	/*
		Event
		A simple event mock.

		methods:
		send
		receive
		broadcast


	*/
	var EventManager = Object.create({}, {
		init: {
			value: function (cfg) {
				this.receiveBySender = {};
				this.receiveByMsgId = {};
				return this;
			}
		},
		send: {
			value: function (from, to, msg, payload) {

			}
		},
		broadcast: {
			value: function (from, msgId, payload) {
				// Y.log('broadcast: from: '+from);
				if (this.receiveBySender[from]) {
					var rec = this.receiveBySender[from][msgId];
					if (rec) {
						for (recipient in rec) {
							var fun = rec[recipient];
							try {
								fun(from, msgId, payload);						
							} catch (err) {
								Y.log('Exception running receiver function for '+recipient+':'+err);
							}
						}
					}
				}
			}	
		},
		receive: {
			value: function (from, msgId, recipient, callback) {
				var rec = this.receiveBySender[from];
				if (!rec) {
					this.receiveBySender[from] = {}
					this.receiveBySender[from][msgId] = {}
				} else {
					rec = this.receiveBySender[from][msgId];
					if (!rec) {
						this.receiveBySender[from][msgId] = {};
					}
				}
				this.receiveBySender[from][msgId][recipient] = callback.bind(this);

				return this;				
			}
		},
		unreceive: {
			value: function (receiveId) {

			}
		}
	});
	Module.EventManager = EventManager;

	/* The ModelValue is a wrapped value.
	At the core is any js value. 
	Atomic values like string, number, boolean, null, or
	objects like Date or whatever.
	The interface for the ModelValue provides conversion from string,
	since we need as a basic input from various sources, including the DOM.
	Conversion to a json compatible value (toJSON).
	Validation: validator()

	For usage we provide:
	set()
	get()
	validate()
	toJSON();

	For user extension we provide the following api:
	validator(value);
	setter(value);
	fromString(value);
	convertToJSON);

	the value has a state:
	new: never set
	changed: set and valid, but not synced with a store.
	stored: set, valid, and backed by a stored version. Either
	  the model has been  updated but not stored, or the model
	  has been set from a stored source.
	deleted: has been deleted from model, should not be used


	*/	
	var ModelValue = Object.create({}, {
		init_ModelValue: {
			value: function (cfg) {
				this.oid = OID();

				this.name = cfg.name;

				this.state = 'new';

				// Instance overrides of these things.
				if (cfg) {
					if (cfg.setter) {
						this.setter = cfg.setter;
					}
					if (cfg.validator) {
						this.validator = cfg.validator;
					}
					if (cfg.importString) {
						this.importString = cfg.importString;
					}
					if (cfg.exportJSON) {
						this.exportJSON = cfg.exportJSON;
					}
					if (cfg.messageManager) {						
						this.messageManager = cfg.messageManager;
					}
					if (cfg.required) {
						this.required = cfg.required;
					}
					if (cfg.readonly) {
						// TODO: enable this in the code!
						this.readonly = true;
					}
					this.constraints = cfg.constraints;

					if (cfg.defaultValue) {
						this.set(cfg.defaultValue);
					}

					if (cfg.value) {
						this.set(cfg.value);
					}

					//sanity checks.

					//1. if required and no default, warn:
				}

				// The initial value is the value that this object has after any default or 
				// preconfigured value is provided.
				this.initalValue = this.rawValue;

				return this;
			}
		},
		send: {
			value: function (msgId, to, payload) {
				if (this.messageManager) {
					this.messageManager.send({id: msgId, from: this.oid, to: to, data:payload});
				}	
			}
		},
		broadcast: {
			value: function (msgId, payload) {
				// console.log('mm? '+this.messageManager);
				if (this.messageManager) {
					this.messageManager.broadcast({id: msgId, from: this.oid, data:payload});
				}	
			}
		},
		validate: {
			value: function () {
				// console.log('dirty raw value = '+this.dirtyRawValue);
				if (this.dirtyRawValue  !== undefined) {
					// normally we just want to validate a pending
					// value.
					if (this.validator) {
						try {
							var result = this.validator(this.dirtyRawValue);
							if (result) {
								return {status: 'fail', info: result};
							} else {
								return false;
							}
						} catch (err) {
							throw 'Error running custom "validator" function: '+err;
						}
					}
				} else {
					// But if there is no value to validate, we just need to check
					// the consistency of the state of the field.
					if (this.rawValue === undefined) {
						if (this.required) {					
							var errMsg = 'Required value and never set';
							var errId = 'required';
							return {status: 'fail', info: errMsg, id: errId}
						} 
						/*else if (this.defaultValue === undefined) {
							var msg = 'Value is undefined, yet no default Value is defined.'
							this.messageManager.broadcast('validationFail', {message:msg}, this.oid);
							return {status: 'fail', info: msg};
						}
						*/
					}
				}

				return false;
			}
		},
		check: {
			value: function () {
				var validationResult = this.validate();
				if (validationResult) {
					if (validationResult.status === 'fail') {
						this.broadcast('validationFail', {
							message: validationResult.info, 
							messageId: validationResult.id});
						return {status: 'validationFail', result: validationResult};
					}
				}
				return false;
			}
		},
		set: {
			value: function (newValue, fromStore) {
				/*
				validate
					if fail, issue event.
				normalize
					if fail, issue event.
				validate
					if fail, issue event.
				store
					issue event
				*/

				// The new way is to keep the attempted update on the field.

				this.dirtyRawValue  = newValue;

				var validationResult = this.validate();
				if (validationResult) {
					if (validationResult.status === 'fail') {
						this.broadcast('validationFail', {message: validationResult.info});
						return {status: 'validationFail', result: validationResult};
					}
				}

				var oldValue = this.rawValue;

				if (this.setter) {
					try {
						var newRawValue = this.setter(this.dirtyRawValue);
					} catch (err) {
						throw 'Error running custom "setter" function: '+err;
					}
					this.rawValue = newRawValue;
					this.state = (fromStore ? 'stored' : 'changed');
				} else {
					this.rawValue = newValue;
					this.state = (fromStore ? 'stored' : 'changed');
				}

				// And now can wipe out the pending update
				this.dirtyRawValue = undefined;

				this.broadcast('changed', {requestedNewValue: newValue, 
										   newValue: this.rawValue,
										   oldValue: oldValue,
										   field: this});

				return this;
			}
		},
		get: {
			value: function () {
				/*
					get raw value\					

					run getter on it

					return it.
				*/
				var rawValue = this.rawValue;

				if (this.getter) {
					try {
						var value = this.getter(rawValue);
					} catch (err) {
						throw 'Error running custom "getter" function: '+err;
					}
				} else {
					var value = rawValue;
				}

				return value;
			}
		},
		toJSON: {
			value: function () {
				
				var value = this.get();

				if (value === undefined) {
					return undefined;
					// throw 'Undefined value for '+ this.name +' may not be converted to JSON';
				} else if ( (typeof value === 'string') ||
					 (typeof value === 'number') ||
					 (typeof value === 'boolean') ||
					 (value === null) ) {
					// Y.log('toJSON 1 for field '+this.name);
					return value;
				} else {
					// Y.log('Object '+name+' is '+(typeof obj));
					// Y.log('toJSON 2 for field '+this.name);
					return value.toJSON(); 
				}
				
			}
		},
		reset: {
			value: function () {				
				this.rawValue = this.initialValue;
				this.state = 'new';
			}
		},
		isBlank: {
			value: function() {
				return this.isBlankValue(this.rawValue);
			}
		}

	});
	Module.ModelValue = ModelValue;

	var TextValue = Object.create(ModelValue, {
		init_TextValue: {
			value: function (cfg) {
				this.init_ModelValue(cfg);
				this.min = cfg.min;
				this.max = cfg.max;
				return this;
			}
		},
		init: {
			value: function(cfg) {
				return this.init_TextValue(cfg);
			}
		},
		isBlankValue: {
			value: function (value) {
				if (value) {
					if (value.length > 0) {
						return false;
					}
				}
				return true;
			}
		},
		validator: {
			value: function (pendingValue) {

				// Required check
				if (this.isBlankValue(pendingValue)) {
					if (this.required) {
						return "This field is required"
					}
				}

				// Type check.
				if (typeof pendingValue !== 'string') {
					return 'New value must be a string';
				} 

				// Constraints check
				var len = pendingValue.length;
				if (this.min && (len < this.min)) {
					return 'Only '+len+' characters long; The minimum size is "' + this.min + '"';
				} else if (this.max && (len > this.max)) {
					return 'Input is '+len+' characters l ong; the maximum is "'+ this.max + '"';
				}
				return false;
			}
		}
	});
	Module.TextValue = TextValue;

	var EmailValue = Object.create(TextValue, {
		init_EmailValue: {
			value: function (cfg) {
				this.init_TextValue(cfg);
			}
		},
		validator: {
			value: function (pendingValue) {
				if (this.isBlankValue(pendingValue)) {
					if (this.required) {
						return "This field is required"
					}
				} else {
					var emailRe =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						if (!emailRe.test(pendingValue)) {
							return 'Invalid email format';
					}
				}
				return false;
			}
		}
	});
	Module.EmailValue = EmailValue;

	var PhoneValue = Object.create(TextValue, {
		init_PhoneValue: {
			value: function (cfg) {
				this.init_TextValue(cfg);
			}
		},
		validator: {
			value: function (pendingValue) {
				if (this.isBlankValue(pendingValue)) {
					if (this.required) {
						return "This field is required"
					}
				} else {
					var phoneRe = /(?:\D*\d){10,}/g;
					if (!phoneRe.test(pendingValue)) {
						return 'Too short to be a useful phone number, needs to be at least 10 numbers long. E.g. (123)456-7890';
					} 
				}
				return false;
			}
		}
	});
	Module.PhoneValue = PhoneValue;

	/*
		The ModelObject is a super-powered JS object.
		It is composed of fields, with operations to add, modify, and remove 
		them,
		
		and also whole-model operations
		validate
		toJSON
		isChanged
	*/
	var DataAdapter = Object.create({}, {
		init: {
			value: function (cfg) {
				this.oid = OID();
				this.fields = {};
				this.url = cfg.url;

				this.messageManager = cfg.messageManager;

				return this;
			}
		},
		evForwarder: {
			value: function (from, msgId, payload) {
				return false;
			}
		},
		validate: {
			value: function () {
				var valid = true;

				Object.keys(this.fields).forEach(function (name) {
					var field = this.fields[name];
					var validationResult = field.check();
					if (validationResult) {						
						valid = false;
					}
					
				}, this);


				if (this.validator) {
					var result = this.validator();
					console.log(result);
					if (result) {
						console.log('here');
						this.messageManager.broadcast({
							id: 'validationFail', 
							from: this.oid,
							source: 'model',
							data: {message: result.message}
						});
						valid = false;
					}
				}
				// and send message...
				return valid;
			}
		},
		addField: {
			value: function (name, modelValue) {	
				// console.log('adding field '+name);
				modelValue.messageManager = this.messageManager;			
				this.fields[name] = modelValue;
				modelValue.name = name;
				var adapter = this;

				/*
					Automatically subscribe to field events which are then forwarded
					in a manner that is compatible with a model broadcasting field events.
					NB we need to have an id field in here for now, as the lightMessage
					api catalogs handlers by their id...
				*/
				var reflector = {
					id: OID(),
					fun: function (msg) {
						var newMsg = {id: msg.id,
				                      from: adapter.oid,
				                      source: 'field',
				                      data: {fieldName: name,
				                             originalData: msg.data}};
						// console.log('REFLECTOR with '+msg.id+' and '+JSON.stringify(newMsg));
						adapter.messageManager.broadcast(newMsg);
					}
				};
				var m = this.messageManager;
				var msgIds = ['validationFail', 'error', 'changed'];
				for (var i=0; i< msgIds.length; i++) {
					var msgId = msgIds[i];
					// console.log('DEBUG2: adding '+msgId+' with '+modelValue.oid);
					m.on(msgId, 
		                {object: reflector, 
		                 method: 'fun',
		                 filter: {from: modelValue.oid}});
				}

				

			}
		},
		addFields: {
			value: function (fields) {
				for (var i=0; i< fields.length; i++) {
					var field = fields[i];
					var type = field.type || TextValue;
					delete field.type;
					this.addField(field.name, Object.create(type).init(field));
				}
			}
		},
		removeField: {
			value: function (fieldName) {
				// TODO
			}
		},
		setFieldValue: {
			value: function (name, value) {
				var field = this.fields[name];
				
				if (field) {
					return field.set(value);
				} else {
					throw 'Unknown field "'+name+'"';
				}
			}
		},
		getField: {
			value: function (name) {
				var field = this.fields[name];
				if (field) {
					return field;
				} else {
					throw 'Unknown field "'+name+'"';
				} 
			}
		},
		getFieldValue: {
			value: function (name) {
				var field = this.fields[name];
				if (field) {
					return field.get();
				} else {
					throw 'Unknown field "'+name+'"';
				}
			}
		},
		toJSON: {
			value: function () {
				var obj = {};
				Object.keys(this.fields).forEach(function (name) {
					var field = this.fields[name];
					var value = field.toJSON();
					// an undefined json value means an undefined 
					// field value, and we don't need to save those, indeed,
					// the representation is an un-property!
					// NB we perhaps should have a method to test if the field
					// is undefined and that is okay.
					if (value !== undefined) {
						obj[name] = value;
					}
				}, this);
				return  obj;
			}
		},
		reset: {
			value: function () {
				Object.keys(this.fields).forEach(function (name) {
					this.fields[name].reset();
				}, this);
			}
		},
		send: {
			value: function () {
				var that = this;
				if (!this.validate()) {
					this.messageManager.broadcast({
						id: 'validationFail', 
						from: this.oid,
						source: 'model',
						data: {message: 'Error validating the data model; can\'t save'}
					});
				} else {
					var json = this.toJSON();

					console.log('posting to '+this.url);

					TK.AJAX.post({
						url: this.url,
						data: JSON.stringify(json),
						header: [{name: 'Content-Type', 
								  value: 'application/json'}],
						onSuccess: function (response) {
							 console.log('sent: '+response.responseText);
							var responseData = JSON.parse(response.responseText);
							if (responseData.status === 'ok') {
								that.messageManager.broadcast({
									from: that.oid, id: 'sent'
								});
							} else {
								that.messageManager.broadcast({
									from: that.oid, id: 'sendError',
									data: responseData
								})
							}

						},
						onError: function (response) {
							//console.log('send error: '+response.responseText);
							that.messageManager.broadcast({
								from: that.oid, id: 'sendError'
							});
						}
					});			

					//console.log("About to send/save: "+JSON.stringify(json));
				}
			}
		}
	});

	Module.DataAdapter = DataAdapter;



	/*
		The main job of the DOMAdapter is to capture DOM Events and 
		emit events. 
		Conceptually, we are translating the nitty gritty of the DOM events
		to the application domain events.
	*/
	var DOMAdapter = Object.create({}, {
		DOMAdapter_init: {
			value: function (config) {
				this.oid = OID();
				this.container = document.querySelector(config.container);
				this.messageManager = config.messageManager || Object.create(LM.MessageManager).init();
				return this;
			}
		},
		addListener: {
			value: function (event, selectors, fun) {
				var that = this;
				if (typeof selectors === 'string') {
					selectors = [selectors];
				}
				for (var i in selectors) {
					var selector = selectors[i];
					var nodes = this.container.querySelectorAll(selector);
					TK.DOMTools.nodeListEach(nodes, function (node) {
					    node.addEventListener(event, function (e) {
							var msg = fun.call(that,e);
							that.messageManager.broadcast(msg);
						});
					});
				}
			}
		}
	});
	Module.DOMAdapter = DOMAdapter;

	/*
		This is the DOM Adapter.
		It listens for events in the DOM, and emits Events.
		The events contain data packages that are the result of some 
		information in the dom, and can involve quite a bit of grousing around
		and converting dom data.
	*/
	var FormAdapter = Object.create(DOMAdapter, {
		init: {
			value: function (config) {
				this.DOMAdapter_init(config);

				this.form = this.container.querySelector('form');
				this.formName = this.container.getAttribute('data-form');

				// DOM Side
				// -------------
				// DOM Listeners.
				// The listen to events, interpret them, and return a message to be
				// broadcast.
				// NB the context for the listener functions is this dom adapter.
				this.addListener('submit', 'form', function (e) {
					e.preventDefault();
					// e.stopPropagation();
					return Object.create(LM.Message).init({
						id: 'submit',
						from: this.oid
					});
				});

				this.addListener('click', 'button[type="button"][data-action="clearform"]', function (e) {
					return Object.create(LM.Message).init({
						id: 'clearform',
						from: this.oid
					});
				});
				this.addListener('click', 'button[type="button"][data-action="restoreform"]', function (e) {
					return Object.create(LM.Message).init({
						id: 'restoreform',
						from: this.oid
					});
				});
				this.addListener('click', 'button[type="button"][data-action="showform"]', function (e) {
					return Object.create(LM.Message).init({
						id: 'showform',
						from: this.oid
					});
				});
				this.addListener('change', ['[data-field] input', 
					                        '[data-field] textarea'], function (e) {
                    return this.triggerChange(e.target);					
				});
				this.addListener('blur', ['[data-field] input', 
					                        '[data-field] textarea'], function (e) {
                    return this.triggerChange(e.target);					
				});

				// External Interface
				// -------------------
				// Define message handlers.
				// This handler will only catch messages sent directly
				// to this object (oid).
				this.messageManager.on('validationFail', {
					id: this.oid, 
					object: this, 
					filter: {source: 'field'},
					method: 'onValidationFail'});
				this.messageManager.on('validationFail', {
					id: this.oid, 
					object: this, 
					filter: {source: 'model'},
					method: 'onModelValidationFail'});
				this.messageManager.on('changed', {
					id: this.oid, 
					object: this, 
					method: 'onChanged'});
				this.messageManager.on('clearMessages', {
					id: this.oid,
					object: this, 
					method: 'onClearMessages'
				});
				// no need for filtering or anything, these messages are received
				// directly here from senders which want to send them directly to us.
				this.messageManager.on('showform', {
					id: this.oid, object: this, method: 'onShowForm'
				});

				return this;
			}
		},
		triggerChange: {
			value: function (control) {
				var that = this;
				var field = TK.DOMTools.findAncestor(control, '[data-field]');
				var fieldName = field.getAttribute('data-field');
				var value = this.getFieldValue(fieldName);
				
				return Object.create(LM.Message).init({
					id: 'fieldChanged',
					from: this.oid,
					data: {form: that.formName, 
						   name: fieldName,
						   value: value}
				});
			}
		},
		getMessage: {
			value: function (id, defaultMessage) {
				var msg;
				switch (id) {
					case 'required': 
						msg = 'Field is required and no value supplied';
						break;
				}
				return msg || defaultMessage;
			}
		},
		clearForm: {
			value: function () {
				var fields = this.container.querySelectorAll('[data-field]');
				var that = this;
				TK.DOMTools.nodeListEach(fields, function (field) {
					var fieldName = field.getAttribute('data-field');
					that.setFieldValue(fieldName, '');
				});
			}
		},
		onClearMessages: {
			value: function () {
				var messages = this.container.querySelectorAll('[data-element="message"]');
				TK.DOMUtils.nodeListEach(messages, function (node) {
					node.innerHTML = '';
				});
				messages = this.container.querySelectorAll('[data-element="form-message"]');
				TK.DOMUtils.nodeListEach(messages, function (node) {
					node.innerHTML = '';
				});
			}
		},
		onShowForm: {
			value: function (msg) {
				this.clearForm();
				this.container.querySelector('[data-component="formSent"]').classList.add('hidden');
				this.container.querySelector('[data-component="form"]').classList.remove('hidden')
			}
		},
		onValidationFail: {
			value: function (msg) {
				// Set the error message if we can.
				// var field = this.findField(msg.data.fieldName);
				var name = msg.data.fieldName;
				var msgNode = this.container.querySelector('[data-field="'+name+'"] [data-element="message"]');

				if (msgNode) {
					msgNode.innerHTML = this.getMessage(msg.data.messageId, msg.data.message);
					msgNode.classList.add('error-message')
				}
			}
		},
		onModelValidationFail: {
			value: function (msg) {
				// todo move into the dom adapter.
				var msgNode = this.container.querySelector('[data-element="form-message"]');
				if (msgNode) {
					msgNode.innerHTML += '<div class="message">'+msg.data.message+'</div>';
					msgNode.classList.add('error-message');
				}
			}
		},
		onChanged: {
			value: function (msg) {
				// Set the error message if we can.
				// var field = this.findField(msg.data.fieldName);
				var name = msg.data.fieldName;
				var msgNode = this.container.querySelector('[data-field="'+name+'"] [data-element="message"]');
				if (msgNode) {
					msgNode.innerHTML = '';
					msgNode.classList.remove('error-message');
				}
			}
		},
		findField: {
			value: function(name) {
				var fieldNode = this.container.querySelector('[data-field="'+name+'"]');
				if (fieldNode) {
					var type;
					var control = fieldNode.querySelector('input');
					if (control) {
						type = 'input';
					} else {
						control = fieldNode.querySelector('textarea');
						if (control) {
							type = 'textarea';
						} else {
							control = fieldNode.querySelector('select');
							if (control) {
								type = 'select';
							} else {
								throw "Unsupported control type";
							}
						}
					}
					return {type: type, 
					        control: control, 
					        node: fieldNode};
				} else {
					return false;
				}
			}
		},
		getFieldValue: {
			value: function(name, ignoreMissing) {
				var field = this.findField(name);
				if (!field) {
					if (ignoreMissing) {
						return false;
					} else {
						throw 'Field "'+name+'" not found on this form';
					}
				}
				switch (field.type) {
				case 'input':
					return field.control.value;
				case 'textarea':
					return field.control.value;
				case 'select':
					var i = field.control.selectedIndex;
					return field.control.options[i].value;
				}
				throw 'Unimplemented field type '+field.type;
			}
		},
		setFieldValue: {
			value: function(name, value, ignoreMissing) {
				var field = this.findField(name);
				if (!field) {
					if (ignoreMissing) {
						return false;
					} else {
						throw 'Field "'+name+'" not found on this form';
					}
				}
				switch (field.type) {
				case 'input':
					if (!value) {
						value = '';
					}
					field.control.value = value;;
					break;
				case 'textarea':
					if (!value) {
						value = '';
					}
					field.control.value = value;
					break;
				case 'select':
					if (value) {
						var options = field.control.querySelectorAll('option');				
						for (var i = 0; i < options.length; i++) {
							var option = options.item(i);
							if (option.value === value) {
								field.control.selectedIndex = i;
								break;
							}
						}
					} else {
						field.control.selectedIndex = -1;
					}
				}
				return true;
			}
		}
	});
	Module.FormAdapter = FormAdapter;

	/*
		A Coordinator is like a message center. It receives messages from a 
		DOMAdapter, from a Model, and routes between them...
		A coordinator can be designed in different ways.
		In the Handler pattern, it directly handles messages sent through its
		messageManager by methods.
		It can also receive all messages at a single method and filter them
		by inspecting the message, sender, receiver, and data packets.

	*/
	var FormCoordinator = Object.create({}, {
		init: {
			value: function (config) {
				this.messageManager = config.messageManager;
				

				this.domAdapter = config.domAdapter;

				/*
					Setting up the message listeners. This is the heard of the
					coordination aspect. Listen to events from a dom adapter and data adapter
					and route the messages appropriately.
				*/
				var m = this.messageManager;
				m.on('submit', {object: this, 
							   method: 'onFormSubmit',
							   filter: {from:this.domAdapter.oid}});
				// console.log('DEBUG: '+this.domAdapter.oid);
				m.on('fieldChanged', {object: this, 
									 method: 'onFormFieldChanged',
									 filter: {from: this.domAdapter.oid}});

				m.on('showform', {object: this,
				                  method: 'onShowForm',
				                  filter: {from: this.domAdapter.oid}});

				this.dataAdapter = config.dataAdapter;

				m.on('changed', {object: this, 
	                            method: 'onModelFieldChanged',
                                filter: {from: this.dataAdapter.oid}}); 
				m.on('error', {object: this, 
	                          method: 'onModelFieldError',
                              filter: {from: this.dataAdapter.oid}}); 

				// This just traps the validationFail messages that originated from fields.
				// We use these to display feedback for the user on the form.
				m.on('validationFail', {object: this, 
                                     method: 'onModelFieldValidationFail',
                                     filter: {from: this.dataAdapter.oid, source: 'field'}}); 
				m.on('sent', {object: this, 
	                          method: 'onModelSent',
                              filter: {from: this.dataAdapter.oid}});

				return this;
			}
		},
		onModelFieldChanged: {
			value: function (msg) {
				// console.log('Hey, field value changed');
			}
		},
		onModelFieldError: {
			value: function (msg) {
				//console.log('Hey, field error');
			}
		},
		onModelFieldValidationFail: {
			value: function (msg) {
				// set the error message for this field.
				// console.log('onModelFieldValidationFail: '+JSON.stringify(msg));
				this.messageManager.send({id: 'validationFail',
                                          from: this.oid, 
                                          data: {fieldName: msg.data.fieldName, 
                                                 message: msg.data.originalData.message,
                                                 messageId: msg.data.originalData.messageId},
                                          to: this.domAdapter.oid});

				// console.log('Hey, field validation fail for field '+msg.data.fieldName+':'+msg.data.originalData.message);
			}
		},
		onModelSent: {
			value: function (msg) {
				// console.log('Hey, model saved');
				this.domAdapter.container.querySelector('[data-component="form"]').classList.add('hidden');
				this.domAdapter.container.querySelector('[data-component="formSent"]').classList.remove('hidden');
			}
		},
		onFormSubmit: {
			value: function (msg) {
				// first make sure any form changes that slipped through, e.g. invalid fields
				// or a form that is pre-populated, are sent to the data adapter first.
				// we do this by invoking the domadapters ...
				this.messageManager.send({
					id: 'clearMessages',
					from: this.oid,
					to: this.dataAdapter.oid

				})
				this.dataAdapter.send();
			}
		},
		onShowForm: {
			value: function (msg) {
				this.messageManager.send({id: 'showform', from: this.oid, to: this.domAdapter.oid});
			}
		},
		onFormFieldChanged: {
			value: function (msg) {
				var name = msg.data.name;
				var value = msg.data.value;
				this.dataAdapter.setFieldValue(name, value);

				// console.log('Changed too...'+JSON.stringify(msg.data));
			}
		}

	});
	Module.FormCoordinator = FormCoordinator;

	
	return Module;

});