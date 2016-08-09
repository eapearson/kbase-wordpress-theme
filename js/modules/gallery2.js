define(['mustachio', 'rsvp', 'toolkit'], function (M, RSVP, TK) {
	var Queue = Object.create({}, {
		init: {
			value: function (config) {
                this.queue = [];

                this.timer = null;
                this.running = false;

                return this;
			}
		},
        start: {
            value: function () {
                // ensure the queue runner has started.
                if (!this.running) {
                    if (this.queue.length > 0) {
                        this.running = true;
                        this.doTick();
                    }
                }
            }
        },
        run: {
            value: function (delay) {
                var that = this;
                delay = delay || 0;
                if (!window.currentTimer) {
                    var tickFun = function() {
                        that.doTick();
                    };
                    window.setTimeout(tickFun, delay);
                }
            }
        },
        doTick: {
            value: function () {
                if (this.queue.length === 0) {
                    this.running = false;
                    return;
                }
                if (this.currentTimer) {
                    window.clearTimer(this.currentTimer);
                    this.currentTimer = null;
                }
                var next = this.queue.shift();
                try {
                    var result;
                    if (next.fun) {
                        result = next.fun.bind(next.this)(next);
                    }
                    if (next.waitAfter) {
                        this.run(next.waitAfter);
                    } else if (next.asyncWait) {
                        // now we loop back into our async wait
                        // loop.
                        next.asyncStarted = Date.now();
                        this.queue.unshift(next);
                        this.run(next.asyncWait);
                        next.asyncWait = null;
                    } else if (next.asyncStarted && next.asyncRetry) {
                        var elapsed = Date.now() - next.asyncStarted;
                        if (next.asyncTimeout < elapsed) {
                            // we lose this async job, but ...
                            if (next.onTimeout) {
                                try {
                                    next.onTimeout.bind(next.this)(next);
                                } catch (e) {
                                    console.log('EXCEPTION running queue item onTimeout: '+e+', fun: '+next.onTimeout);
                                }
                            }
                            console.log('Async wait timed out at '+elapsed+', with ' +next.asyncWait+','+next.asyncRetry+', '+next.asyncStarted);
                            this.run();                    
                        } else {
                            this.queue.unshift(next);
                            this.run(next.asyncRetry);
                        }
                    } else {
                        if (next.onComplete) {
                            try {
                                next.onComplete.bind(next.this)(next);
                            } catch (e) {
                                console.log('EXCEPTION running queue item onComplete: '+e+', fun: '+next.onComplete);
                            }
                        }
                        this.run();
                    }
                } catch (e) {
                    if (next.onTimeout) {
                        next.onTimeout.bind(next.this)(next);
                    }
                    console.log('EXCEPTION running queue item: '+e+', fun: '+next.fun);
                }

            }
        },
		pushBegin: {
			value: function (item, fun) {
                 if (fun) {
                    // two arg version
                    item = {
                        this: item,
                        fun: fun
                    }
                }
                // item.tart = item.start || 0;
 
                this.queue.unshift(item);
                this.start();
                return this;
			}
		},
        pushEnd: {
            value: function (item, fun) {
                if (fun) {
                    // two arg version
                    item = {
                        this: item,
                        fun: fun
                    }
                } 
                this.queue.push(item);
                this.start();
                return this;
            }
        },
        popBegin: {
            value: function () {
                item = this.queue.shift();
                return item;
            }
        },
        popEnd: {
            value: function () {
                item = this.queue.pop();
                return item;
            }
        }


	});
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
                this.slideTransitionDuration = config.slideTransitionDuration | 0.3;
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

                this.slideQueue = Object.create(Queue).init();


                this.autoPlay = config.autoPlay;
                // this.autoPlay = false;

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
                if (audioPlayer) {
                    this.syncAudio = config.syncAudio ? true : false;
                    this.audioAutoPlay = config.audioAutoPlay||this.autoPlay ? true : false;
                }


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
                // console.log('Toggling audio: '+this.audioPlayer.paused + ', '+this.audioPlayer.currentTime);
                if (this.audioPlayer) {
                    if (this.audioPlayer.paused ) {
                        this.audioPlayer.play();
                    } else if (!this.audioPlayer.paused && (this.audioPlayer.currentTime === 0)) {
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
                var q = this.slideQueue;
               
                // return new RSVP.Promise(function (resolve, reject) {
                if (this.currentSlideNumber !== false) {
                    var currentSlide = this.gallery[this.currentSlideNumber];
                    if (currentSlide.frame === undefined) {
                        var templateName = currentSlide.template || this.defaultTemplate || 'frame';
                        var template = this.templates[templateName];
                        

                        var templateText = template.render({
                            slide: currentSlide,
                            slideshow: this
                        });
                        
                        var tempNode = document.createElement("DIV");
                        
                        tempNode.innerHTML = templateText;
                        currentSlide.frame = tempNode.querySelector('.frame');
                        // currentSlide.frame = document.createElement(templateText);
                    } else {
                    	
                    }
                    currentSlide.frame.style.opacity = 0;
                    
                    currentSlide.frame = this.frameHolder.appendChild(currentSlide.frame);

                    var transitionStyle = TK.DOMTools.transitionStyleName(currentSlide.frame);
					currentSlide.frame.style[transitionStyle] = 'opacity 0.5s ease-in';
					var t = currentSlide.frame.offsetLeft;					
					currentSlide.frame.style.opacity = 1;
                    var qitem = { 
                        asyncWait: this.slideTransitionDuration,
                        asyncRetry: 100,
                        asyncTimeout: this.slideTransitionDuration * 2,
                        fun: null
                    };
                    this.slideQueue.pushBegin(qitem);
                    TK.DOMTools.onTransitionEnd(currentSlide.frame, function (e) {

                        qitem.asyncWait = false;
                        qitem.asyncRetry = false;
                        qitem.asyncStarted = false;
                    });
                } else {
                    // An undefined slide number occurs when a slideshow is first run
                    // without autoplay and with the initialSlide not set. Look for
                    // the initialSlideTemplate ... if not found, just do nothing.
                    var templateText;
                    if (this.templates['initialSlide']) {
                        this.initialSlide = {};
                        var template = this.templates['initialSlide'];
                        try {
 							templateText = template.render({
                                slide: currentSlide,
                                slideshow: this
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
                        var frame = this.initialSlide.frame = tempNode.querySelector('.frame');
                        
                        this.frameHolder.appendChild(frame);
                        frame.style[TK.DOMTools.transitionStyleName(frame)] = '0.5s ease-in';
                        var tmp = frame.offsetLeft;
                        var qitem = { 
                            asyncWait: this.slideTransitionDuration,
                            asyncRetry: 100,
                            asyncTimeout: this.slideTransitionDuration * 2,
                            fun: null
                        };
                        this.slideQueue.pushBegin(qitem);
                       	TK.DOMTools.onTransitionEnd(frame, function (e) {
                        	qitem.asyncWait = false;
                            qitem.asyncRetry = false;
                            qitem.asyncStarted = false;
                        });
                    }

                }
                    
            }
        },
        removeCurrentSlide: {
            value: function() {
                var that = this;
                // return new RSVP.Promise(function(resolve, reject) {

                var q = this.slideQueue;
               
            	var node = that.frameHolder.querySelector('.frame');
            	
                if (node) {
                	node.style[TK.DOMTools.transitionStyleName(node)] = 'opacity 0.5s ease-out';
                	var tmp = node.offsetLeft;
                	node.style.opacity = 0;
                    var qitem = { 
                        asyncWait: this.slideTransitionDuration,
                        asyncRetry: 100,
                        asyncTimeout: this.slideTransitionDuration * 2,
                        fun: null
                    };
                    this.slideQueue.pushBegin(qitem);
                	TK.DOMTools.onTransitionEnd(node, function (e) {
                        if (node) {
                    		if (node.parentNode) {
                    			node.parentNode.removeChild(node);
                    		}
                        }
                		qitem.asyncWait = false;
                        qitem.asyncRetry = false;
                        qitem.asyncStarted = false;
                	});
            		
                }
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
        updateControls: {
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
                this.pause();
                this.nextSlide();
            }
        },
        onprev: {
            value: function() {
                this.pause();
                this.prevSlide();
            }
        },
        nextSlide: {
            value: function() {
               
				var q = this.slideQueue;
                q.pushEnd({
                    this: this, 
                    fun: function () {
                        this.removeCurrentSlide();
                    }
                });
            	q.pushEnd({
                    this: this, 
                    fun: function (item) {
    	                if (this.currentSlideNumber === false) {
    	                    this.currentSlideNumber = 0;
    	                } else {
    	                    if (this.currentSlideNumber === this.lastSlideNumber) {
    	                        this.currentSlideNumber = 0;
    	                    } else {
    	                        this.currentSlideNumber++;
    	                    }
    	                }
                    }
	            });
                q.pushEnd({
                    this: this, 
                    fun: function () {
                      this.updateControls();
                    }
                });
	            q.pushEnd({
                    this: this, 
                    fun: function () {
	            	  this.showCurrentSlide();
                    }
	            });
	            
                
                return this;
            }
        },
        prevSlide: {
            value: function() {
                
                var q = this.slideQueue;
                
                q.pushEnd(this, function (item) {
                    if (this.currentSlideNumber === false) {
                        this.currentSlideNumber = 0;
                    } else {
                        if (this.currentSlideNumber === 0) {
                            this.currentSlideNumber = this.lastSlideNumber;
                        } else {
                            this.currentSlideNumber--;
                        }
                    }
                });
                q.pushEnd(this, function () {
                    this.removeCurrentSlide();
                });
                 q.pushEnd(this, function () {
                    this.updateControls();
                });
                q.pushEnd(this, function () {
                    this.showCurrentSlide();
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
            value: function(slideNumber) {
                var q = this.slideQueue;  
                /*q.pushEnd(this, (function (n) {
                    return function (item) {
                        if ((n < 0) || (n > this.lastSlideNumber)) {
                            return;
                        } else if (this.currentSlideNumber === n) {
                            return;
                        }
                    }
                })(slideNumber));
*/
                q.pushEnd(this, function () {
                    this.setSlide(slideNumber);
                });
                q.pushEnd(this, function () {
                    this.removeCurrentSlide();
                });
                 q.pushEnd(this, function () {
                    this.updateControls();
                }); 
                q.pushEnd(this, function () {
                    this.showCurrentSlide();
                });
                 
                return this;
            }
        },
        showInitialSlide: {
            value: function() {
                var q = this.slideQueue;   
                q.pushEnd(this, function () {
                    this.reset();
                });
                q.pushEnd(this, function () {
                    this.removeCurrentSlide();
                });
                 q.pushEnd(this, function () {
                    this.updateControls();
                });   
                q.pushEnd(this, function () {
                    this.showCurrentSlide();
                });
               
                return this;
            }
        },
        run: {
            value: function() {
                if (this.autoPlay) {
                    var q = this.slideQueue;
                    this.pause();
                    this.play();
                } else {
                    this.showInitialSlide();
                }
                if (this.audioAutoPlay) {
                    this.toggleAudio();
                }
            }
        },
        onfirst: {
            value: function() {
                this.pause();
                this.nthSlide(0);
            }
        },
        onlast: {
            value: function() {
                this.pause();
                this.nthSlide(this.lastSlideNumber);
            }
        },
        onplaypause: {
            value: function () {
                if (this.playState === 'playing') {
                    this.pause();
                } else {
                   this.play();
                }
            }
        },
        onplay: {
            value: function() {
                this.play();
            }
        },
        play: {
            value: function() {
                if (this.playState === 'playing') {
                    return;
                }
                //if (this.currentSlideNumber === false) {
                //    this.nthSlide(0);
               // }
                this.playDirection = 'forward';
                this.playState = 'playing';
                if (this.syncAudio) {
                    this.playAudio();
                }
                //console.log("syncing audio? " + this.syncAudio);
                this.slideQueue.pushEnd({
                    this: this,
                    fun: function (qitem) {
                        if (this.playState === 'paused') {
                            this.pause();
                        } else {
                            // This will queue up the next slide.
                            this.nextSlide();
                            // This will add ME back onto the queue.
                            this.slideQueue.pushEnd({
                                this: this,
                                waitAfter: this.slideDuration
                            });
                            this.slideQueue.pushEnd(qitem);
                        }
                    }
                });
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
                this.removeCurrentSlide();
                this.currentSlideNumber = false;
                return this;
            }
        },
        onpause: {
            value: function() {
                this.pause();
            }
        },
        pause: {
            value: function() {
                this.playState = 'paused';
                if (this.syncAudio) {
                    this.pauseAudio();
                }
                this.updateControls();
                return this;
            }
        }

	});
  	return {Gallery: Gallery};
});