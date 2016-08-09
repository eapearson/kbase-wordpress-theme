define(['jquery', 'lodash'], function(jquery,lodash) {
	

	var Carousel = Object.create({},{
		root: {
			value: undefined,
			writable: true
		},
		panels: {
			value: undefined,
			writable: true
		},
		currentPanelIndex: {
			value: 0,
			writable: true
		},
		showCurrent: {
			value: function() {
				this.panels[this.currentPanelIndex].show();
			}
		},
		showNavStats: {
			value: function() {
				this.root.find(".dfw-controls .dfw-total-count").text(this.panels.length);
				this.root.find(".dfw-controls .dfw-current-index").text(this.currentPanelIndex+1);
			}
		}
	});
	

	var CarouselManager = Object.create({}, {
		autoRun: {
			value: false,
			writable: true
		}
	});
	CarouselManager.run = function(n) {
		// Scan the panel children, and cache in a map.
		var carousel = Object.create(Carousel, {
			panels: {
				value: []
			}
		});
		carousel.root = n;
		n.find(".dfw-panel > ol > li").each(function() {
			var panel = jquery(this);
			carousel.panels.push(panel);
			panel.hide();
		});

		// Set the click events for next/prev

		n.find(".dfw-controls .dfw-next").on('click', function(event) {
			carousel.panels[carousel.currentPanelIndex].hide();
			if (carousel.currentPanelIndex >= carousel.panels.length-1) {
				carousel.currentPanelIndex = 0;
			} else {
				carousel.currentPanelIndex++;
			}
			
			carousel.panels[carousel.currentPanelIndex].show();
			carousel.showNavStats();
		});
		n.find(".dfw-controls .dfw-prev").on('click', function(event) {
			carousel.panels[carousel.currentPanelIndex].hide();
			if (carousel.currentPanelIndex <= 0) {
				carousel.currentPanelIndex = carousel.panels.length - 1;
			} else {
				carousel.currentPanelIndex--;
			}
			
			carousel.panels[carousel.currentPanelIndex].show();
			carousel.showNavStats();
		});
		n.find(".dfw-controls .dfw-first").on('click', function(event) {
			carousel.panels[carousel.currentPanelIndex].hide();
			carousel.currentPanelIndex = 0;
			carousel.panels[carousel.currentPanelIndex].show();
			carousel.showNavStats();
		});
		n.find(".dfw-controls .dfw-last").on('click', function(event) {
			carousel.panels[carousel.currentPanelIndex].hide();
			carousel.currentPanelIndex = carousel.panels.length-1;
			carousel.panels[carousel.currentPanelIndex].show();
			carousel.showNavStats();
		});

		// Show the first one.
		carousel.showCurrent();
		carousel.showNavStats();
		carousel.root.removeClass("dfw-loading");
	};
	CarouselManager.scan = function() {
		var that = this;
		jquery(".dfw-carousel").each(function () {
			that.run(jquery(this));
		});
	};
	var module = {};
	module.Carousel = Carousel;
	module.CarouselManager = CarouselManager;
	return module;

});