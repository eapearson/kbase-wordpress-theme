define(['mustachio', 'rsvp', 'toolkit'], function (M, RSVP, TK) {

	var Gallery = Object.create({}, {
		init: {
			value: function (config) {
				if (config.autoNumber) {
                    var i = 0;
                    this.gallery = config.gallery.map(function(a) {
                        a.id = i++;
                        return a;
                    });
                } else {
                    this.gallery = config.gallery;
                }

                this.name = config.name;

                // TODO: change these properties to ... container and gallery.

                this.wrapper = document.querySelector(config.wrapper);

                this.container = this.wrapper.querySelector(config.container);

                // The wrapper provides scoping to everything, so that we can 
                // have multiple slideshows on the page...
               
                this.frameHolder = this.container.querySelector('[data-element="frame-holder"]');
                this.art = this.container.querySelector('[data-element="art"]');
                this.caption = this.container.querySelector('[data-element="caption"]');
                this.currentSlideNumber = false;
                this.slideCount = this.gallery.length;
                this.lastSlideNumber = this.slideCount - 1;
                this.currentSlideTimer = false;
                this.slideDuration = Math.round((config.slideDuration | 3) * 1000);
                this.transitionDuration = config.transitionDuration | 0.3;
                this.defaultTemplate = config.defaultTemplate || 'frame';
                this.artPath = config.artPath;

                /* This objects holds one property per control we want to 
				   remember */
                this.controls = {};

                /* Frame template */
                // this.templateEngine = new Y.Template();

                /* This is the standard template -- the frame template is baked in here, but others
				    can be specified and used by any slide. */
			    this.templates = {};
				    /*
                
                var templateNodes = this.wrapper.querySelectorAll('[data-template]');
                TK.DOMTools.nodeListEach(templateNodes, function(n) {
                    //Y.log('Adding template: '+n.getData('template'), 'debug', 'init');
                    var templateName = n.getAttribute('data-template');
                    var template = Object.create(M.Mustachio).init({template: n.innerHTML}).parse();
                    this.templates[templateName] = template;
                    //Y.log('Added template: '+this.templates[n.getData('template')], 'debug', 'init');
                }, this);
                // this.template = this.templateEngine.compile(Y.one('[data-template="frame"]').getHTML());
                */

                this.autoNumber = config.autoNumber;
                this.autoHideControls = config.autoHideControls;

                this.id = config.id;
                this.prefix = config.prefix;
                this.extension = config.extension;

                this.debug = config.debug;

                // Events
                var controls = ['next', 'prev', 'first', 'last', 'play', 'pause', 'playpause'];
                for (var i in controls) {
                    var controlName = controls[i];
                    // TODO: delegation

                    var control = this.container.querySelector('[data-control="'+controlName+'"]');
                    if (control) {
	                    control.addEventListener('click', (function (obj, s) {
	                    	return function (e) {
	                    		obj[s](e);
	                    	}
                    	})(this, 'on'+controlName));
	                }

                }

                this.autoPlay = config.autoPlay;

                /* Auto hiding of controls */
                if (this.autoHideControls) {
                    // assume controls are hidden already, using the class
                    // 'hide'.
                    this.container.addEventListener('mouseenter',
                        function(e) {
                            var controls = e.currentTarget.querySelectorAll('.controls');
                            controls.classList.remove('-hide');
                        });
                    this.container.on('mouseleave',
                        function(e) {
                            var controls = e.currentTarget.querySelectorAll('.controls');
                            controls.classList.add('-hide');
                        });
                }

                /* Audio controls */

                //if (this.audioAutoPlay) {
                /*
						In auto mode, the audio plays by itself, and the controls
						are separate.
					*/
                // look for audio player within the slideshow
                var audioPlayer = this.container.querySelector('audio');
                if (audioPlayer) {
                    this.audioEnabled = true;
                    this.audioPlayer = audioPlayer;
                    // look for play and pause within slideshow
                    this.controls.playAudio = this.container.querySelector('[data-control="playAudio"]');
                    this.controls.pauseAudio = this.container.querySelector('[data-control="pauseAudio"]');
                    var that = this;
                    this.container.querySelector('.audio-playpause').addEventListener('click', function(e) {
                        that.controlAudioPlayPause();
                    });
                    // 
                    /*
                    this.container.delegate('click', function(e) {
                        this.controlAudioPlay();
                    }, '.audio-play', this);
                    this.container.delegate('click', function(e) {
                        this.controlAudioPause();
                    }, '.audio-pause', this);
                    */
                    this.container.querySelector('.audio-sync').addEventListener('click', function(e) {
                        that.toggleAudioSync();
                    });

                }
                this.syncAudio = config.syncAudio && audioPlayer;
                this.audioAutoPlay = config.audioAutoPlay && audioPlayer;
                //}

                return this;
			}
		},
		addTemplate: {
			value: function (config) {
				var text;
				if (config.text) {
					text = config.text;
				} else if (config.selector) {
					var textNode = document.querySelector(config.selector);
					if (textNode) {
						text = textNode.innerHTML;
					}
				}
				if (text) {
					this.templates[config.name] = Object.create(M.Mustachio).
					                                     init({template: text, functions: config.functions}).
					                                     parse();
				}
 
			}
		},
		audioPlaying: {
            value: function() {
                if (this.audioEnabled) {
                    if (this.audioPlayer.paused) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        },
        playAudio: {
            value: function() {
                if (this.audioPlayer.paused) {
                    this.audioPlayer.play();
                }
            }
        },
        pauseAudio: {
            value: function() {
                if (!this.audioPlayer.paused) {
                    this.audioPlayer.pause();
                }
            }
        },
        controlAudioPlayPause: {
            value: function() {
                this.toggleAudio();
            }
        },
        controlAudioPlay: {
            value: function() {
                this.playAudio();
                this.syncAudioControls();
            }
        },
        controlAudioPause: {
            value: function() {
                this.pauseAudio();
                if (this.syncAudio) {
                    this.syncAudio = false;
                }
                this.syncAudioControls();
            }
        },
        controlAudioSync: {
            value: function() {
                this.toggleAudioSync();
            }
        },
        toggleAudio: {
            value: function() {
                /* Toggles the audio player, if it is installed, between pause and play. */
                if (this.audioPlayer) {
                    if (this.audioPlayer.paused) {
                        this.audioPlayer.play();
                    } else {
                        this.audioPlayer.pause();
                    }
                }
                this.syncAudioControls();
            }
        },
        syncAudioControls: {
            value: function() {
                /* Call whenever the audio control state may have changed */
                if (this.audioPlayer) {
                    if (this.audioPlayer.paused) {
                        this.disableControl('pauseAudio');
                        this.enableControl('playAudio');
                        this.enableControlIcon('playpauseAudio', 'pause');
                    } else {
                        this.enableControl('pauseAudio');
                        this.disableControl('playAudio');
                        this.enableControlIcon('playpauseAudio', 'play');
                    }
                    if (this.syncAudio) {
                        this.setBooleanButton('syncAudio', true);
                    } else {
                        this.setBooleanButton('syncAudio', false);
                    }
                } else {
                    this.disableControl('pauseAudio');
                    this.disableControl('playAudio');
                    this.disableControl('syncAudio');
                }
            }
        },
        toggleAudioSync: {
            value: function() {
                if (this.audioPlayer) {
                    if (this.syncAudio) {
                        this.syncAudio = false;
                    } else {
                        this.syncAudio = true;
                        if (this.isPlaying()) {
                            this.playAudio();
                        }
                    }
                }
                this.syncAudioControls();
            }
        },
        showCurrentSlide: {
            value: function() {
                var that = this;
                return new RSVP.Promise(function (resolve, reject) {
                    if (that.currentSlideNumber !== false) {
                        var currentSlide = that.gallery[that.currentSlideNumber];
                        console.log('Current Slide: '+that.currentSlideNumber+', '+currentSlide);
                        if (currentSlide.frame === undefined) {
                            var templateName = currentSlide.template || that.defaultTemplate || 'frame';
                            //console.log('here'+templateName);
                            var template = that.templates[templateName];
                            

                            var templateText = template.render({
                                slide: currentSlide,
                                slideshow: that
                            });
                            
                            // console.log('HERE: '+templateText);
                            var tempNode = document.createElement("DIV");
                            
                            tempNode.innerHTML = templateText;
                            currentSlide.frame = tempNode.querySelector('.frame');
                            // currentSlide.frame = document.createElement(templateText);
                        } else {
                        	
                        }
                        currentSlide.frame.style.opacity = 0;
                        
                        currentSlide.frame = that.frameHolder.appendChild(currentSlide.frame);

                        var transitionStyle = TK.DOMTools.transitionStyleName(currentSlide.frame);
						currentSlide.frame.style[transitionStyle] = 'opacity 0.5s ease-in';
						var t = currentSlide.frame.offsetLeft;					
						currentSlide.frame.style.opacity = 1;
                        TK.DOMTools.onTransitionEnd(currentSlide.frame, function (e) {
                        	resolve(that);
                        });
                    } else {
                        // An undefined slide number occurs when a slideshow is first run
                        // without autoplay and with the initialSlide not set. Look for
                        // the initialSlideTemplate ... if not found, just do nothing.
                        var templateText;
                        if (that.templates['initialSlide']) {
                            that.initialSlide = {};
                            var template = that.templates['initialSlide'];
                            try {
	 							templateText = template.render({
	                                slide: currentSlide,
	                                slideshow: that
	                            });
	                        } catch (e) {
                                console.log('Error running initial template: ' + e.message, 'error', 'showCurrentSlide');
                            }
                        } else {
                        	console.log (' no initial slide? ');
                        }
                        if (templateText) {
                        	var tempNode = document.createElement("DIV");
                            tempNode.innerHTML = templateText;
                            var frame = that.initialSlide.frame = tempNode.querySelector('.frame');
                            
	                        that.frameHolder.appendChild(frame);
	                        frame.style[TK.DOMTools.transitionStyleName(node)] = '0.5s ease-in';
	                        var tmp = frame.offsetLeft;
	                       	TK.DOMTools.onTransitionEnd(frame, function (e) {
	                        	resolve(that);
	                        });
	                    }

                    }
                });
            }
        },
        removeCurrentSlide: {
            value: function() {
                var that = this;
                return new RSVP.Promise(function(resolve, reject) {
                	var node = that.frameHolder.querySelector('.frame');
                	
                    if (node) {
                    	node.style[TK.DOMTools.transitionStyleName(node)] = 'opacity 0.5s ease-out';
                    	var tmp = node.offsetLeft;
                    	node.style.opacity = 0;
                    	TK.DOMTools.onTransitionEnd(node, function (e) {
                    		// check if parent node is still there ... this node may have 
                    		// already been remove.
                    		if (node.parentNode) {
                    			node.parentNode.removeChild(node);
                    		}
                    		resolve(that);
                    	});
                		
                    } else {
                        resolve(that);
                    }
                });
            }
        },
        getControl: {
            value: function(name) {
                return this.container.querySelector('[data-control="' + name + '"]');
            }
        },
        disableControl: {
            value: function(name) {
                var control = this.getControl(name);
                if (control) {
                    control.classList.add('-disabled');
                }
            }
        },
        enableControl: {
            value: function(name) {
                var control = this.getControl(name);
                if (control) {
                    control.classList.remove('-disabled');
                }
            }
        },
        setBooleanButton: {
            value: function(name, state) {
                var control = this.getControl(name);
                if (control) {
                    if (state) {
                        control.classList.remove('-false');
                        control.classList.add('-true');
                    } else {
                        control.classList.remove('-true');
                        control.classList.add('-false');
                    }
                }
            }
        },
        enableControlIcon: {
            value: function(controlName, iconName) {
                var control = this.getControl(controlName);
                if (control) {
                    var controls = control.querySelectorAll('[data-icon]');
                    TK.DOMTools.nodeListEach(controls, function(n) {
                        if (!n.classList.contains('hidden')) {
                            n.classList.add('hidden');
                        }
                    });
                    control.querySelector('[data-icon="'+iconName+'"]').classList.remove('hidden');
                }
            }
        },
        setField: {
            value: function(name, value) {
                var field = this.container.querySelector('[data-field="' + name + '"]');
                if (field) {
                    field.innerHTML = value;
                }
            }
        },
        updateView: {
            value: function() {
                this.setField('current-slide-number', this.currentSlideNumber + 1);
                this.setField('total-slide-count', this.slideCount);
                // Set button states.
                var controls = this.container.querySelectorAll('[data-control]');
                TK.DOMTools.nodeListEach(controls, function(n) {
                    n.classList.remove('-disabled');
                });
                if (this.currentSlideNumber === 0) {
                    this.disableControl('first');
                } else if (this.currentSlideNumber === this.lastSlideNumber) {
                    this.disableControl('last');
                }

                if (this.playState === 'playing') {
                    this.disableControl('play');
                    var control = this.container.querySelector('[data-control="playpause"]');
                    if (control) {
                        control.querySelector('[data-icon="play"]').classList.remove('hidden');
                         control.querySelector('[data-icon="pause"]').classList.add('hidden');
                     }
                } else {
                    this.disableControl('pause');
                    var control = this.container.querySelector('[data-control="playpause"]');
                    if (control) {
	                    control.querySelector('[data-icon="play"]').classList.add('hidden');
	                    control.querySelector('[data-icon="pause"]').classList.remove('hidden');
	                }
                }

                // Audio controls
                this.syncAudioControls();
            }
        },
        onnext: {
            value: function() {
                this.onpause();
                this.nextSlide();
            }
        },
        onprev: {
            value: function() {
                this.onpause();
                this.prevSlide();
            }
        },
        nextSlide: {
            value: function() {
            	console.log('next slide...'+this.currentSlideNumber);
                if (this.currentSlideNumber === false) {
                    this.currentSlideNumber = 0;
                } else {
                    if (this.currentSlideNumber === this.lastSlideNumber) {
                        this.currentSlideNumber = 0;
                    } else {
                        this.currentSlideNumber++;
                    }
                }
                var that = this;

                this.removeCurrentSlide()
                    .then(function() {
                        return that.showCurrentSlide();
                    })
                    .then(function() {
                        return that.updateView();
                    })
                    .catch(function(err) {
                        console.log('ERROR: '+err);
                    });

                return this;
            }
        },
        prevSlide: {
            value: function() {
                if (this.currentSlideNumber === false) {
                    this.currentSlideNumber = 0;
                } else {
                    if (this.currentSlideNumber === 0) {
                        this.currentSlideNumber = this.lastSlideNumber;
                    } else {
                        this.currentSlideNumber--;
                    }
                }
                var that = this;
                console.log('PREV');
                this.removeCurrentSlide()
                    .then(function() {
                        return that.showCurrentSlide()
                    })
                    .then(function() {
                        return that.updateView()
                    })
                    .catch(function(err) {
                        console.log('ERROR: '+err);
                    });

                return this;
            }
        },
        setSlide: {
            value: function(n) {
                this.currentSlideNumber = n;
                return n;
            }
        }, 
        nthSlide: {
            value: function(n) {
                if ((n < 0) || (n > this.lastSlideNumber)) {
                    return;
                } else if (this.currentSlideNumber === n) {
                    return;
                }
                var that = this;
                this.removeCurrentSlide()
                    .then(function() {
                        that.setSlide(n)
                    })
                    .then(function() {
                        that.showCurrentSlide()
                    })
                    .then(function() {
                        that.updateView()
                    })
                    .catch(function(err) {
                        console.log('ERROR: '+err);
                    });
                return this;
            }
        },
        showInitialSlide: {
            value: function() {
                var that = this;
                this.removeCurrentSlide()
                    .then(function() {
                        that.reset()
                    })
                    .then(function() {
                        that.showCurrentSlide()
                    })
                    .then(function() {
                        that.updateView()
                    })
                    .catch(function(err) {
                        console.log('ERROR: '+err);
                    });
                return this;
            }
        },
        run: {
            value: function() {
                if (this.autoPlay) {
                    this.onfirst();
                    this.onplay();
                } else {
                    this.showInitialSlide();
                    // this.first();
                }
                if (this.audioAutoPlay) {
                    this.toggleAudio();
                }
            }
        },
        onfirst: {
            value: function() {
                this.onpause();
                this.nthSlide(0);
            }
        },
        onlast: {
            value: function() {
                this.onpause();
                this.nthSlide(this.lastSlideNumber);
            }
        },
        onplaypause: {
            value: function () {
                if (this.playState === 'playing') {
                    this.playState = 'paused';
                    if (this.currentSlideTimer) {
                        window.clearTimeout(this.currentSlideTimer);
                        this.currentSlideTimer = false;
                        if (this.syncAudio) {
                            this.pauseAudio();
                        }
                        this.updateView();
                    }
                } else {
                    //if (this.currentSlideTimer === false) {
                    //    this.reset();
                   // }

                   // handle case of first time playing.
                   if (this.currentSlideNumber === false) {
                        this.nthSlide(0);
                   }
               
                    this.playDirection = 'forward';
                    this.playState = 'playing';
                    if (this.syncAudio) {
                        this.playAudio();
                    }
                    this.updateView();
                    this.player();
                }
            }
        },
        onplay: {
            value: function() {
                if (this.currentSlideTimer) {
                    // ignore.
                } else {
                    // So we play the current slide, and then set the timeout.

                    if (this.playState === 'paused') {
                        // nothing to do.
                    } else if (this.playState === 'playing') {
                        return;
                    } else {
                        if (this.currentSlideNumber === false) {
                            this.reset();
                        }
                    }
                    this.playDirection = 'forward';
                    this.playState = 'playing';
                    if (this.syncAudio) {
                        this.playAudio();
                    }
                    this.updateView();
                    this.player();

                }
                return this;
            }
        },
        isPlaying: {
            value: function() {
                return (this.playState === 'playing');
            }
        },
        reset: {
            value: function() {
                this.removeCurrentSlide().then();
                this.currentSlideNumber = false;
                return this;
            }
        },
        player: {
            value: function() {
                if (this.playState !== 'playing') {
                    return;
                }

                // TODO handle play direction.

                // Show the next slide, then punt to the timer to call ourselves 
                // again...

                var galleryObj = this;

                this.currentSlideTimer = window.setTimeout(function() {
                    galleryObj.nextSlide();
                    galleryObj.updateView();
                    galleryObj.player();
                }, this.slideDuration);
            }
        },
        onpause: {
            value: function() {
                this.playState = 'paused';
                if (this.currentSlideTimer) {
                    window.clearTimeout(this.currentSlideTimer);
                    this.currentSlideTimer = false;
                    if (this.syncAudio) {
                        this.pauseAudio();
                    }
                    this.updateView();
                }
            }
        }

	});
  	return {Gallery: Gallery};
});