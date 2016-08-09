define(["timezone", "jquery"], function(timezone, jquery) {
	// Set up our page variables.
	// tzString = "America/Los_Angeles";
	var tz = Object.create(timezone.TimezoneManager).init({
		zoneFileBasePath: '/scripts/modules/timezone/files',
		loadingScheme: timezone.TimezoneManager.loadingSchemes.MANUAL_LOAD,
		defaultZoneFile: [],
		zoneJSONPath: '/scripts/modules/timezone/files/all_cities.json'
	}),
		scanner = {timezoneManager: tz};

	scanner.removeLoadingClass = function(n) {
		while (n) {
			if (n.hasClass("dfw-loading")) {
				n.removeClass('dfw-loading');
				return;
			}
			n = n.parent();
		}
	};

	
	scanner.scanForTimezoneTimes = function() {
		var that = this;
		var tzTime = Object.create(timezone.Date);
		jquery("[data-field='dfw-timezone-time']").each(function() {
			var n = jquery(this),
				timeString = n.find("[data-field='timestamp']").first().text(),
				tzString = n.find("[data-field='timezone']").first().text(),
				type = n.find("[data-field='time-type']").first().text() || "datetime",
				format;

			switch (type) {
			case "date":
				format = "MM/dd/yyy";
				break;
			case "datetime":
				format = "MM/dd/yyyy HH:mm k";
				break;
			default:
				format = "MM/dd/yyyy HH:mm k";
				break;
			}

			n.find("[data-field='content-local-time']")
				.first()
				.text(tzTime.init(timeString, tz, tzString).toString(format));

			var browserTimeNode = jquery(this).find("[data-field='browser-local-time']").first();
			if (browserTimeNode) {
				// TODO: We can init from the local time's UTC time integer.
				browserTimeNode.text(tzTime.init(timeString).toString(format));
			}
			

			// that.removeLoadingClass(n);
			n.removeClass("dfw-loading");
		});
	};

	scanner.scanForLocalTimes = function() {
		// Scan the page for dates to fix up:
		jquery("[data-field='dfw-local-time']").each(function() {
			var n = jquery(this),
				timeString = n.find("[data-field='timestamp']").first().text(),
				format = "MM/dd/yyyy HH:mm k";
			if (timeString) {
				var time = Object.create(timezone.Date).init(timeString),
					browserTimeNode = jquery(this).find("[data-field='browser-local-time']").first();
				browserTimeNode.text(time.toString(format));
			}
			n.removeClass("dfw-loading");
		});
	};

	scanner.scanForTimes = function () {
		this.scanForTimezoneTimes();
		this.scanForLocalTimes();
	};

	// var t = Object.create(timezone.Date).init("2013-01-01T00:00:00-08:00", tz, "America/New_York");
	return scanner;
});