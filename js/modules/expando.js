define([], function () {
	// var helper = Object.create(window.Helper);
	'use strict';
	var Expando = Object.create({} , {
	  	init: {
	  		value: function (config) {
	  			this.config = config;
	  			this.container = document.querySelector(config.container);
	  			return this;
	  		}
	  	}, 
	  	getConfig: {
	  		value: function (name) {
				var c = this.container.querySelector('.config[data-name="'+name+'"]');		
				if (c) {
					var configs = c.querySelectorAll('[data-config]');
					helper.nodeListEach(configs, function (n) {
						var setting = n.getAttribute('data-config');
						var value = n.innerHTML;
						this.config[setting] = value;
					});
				}
			}
		},
		run: {
			value: function() {
				var that = this;

				helper.nodeListEach(this.container.querySelectorAll('.expando'), function (n) {
					// set control value

					n.querySelector('.control').innerHTML = that.config['controlClosed'];
					//

					n.querySelector('.expander').addEventListener('click', function(e) {
							var expando = helper.findAncestor(e.target, '.expando');
							if (expando.classList.contains('-open')) {
								expando.classList.remove('-open');
								expando.querySelector('.control').innerHTML = that.config['controlClosed'];
							} else {
								expando.classList.add('-open');
								expando.querySelector('.control').innerHTML = that.config['controlOpen'];
							}
					});
				});
				return this;
			}
		}
	});
	return {
		Expando: Expando;
	}
});