define([], function() {
	"use strict";
	var Utils = {};
	Utils.version = "0.1";


	Utils.urlPath= function (url, defaultRoot) {
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
	};


	Utils.facebook = function() {
		var d = document,
			id = 'facebook-jssdk',
			fjs = d.getElementsByTagName('script')[0];

		if (d.getElementById(id)) return;

		var js = d.createElement('script'); 
		js.id = id;
		js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
		fjs.parentNode.insertBefore(js, fjs);
	};

	Utils.twitter = function() {
		var d = document,
			id = 'twitter-wjs',
			fjs=d.getElementsByTagName('script')[0];

		if(!d.getElementById(id)) {
			var js=d.createElement('script');
			js.id=id;
			js.src="//platform.twitter.com/widgets.js";
			fjs.parentNode.insertBefore(js,fjs);
		}
	};

	return Utils;
 });

