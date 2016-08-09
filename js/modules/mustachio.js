define(["toolkit"], function(TK) {
	"use strict";

	var MustachioBase = Object.create({}, {
		// Tag Types
		VARIABLE: {
			value: 1
		},
		SECTION: {
			value: 2
		},
		INVERTED: {
			value: 3
		},
		BOOLEAN: {
			value: 4
		},
		COMMENT: {
			value: 5
		},
		FUNCTION: {
			value: 6
		},


		// Node types
		TEXT: {
			value: 1
		},
		TAG: {
			value: 2
		},

		// Argument types
		VARIABLEREF: {
			value: 1
		}, 
		STRINGREF: {
			value: 2
		},

		RE_TAG: {
			value: new RegExp(/^([#^\?\/,\@]{0,1})[ ]*([^ :]+)[ ]*(?:(?:[: ])(.+))?$/)
		},

		RE_CHUNK: {
			value: new RegExp(/(?:([\s\S]*?)\{\{(.*?)\}\})|([\s\S]+$)/g)
		},

		RE_ARG: {
			// space word/string
			// This one uses $ for variables, but that isn't very 
			// mustache-like:
			/// value: new RegExp(/(?:(?:[\s]*)\$([^\s|$]*)(?:[\s]|$))|(?:(?:[\s]*)"([^"]*)")|(?:(?:[\s]*)([^\s]+?)(?:[\s]|$))|(?:[^\s\S]+$)/g) 
			value: new RegExp(/(?:(?:[\s]*)\$([^\s|$]*)(?:[\s]|$))|(?:(?:[\s]*)"([^"]*)")|(?:(?:[\s]*)([^\s]+?)(?:[\s]|$))|(?:[^\s\S]+$)/g) 

		},

		RE_REF: {
			value: new RegExp(/^([$])?(.*)$/)
		},


		init: {
			value: function (config) {
				this.templateString = config.template;
				this.parsedTemplate = undefined;
				this.modifiers = config.modifiers || {};
				this.tagFunctions = config.functions || [];
				return this;
			}
		},
		parseModifiers: {
			value: function (modifiers) {

				if (modifiers) {
					return modifiers.split(":").map(function(x) {
						return x.trim();
					})
				} else {
					return undefined;
				}
			}
		},
		parseArgs: {
			value: function (argstring) {
				// Arguments are initially a space separated list of 
				// either value or variable (prop).

				var arglist = [], match;
				if (argstring) {
					this.RE_ARG.lastIndex = 0;
					while (match = this.RE_ARG.exec(argstring)) {
						var variable = match[1],
							string = match[2],
							bare = match[3];
						if (variable) {
							arglist.push({type: this.VARIABLEREF, value: this.parseName(variable)});
						} else if (string) {
							arglist.push({type: this.STRINGREF, value: string});
						} else if (bare) {
							//arglist.push({type: this.STRINGREF, value: string});
							arglist.push({type: this.VARIABLEREF, value: this.parseName(bare)});
							// arglist.push({type: this.VARIABLEREF, value: this.parseName(variable)});
						}
					}
				}
				return arglist;
			}
		},
		parseName: {
			value: function (name) {
				if (name) {
					if (name === ".") {
						return ["__value"];
					} else {
						return name.split(".");
					}
				} else {
					return undefined;
				}
			}
		},
		parseTag: {
			value: function (t) {
				// var reTag = new RegExp(/([#^\?\/,]{0,1})([^ :]+) *(?:(?::)([^ ]+))?$/),
				var parsed = this.RE_TAG.exec(t),
					dispatch = parsed[1],
					name = this.parseName(parsed[2])
         

				return {dispatch: dispatch, name: name, extra: parsed[3]};
			}
		},
		compile: {
			value: function () {
				return this.parse();
			}
		},
		parse: {
			value: function () {			
				// Take the parsed template, and form it into a sensible template
				// structure. We can't do this in parse above, because we are using RegExp and 
				// can't do recursion on it ... or can we??
				var // re = new RegExp(/(?:([\s\S]*?)\{\{(.*?)\}\})|([\s\S]+$)/g),
					parsed=[], stack=[], match;
				this.RE_CHUNK.lastIndex = 0;
				while (match = this.RE_CHUNK.exec(this.templateString)) {
					// verbose for now...
					var text1 = match[1],
					tag1 = match[2],
					text2 = match[3];
					if (text2 === undefined) {
						if (text1.length > 0) {
							parsed.push({type: this.TEXT, text: text1});
						}
						var tag  = this.parseTag(tag1);
						switch (tag.dispatch) {
							case "#": 
								tag.type = this.SECTION;
								stack.push(tag);
								stack.push(parsed);
								parsed = [];
								break;
							case "^":
								// There is nothing to do until run time.
								tag.type = this.INVERTED;
								stack.push(tag);
								stack.push(parsed);
								parsed = [];
								break;
							case "?":
								tag.type = this.BOOLEAN;
								tag.args = this.parseArgs(tag.extra);
								stack.push(tag);
								stack.push(parsed);
								parsed = [];
								break;
							case "@":
								tag.type = this.FUNCTION;
								tag.args = this.parseArgs(tag.extra);
								parsed.push({type: this.TAG, tag: tag});
								break;
							case "!":
								tag.type = this.COMMENT;
								break;
							case "/":
								// End a section
								// We should look at what it is, but it doesn't
								// really matter. The only way we should see a section
								// end is if it is for the currently open section!
								// tag.type = "END";
								var oldParsed = stack.pop();
								var oldTag = stack.pop();
								oldTag.section = parsed;
								parsed = oldParsed;
								parsed.push({type: this.TAG, tag: oldTag});
								break;
							default:
								tag.type = this.VARIABLE;
								tag.modifiers = this.parseModifiers(tag.extra);
                // console.log('MOD: '+JSON.stringify(tag.modifiers));
								parsed.push({type: this.TAG, tag: tag});
								break;
						}
					} else if (text2.length > 0) {
						parsed.push({type: this.TEXT, text: text2});
					}
				}
				this.parsedTemplate = parsed;
				return this;
			}
		},
		applyModifier: {
			value: function (value, modifierId) {
        
				var  modifier = this.modifiers[modifierId];
        // console.log('Applying MOD: '+ modifier);
				if (modifier) {
					return modifier(value);
				} else {
					return value;
				}
			}
		},
		applyModifiers: {
			value: function (value, modifiers) {	
				if (modifiers) {			
					for (var i =0; i< modifiers.length; i++) {
						value = this.applyModifier(value, modifiers[i]);
					}
				}
				return value;
			}
		},
		addTagFunction: {
			value: function (name, fun) {
				this.tagFunctions[name] = fun;
			}
		},
		
		isInverted: {
			value: function (value) {
				if (value === undefined) {
					return true;
				} else if (value === null) {
					return true;
				} else {
					switch (typeof value) {
						case "string":
							if (value.length === 0) {
								return true;
							}
							break;
						case "number": 
							if (value === 0) {
								return true;
							}
							break;
						case "boolean":
							return !value;
							break;
						case "object":
							if (Object.keys(value).length === 0) {
								return true;
							}																			
					}
					return false;
				}

			}
		},
		isTrue: {
			value: function (value) {
				return (!this.isInverted(value));
			}
		},
		dumpParse: {
			value: function () {
				var that = this;
				function doDump(p) {
					var i, out = "";
					for (i in p) {
						var node = p[i];
						switch (node.type) {
							case that.TEXT:
								out += ",["+i+"] TEXT:"+node.text;
								break;
							case that.TAG:
								var tag = node.tag;
								if (tag.section) {
									out += ",["+i+"]SECTION ("+tag.dispatch+"):"+doDump(tag.section);
								} else {
									out += ",["+i+"]NONSEC ("+tag.dispatch+"):"+objDump(tag);
								}
								break;
							default: 
								alert("UNKNOWN");
								break;
						}
					}
					return out;
				}
				return doDump(this.parsedTemplate);
			}
		},
		render: {
			value: function (data) {
				var stack = [];
				stack.push(data);
				return this.renderTemplate(this.parsedTemplate, stack);
			}
		},
		renderArray: {
			value: function (section, stack) {
				var i, result = "", array = stack[stack.length-1];
				for (i in array) {
					var datum = array[i];
					datum.__index = i;
					stack.push(datum);
					result += this.renderTemplate(section, stack);
					stack.pop();
				}
				return result;
			}
		},
		renderObject: {
			value: function (section, object, stack) {
				var key, result= "";
				for (key in object) {
					var datum = object[key];
					datum.__key = key;
					result += this.renderTemplate(section, datum, stack.push(object));
				}
				return result;
			}
		}, 
		copyStack: {
			value: function(stack, end) {
				var newStack = [];
				for (var i = 0; i < end; i++) {
					newStack[i] = stack[i];
				}
				return newStack;
			}
		},
		getValue: {
			value: function(path, stack) {
				for (var i = stack.length-1; i >= 0; i--) {
					// We shortcut on the first element.
					var data = stack[i];
					if (data.hasOwnProperty(path[0])) {
						for (var j = 0; j < path.length; j++) {
							if (data.hasOwnProperty(path[j])) {
								data = data[path[j]];
							} else {
								return undefined;
							}
						}
						return data;
						// return this.copyStack(stack, stack.length-i);
					}
				}
				return undefined;
			}
		},
		renderTemplate: {
			value: function (template, stack) {

				var i, result="";
				for (i in template) {
					var node = template[i], type=node.type;
					switch (type) {
						case this.TEXT:
							result += node.text;;
							break;	
						case this.TAG:
							var tag = node.tag;
								// datum = data[tag.tag];
							switch (tag.type) {
								case this.VARIABLE: 

									var  rawValue;
									if (tag.name[0] === "__value") {
										rawValue = stack;
									} else {
										rawValue = this.getValue(tag.name, stack);
									}
                  
									var value = this.applyModifiers(rawValue, tag.modifiers);
									if (value) {
										result += value;
									}
								
									break;
								case this.FUNCTION: 
									// The function has a list of variables as arguments.
									var that = this;
									var resolvedValues = tag.args.map(function(arg) {
										switch (arg.type) {
											case that.VARIABLEREF:
												var val = that.getValue(arg.value, stack);
												return val;												
												break;
											case that.STRINGREF:
												return arg.value;
												break;												
										}
									});
									// alert(Object.keys(this.tagFunctions)); //tag.name[0]);
									// alert(resolvedValues);
									var fun = this.tagFunctions[tag.name[0]];
									var value;
									if (fun) {
										value = fun.apply(this, resolvedValues);
									} else {
										value = "Function '"+tag.name+"' not found.";
									}

									result += value;

									// result += "RESOLVED: (" +resolvedValues.length +")" + resolvedValues.join(",");

									break;
								case this.SECTION: 
									var data = this.getValue(tag.name, stack);
									if (data !== undefined) {

										switch (typeof data) {
											case "object":
												stack.push(data);
												if (Array.isArray(data)) {
													result += this.renderArray(tag.section, stack);
												} else {
													// result += renderObject(tag.section, datum);
													result += this.renderTemplate(tag.section, stack);
												}
												stack.pop();
												break;
											// The following cases are just like "boolean". We render the 
											// new template (tag.section). I (EAP) don't
											// really like this overloading of the SECTION operator.
											case "number":
												result += this.renderTemplate(tag.section, stack);
												break;
											case "string":
												if (this.isTrue(datum)) {
													result += this.renderTemplate(tag.section, stack);
												}
												break;
											case "boolean":
												result += this.renderTemplate(tag.section, stack);
												break;
										}
									}
									break;
								case this.INVERTED:
									// Inverted is really the inverse of boolean, but also works as the
									// inverse of section.
									if (this.isInverted(this.getValue(tag.name, stack))) {
										result += this.renderTemplate(tag.section, stack);
									}
									break;
								case this.BOOLEAN:
									var show = false;
									if (tag.args.length === 1) {											
										if ( this.getValue(tag.name, stack) == tag.args[0].value ) {
											show = true;
										}
									} else if (tag.args.length === 0) {
										if (this.isTrue(this.getValue(tag.name, stack))) {
											show = true;
										}
									}
									if (show) {
										result += this.renderTemplate(tag.section, stack);
									}
									break;
								case this.COMMENT:
									// skip it;
									break;
								break;
							}
							break;
							
						default:
							result += "[** type '"+type+"' not recognized "+objDump(node)+"**]";
					}							
				}
				return result;
			}
		}
	});

	// Our base mustache template object has no modifiers, etc., so we create our basic one here...
	var StandardMustachio = Object.create(MustachioBase, {
		modifiers: {
			value: {
				upper: function (value) {
					if (value) {
						return value.toUpperCase();
					} else {
						return value;
					}
				},
				lower: function (value) {
					if (value) {
						return value.toLowerCase();
					} else {
						return value;
					}
				}
			}, writable: true
		}
	});

	var mustachio = {
		Base: MustachioBase,
		Mustachio: StandardMustachio
	}

	 return mustachio;

});
