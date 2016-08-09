define([], function() {


    // Just a short hand for getting clock ticks.
    function getTicks() {
        var t = new Date();
        return t.getTime();
    }


    var charHeight = new Array();

    charHeight["green"] = {"default": 35};
    charHeight["red"] = {"default": 28};

    var charWidth = new Array();

    charWidth["green"] = {
        "I": 25,
        "1": 21, 
        "colon": 15,
        "apostrophe": 15,
        "exclamation":15,
        "space": 15,
        "comma": 20, 
        "period": 15,
        "double-quote": 25,
        "default": 35};

    charWidth["red35"] = {
        "I": 20,
        "1": 21, 
        "colon": 12,
        "apostrophe": 12,
        "exclamation":12,
        "space": 16,
        "comma": 20, 
        "period": 12,
        "double-quote": 20,
        "default": 35};

    charWidth["red"] = {
        "I": 20,
        "1": 28, 
        "colon": 12,
        "apostrophe": 4,
        "exclamation":12,
        "space": 16,
        "comma": 16, 
        "period": 12,
        "double-quote": 20,
        "default": 28};

    function getCharWidth (font, c) {
        var charName = charToName(c)
        var width = charWidth[font][charName];
        // alert("char width:"+font+", "+c+"="+width);
        if (!width) {
    	width = charWidth[font]["default"];
        }
        if (!width) {
    	alert("Can't determine width for "+font+", "+c);
    	return;
        } else {
    	return width;
        }
    }

    var charNameMap = {
        " ": "space",
        "?": "question",
        "'": "apostrophe",
        ",": "comma",
        "-": "minus",
        ".": "period",
        ":": "colon",
        "+": "plus",
        "%": "percent",
        '"': "double-quote",
        "!": "exclamation"};

    var debug = "";	


    function charToName(c) {
        // if (!c) {alert("not c!"+debug);}
        var cup = c.toUpperCase();
        if ((cup >= "A" && cup <= "Z")  || (cup >= "0" && cup <= "9")) {
    	return cup;
        }
        var name = charNameMap[c];
        if (!name) {
    	return "question";
        }
        
        return name;
    }

    function charToImage(font, c) {
        var name = charToName(c);
        
        if (font == "green") {
    	return "/js/digits/green/"+name+".jpg";
        } else if (font == "red") {		
    	return "/js/digits/red2/"+name+".jpg";
        }
    }

    function charImage(font,c) {
        return "<img src='"+charToImage(font, c)+"'>";
    }


    var dm = {};
    /*
      id = id of the object that should be scrolled
      rate = time in milliseconds between moves
      jump = size in pixels of the move
    */

    function dm_init(id, rate, jump, initialLeft) {
        if (dm[id]) {
        	alert("sorry, this animation is already running.");
        	return null;
        }
        var ticker = Ticker[id];
        
        animation = new Object();
        animation.id = id;
        animation.initialLeft = initialLeft;
        animation.rate = ticker.requestedRate;
        animation.state = 0;
        animation.jump = jump;
        animation.timer = null;
        dm[id] = animation;	
        return animation;
    }

    function dm_start(id) {
        var anim = dm[id];
        el = document.getElementById(id);
        el.style.left = anim.initialLeft+"px";
        anim.state = 1;
        dm_animate(id);
    }

    function dm_animate(id) {
        var anim = dm[id];
        if (anim && anim.state) {
    	var display = document.getElementById(anim.id);
    	// alert("here: "+display.style.left);
    	var left = display.offsetLeft;
    	
    	
    	var jump = Ticker[id].currentJumpSize;
    	
    	display.style.left = (left - jump) + "px";
    	
    	
    	updateRate2(id);
    	
    	// Calculate the jump...
    	
    	
    	
    	
    	
    	if (display.offsetWidth + left <= 0) {	
    	    dm_start(id);
    	} else {
    	    Ticker[id].startFrameTime = getTicks();
    	    
    	    // get timer time
    	    var t = Ticker[id].currentTimerTime;
    	    
    	    
    	    anim.timer = setTimeout(function() {dm_animate(id);}, t);
    	}
        }
    }

    /*
    */

    var Ticker = Object.create({}, {
        tickerTape: {
            value: undefined, writable: true
        },
        tickerNode: {
            value: undefined, writable: true
        },
        messages: {
            value: undefined, writable: true
        },
        messageSpacer {
            value: undefined, writable: true
        },
        pixelRate {
            value: 0, writable: true
        },
        elapsedTime {

        }
        init: {
            value: function (id, messages, messageSpacer, rate, timerTime, showGauge) {
                var totalWidth = 0;
                this.tickerNode = document.getElementById(id);

                this.messages = messages;
                this.messageSpacer = messageSpacer;
                this.pixelRate = 0;
                this.elapsedTime = 0;
                this.previousLeft = 0;
                this.previousTick = 0;
                this.requestedRate = rate;
                this.currentRate = rate;
                this.requestedTimerTime = timerTime;
                this.currentTimerTime = timerTime;
                this.state = 'new';
                this.speedAdjustment = 5;
                this.timerIncrement = 25;
                this.showGauge = showGauge;
                this.speed = 0;
                // Set initial frame pixel rate.
                // rate (pixels/sec) * initial timer time (millisec)/1000
                // e.g. 400px/sec * (20ms/1000) = 8/2 = 4.
                this.currentJummpSize = rate * (timerTime/1000);
            
                var content = "";
                for (j in messages) {
                    var font = messages[j].font;
                    var message = messages[j].text + messageSpacer;                  
                    for (i = 0; i < message.length; i++) {
                        var c = message.charAt(i);
                        content += charImage(font, c);
                        totalWidth += getCharWidth(font, c);
                    }
                
                }
                
                this.tickerNode.style.width = totalWidth+"px";
                this.tickerNode.innerHTML = content;
                
                this.updateRate(2);

                return this;
            }
        },
        updateRate: {
            value: function updateRate (id) {
                if (!this.tickerTape[id].frameCount) {
                    this.resetRate();      
                } else {
                    this.calcStats(id);
                }
                
                if (Ticker[id].showGauge) {
                    var gauge = document.getElementById("gauge");
                    gauge.innerHTML = formatNumber(Ticker[id].currentRate, 1, 8)+"px/sec";
                }
            }
        },

        xxx

        start: {
            value: function (id) {
                if (dm_init(id, 10, 1, 700)) {
    	       dm_start(id);
            }
        },
        stop: {
            value: function (id) {
                var anim = dm[id];
                
                if (anim) {
            	anim.state = 0;		
            	if (anim.timer) {
            	    clearTimeout(anim.timer);
            	}
            	dm[id] = null;
            	
            }
        },
        restart: {
            value: function (id) {
                stop(id);
                Ticker[id].speed=0;
                resetRate(id);	
                start(id);
            }
        }
        faster: {
            value: function (id) {
            // We now do pixels per second, so we can just fiddle with the rate
            // simply.
            increaseSpeed(id);
            return;
            
            
            Ticker[id].requestedRate += Ticker[id].speedAdjustment;
        },
        slower: {
            value: function (id) {
                decreaseSpeed(id);
                return
            }
        },
        pause: {
            value: function (id) {
                dm[id].state = 0;
                Ticker[id].state = 'paused';
            } 
        },
        play: {
            value: function (id) {
                Ticker[id].state = 'playing';
                resetRate(id);
                dm[id].state = 1;
                dm_animate(id);
            }
        },
        resetRate: {
            value: function () {
                // use this after a pause or when just starting.
                var currentLeft = this.tickerNode.offsetLeft;
                var currentTick = getTicks();
                this.previousLeft = currentLeft;
                this.previousTick = currentTick;
                
                this.startFrameTime = getTicks();

                this.frameCount = 1;
                }
            }
        },
        increaseSpeed: function (id) {
            /*

              if timer time > requested, decrease by increment.
              if timer time = requested, increase pixel move size by 1.

            */
                if (Ticker[id].currentTimerTime > Ticker[id].requestedTimerTime) {
            	Ticker[id].currentTimerTime -= Ticker[id].timerIncrement;
            	if (Ticker[id].currentTimerTime < Ticker[id].requestedTimerTime) {
            	    Ticker[id].currentTimerTIme = Ticker[id].requestedTimerTime;
            	}
                } else {
            	Ticker[id].currentJumpSize++;
                }
                Ticker[id].speed++;
                
            }
        },
        decreaseSpeed: function (id) {
            /*
              if pixel move size > 1, reduce by 1.
              if pixel move size == 1, increase timer time by increment.
            */
                if (Ticker[id].currentJumpSize > 2) {
            	Ticker[id].currentJumpSize--;
                } else {
            	Ticker[id].currentTimerTime += Ticker[id].timerIncrement;
                }
                Ticker[id].speed--;
            }
        },
        calcStats: {
            value: function (id) {
                var currentLeft = this.tickerNode.offsetLeft;
                var currentTick = getTicks();
                
                // Measurements of current behavior.
                var moved = this.previousLeft - currentLeft;
                var ticks = currentTick - this.previousTick;
                
                var currentRate = 1000*moved/ticks;
                
                this.frameCount++;
                
                this.frameTime = currentTick - Ticker[id].startFrameTime;	
                this.pixelsMoved += moved;
                this.elapsedTime += ticks;
                
                this.pixelRate = currentRate;
                this.previousLeft = currentLeft;
                this.previousTick = currentTick;
                
                this.currentTimePerFrame = ticks;
                this.totalTime += ticks;

                var realTimeElapsed = this.frameTime / 1000;
                var renderTime = realTimeElapsed - this.currentTimerTime/1000;
                this.avgRenderTime = renderTime / this.frameCount;
                
                var averageRate = 1000*this.pixelsMoved / this.elapsedTime;
                
                this.currentRate = currentRate;
                this.averageRate = averageRate;
                
                // Adjust thinkgs to reach ideal frame rate when we are at speed 0.
                if (this.speed == 0) {
                	var requiredJumpSize = (renderTime + this].requestedTimerTime/1000) * this.requestedRate;
                	this.currentJumpSize = Math.round(requiredJumpSize);
                	this.currentTimerTime = this.requestedTimerTime;
                }
            }
        },
        updateRate: {
            value: function (id) {
                var val = null;
                var ticker = document.getElementById(id);
                var debug = '';
                if (!Ticker[id].frameCount) {
                	this.resetRate();
                	val = 'n/a';
                } else {
                	var currentLeft = ticker.offsetLeft;
                	var currentTick = getTicks();
                	
                	// Measurements of current behavior.
                	var moved = Ticker[id].previousLeft - currentLeft;
                	var ticks = currentTick - Ticker[id].previousTick;
                	
                	
                	// See what the current speed settings are.
                	var currentRate = 1000*moved/ticks;
                	
                	Ticker[id].frameCount++;

                	// Calculations and tracking.
                	Ticker[id].frameTime = currentTick - Ticker[id].startFrameTime;	
                	Ticker[id].pixelsMoved += moved;
                	Ticker[id].elapsedTime += ticks;
                	
                	
                	// Save some of this for next iteration.
                	Ticker[id].pixelRate = currentRate;
                	Ticker[id].previousLeft = currentLeft;
                	Ticker[id].previousTick = currentTick;
                	
                	Ticker[id].currentTimePerFrame = ticks;
                	Ticker[id].totalTime += ticks;

                	
                	// Get next jump size.
                	// var currentJumpSize = Ticker[id].requestedRate * Ticker[id].frameTime;
                	var currentJumpSize = Ticker[id].currentJumpSize;
                	
                	
                	
                	// var realPixelsMoved = Ticker[id].currentPixelMoveSize;
                	
                	// convert to seconds.
                	var realTimeElapsed = Ticker[id].frameTime / 1000;
                	var renderTime = realTimeElapsed - Ticker[id].currentTimerTime/1000;
                	Ticker[id].avgRenderTime = renderTime / Ticker[id].frameCount;
                	
                	// var requiredJumpSize = Ticker[id].requestedRate * realTimeElapsed;
                	
                	var realRate = currentJumpSize / realTimeElapsed;
                	
            	
                	// The jump size we should use for the current system behavior (renderTime)
                	// and the requested rate (may have been adjusted since it was started)
                	// and the ideal timer time (requested timer time).
                	var requiredJumpSize = (renderTime + Ticker[id].requestedTimerTime/1000) * Ticker[id].requestedRate;
                	
                	var diff = requiredJumpSize - currentJumpSize;
                	
                	
                	var recommendedJumpSize = Math.round(requiredJumpSize);
                	if (diff > 1) {
                	    recommendedJumpSize++;
                	} else if (diff < -1) {
                	    recommendedJumpSize--;
                	}
                	
                	var newTimerTime;
                	
                	
                	// Adjustments to the timer time.
                	if (recommendedJumpSize < 1) {
                	    recommendedJumpSize = 1;
                	    var frameRenderTime = realTimeElapsed - Ticker[id].currentTimerTime/1000;
                	    var newTimerTime = recommendedJumpSize/Ticker[id].requestedRate-frameRenderTime;			
                	    Ticker[id].currentTimerTime = newTimerTime*1000;

                	    debug = 'rt:'+formatNumber(frameRenderTime,2,8)+", timer:"+
                		formatNumber(Ticker[id].currentTimerTime,2,8)+
                		", rate:"+formatNumber(Ticker[id].requestedRate,2,8)+
                		", new:"+formatNumber(Ticker[id].currentTimerTIme,2,8);
                	} else {
                	    newTimerTime = Ticker[id].requestedTimerTime;
                	    Ticker[id].currentTimerTime = Ticker[id].requestedTimerTime;
                	}
                	
                	Ticker[id].currentJumpSize = recommendedJumpSize;
                	
                	
                	var averageRate = 1000*Ticker[id].pixelsMoved / Ticker[id].elapsedTime;
                	
                	val = "rate (current):"+formatNumber(currentRate, 2, 8) +", rate (avg):"+ formatNumber(averageRate,2, 8);
                	
                	val += ", elapsed (real)"+formatNumber(realTimeElapsed, 2, 8);
                	
                	val += ", t (new)"+formatNumber(newTimerTime, 2, 8);
                	
                	// val = moved+", "+currentTick;
                	
                }
                    
                if (Ticker[id].showGauge) {
                	var gauge = document.getElementById("gauge");
                	gauge.innerHTML = "["+formatNumber(Ticker[id].requestedRate, 2 ,8)+" px/sec]";
                }
            }
        },
        formatNumber: {
            value: function (num, decimalPlaces, width, spacer) {
                if (!spacer) {spacer=" "};
                if (!num) {
            	return (new Array(width).join(spacer));
                }

                var fnum = ''+num.toFixed(decimalPlaces);
                
                if (fnum.length < width) {
            	fnum2 =  (new Array(width - fnum.length).join(spacer))+fnum;
                } else {
            	fnum2 = fnum;
                }
                // alert(fnum+", "+fnum.length+" < "+width+"="+fnum2);
                return fnum2;
            }
        }
    }

    return Ticker;
});

