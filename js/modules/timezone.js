
define(["jquery", "lodash"], function(jquery, lodash) {
	"use strict";
	// timezone in yui


	// Define Timezone object
	// Timezone object is just a plain object for representing this module?
	var Timezone = {};

	Timezone.version = "0.1";

	// Utility functions, internal.

	// Format a number to the length = digits. For ex:
	//
	// `fixWidth(2, 2) = '02'`
	//
	// `fixWidth(1998, 2) = '98'`
	//
	// This is used to pad numbers in converting date to string in ISO standard.

	function fixWidth(number, digits) {
		if (typeof number !== "number") {
			throw "not a number: " + number;
		} else {
			var s = number.toString();
			if (number.length > digits) {
				return number.substr(number.length - digits, number.length);
			}
			while (s.length < digits) {
				s = '0' + s;
			}
			return s;
		}
	}

	// Timezone Date prototype

	var LOCALSTRINGS = {
		days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		amUpper: 'Aug',
	  	pmUpper: 'PM',	
	  	am: 'am',
	  	pm: 'pm'
	};

	Timezone.LocalStrings = LOCALSTRINGS;

	// Helpers for the formatter. 

  	function quacksLikeDate(possibleDate) {
    	var requiredMethods = ['getTime', 'getTimezoneOffset', 'getDay', 'getDate', 'getMonth', 
    					       'getFullYear', 'getYear', 'getHours', 'getMinutes', 'getSeconds'];
 		return lodash.every(requiredMethods, function(methodName) {
 			return (typeof possibleDate[methodName] == 'function');
 		});
  	}

  	// Default padding is '0' and default length is 2, both are optional.
  	function pad(n, padding, length) {
    	// pad(n, <length>)
    	if (typeof padding === 'number') {
      		length = padding;
      		padding = '0';
    	}

    	// Defaults handle pad(n) and pad(n, <padding>)
    	if (padding == null) {
      		padding = '0';
    	}
    	length = length || 2;

    	var s = String(n);
    	// padding may be an empty string, don't loop forever if it is
    	if (padding) {
      		while (s.length < length) s = padding + s;
    	}
    	return s;
  	}

  	function hours12(date) {
    	var hour = date.getHours();
    	if (hour == 0) {
    		hour = 12;
    	} else if (hour > 12) {
    		hour -= 12;
    	}
    	return hour;
  	}

  	// firstWeekday: 'sunday' or 'monday', default is 'sunday'
  	//
  	// Pilfered & ported from Ruby's strftime implementation.
  	function weekNumber(date, firstWeekday) {
    	firstWeekday = firstWeekday || 'sunday';

    	// This works by shifting the weekday back by one day if we
    	// are treating Monday as the first day of the week.
    	var wday = date.getDay();
    	if (firstWeekday == 'monday') {
    	  	if (wday == 0) {
    	  		// Sunday
        		wday = 6;
        	} else {
        		wday--;
        	}
    	}
    	var firstDayOfYear = new Date(date.getFullYear(), 0, 1), 
    		yday = (d - firstDayOfYear) / 86400000,
      		weekNum = (yday + 7 - wday) / 7;
    	return Math.floor(weekNum);
  	}



	Timezone.Format = Object.create({}, {
		ISOFORMAT: {
			value: '%Y-%m-%dT%H:%M:%S%Z'
		},
		strftime: {
			value: function (format, date, locale) {
				return this._strftime(format, date, locale, false);
			}
		},
		strftimeUTC: {
			value: function(format, date, locale) {
				return this._strftime(format, date, locale, true)
			}
		},
		_strftime: {
			value: function(format, date, locale, useUTC) {
				 // d and locale are optional so check if d is really the locale
    			if (date && !quacksLikeDate(date)) {
      				locale = date;
      				date = undefined;
    			}
    			date = date || new Date();
    			locale = locale || LOCALSTRINGS;
    			locale.formats = locale.formats || {};
    			var msDelta = 0;
    			if (useUTC) {
      				msDelta = (date.getTimezoneOffset() || 0) * 60000;
      				date = new Date(date.getTime() + msDelta);
    			}

			    // Most of the specifiers supported by C's strftime, and some from Ruby.
			    // Some other syntax extensions from Ruby are supported: %-, %_, and %0
			    // to pad with nothing, space, or zero (respectively).
			    return format.replace(/%([-_0]?.)/g, function(match, c) {
			      	var mod, padding;
			      	if (c.length == 2) {
			        	mod = c[0];
			        	// omit padding
			        	if (mod == '-') {
			          		padding = '';
			        	} else if (mod == '_') {
  					        // pad with space
					        padding = ' ';
			        	} else if (mod == '0') {
			        		// pad with zero
			          		padding = '0';
			        	} else {
			          		// unrecognized, return the format
			          		return match;
			        	}
			        	c = c[1];
			      	}
			      	switch (c) {
				        case 'A': return locale.days[date.getDay()];
				        case 'a': return locale.shortDays[date.getDay()];
				        case 'B': return locale.months[date.getMonth()];
				        case 'b': return locale.shortMonths[date.getMonth()];
				        case 'C': return pad(Math.floor(date.getFullYear() / 100), padding);
				        case 'D': return _strftime(locale.formats.D || '%m/%d/%y', d, locale);
				        case 'd': return pad(date.getDate(), padding);
				        case 'e': return date.getDate();
				        case 'F': return _strftime(locale.formats.F || '%Y-%m-%d', date, locale);
				        case 'H': return pad(date.getHours(), padding);
				        case 'h': return locale.shortMonths[date.getMonth()];
				        case 'I': return pad(hours12(date), padding);
				        case 'j': 	var y=new Date(date.getFullYear(), 0, 1);
				          			var day = Math.ceil((date.getTime() - y.getTime()) / (1000*60*60*24));
				          			return day;
				        case 'k': return pad(date.getHours(), padding == null ? ' ' : padding);
				        case 'L': return pad(Math.floor(date.getTime() % 1000), 3);
				        case 'l': return pad(hours12(date), padding == null ? ' ' : padding);
				        case 'M': return pad(date.getMinutes(), padding);
				        case 'm': return pad(date.getMonth() + 1, padding);
				        case 'n': return '\n';
				        case 'P': return date.getHours() < 12 ? locale.am : locale.pm;
				        case 'p': return date.getHours() < 12 ? locale.amUpper : locale.pmUpper;
				        case 'R': return _strftime(locale.formats.R || '%H:%M', date, locale);
				        case 'r': return _strftime(locale.formats.r || '%I:%M:%S %p', date, locale);
				        case 'S': return pad(date.getSeconds(), padding);
				        case 's': return Math.floor((date.getTime() - msDelta) / 1000);
				        case 'T': return _strftime(locale.formats.T || '%H:%M:%S', d, locale);
				        case 't': return '\t';
				        case 'U': return pad(weekNumber(date, 'sunday'), padding);
				        case 'u': 	var day = date.getDay();
				          			return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week
				        case 'v': return _strftime(locale.formats.v || '%e-%b-%Y', d, locale);
				        case 'W': return pad(weekNumber(d, 'monday'), padding);
				        case 'w': return date.getDay(); // 0 - 6, Sunday is first day of the week
				        case 'Y': return date.getFullYear();
				        case 'y': var y = String(date.getFullYear());
				          		  return y.slice(y.length - 2);
				        case 'Z': 	if (useUTC) {
				            			return "GMT";
				          			} else {
				            			// var tz = date.toString().match(/\((\w+)\)/);
				            			return date.getTimezoneAbbreviation && date.getTimezoneAbbreviation() ||'';
				            			// return tz && tz[1] || '';
				          			}
				        case 'z': 	if (useUTC) {
				            			return "+0000";
				          			} else {
				            			var off = date.getTimezoneOffset();
				            			return (off < 0 ? '+' : '-') + pad(Math.abs(off / 60)) + pad(off % 60);
				          			}
				        default: return c;
			      	}
			    });
			}
		}

	});

	Timezone.Date = Object.create({},  {
		init: {
			value: function(date, tzManager, tzString) {
				var // args = Array.prototype.slice.apply(arguments),
					// dt = null,
					// tz = null;
					// arr = [];
					dt;

				if (date) {
					dt = new Date(date);
				} else {
					dt = new Date();
				}

				this.useCache = false;
				this.tzInfo = {};
				this.day = 0;
				this.year = 0;
				this.month = 0;
				this.date = 0;
				this.hours = 0;
				this.minutes = 0;
				this.seconds = 0;
				this.milliseconds = 0;
				this.timezone = tzString || null;
				this.timezoneManager = tzManager;
				this.setFromTimeProxy(dt.getTime(), tzString);
				return this;
			}
		},
		getDate: {
			value: function() {
				return this.date;
			}
		},
		getDay: {
			value: function() {
				return this.day;
			}
		},
		getFullYear: {
			value: function() {
				return this.year;
			}
		},
		getMonth: {
			value: function() {
				return this.month;
			}
		},
		getYear: {
			value: function() {
				return this.year - 1900;
			}
		},
		getHours: {
			value: function() {
				return this.hours;
			}
		},
		getMilliseconds: {
			value: function() {
				return this.milliseconds;
			}
		},
		getMinutes: {
			value: function() {
				return this.minutes;
			}
		},
		getSeconds: {
			value: function() {
				return this.seconds;
			}
		},
		getUTCDate: {
			value: function() {
				return this.getUTCDateProxy().getUTCDate();
			}
		},
		getUTCDay: {
			value: function() {
				return this.getUTCDateProxy().getUTCDay();
			}
		},
		getUTCFullYear: {
			value: function() {
				return this.getUTCDateProxy().getUTCFullYear();
			}
		},
		getUTCHours: {
			value: function() {
				return this.getUTCDateProxy().getUTCHours();
			}
		},
		getUTCMilliseconds: {
			value: function() {
				return this.getUTCDateProxy().getUTCMilliseconds();
			}
		},
		getUTCMinutes: {
			value: function() {
				return this.getUTCDateProxy().getUTCMinutes();
			}
		},
		getUTCMonth: {
			value: function() {
				return this.getUTCDateProxy().getUTCMonth();
			}
		},
		getUTCSeconds: {
			value: function() {
				return this.getUTCDateProxy().getUTCSeconds();
			}
		},
		// Time adjusted to user-specified timezone
		getTime: {
			value: function() {
				return this.timeProxy + (this.getTimezoneOffset() * 60 * 1000);
			}
		},
		getTimezone: {
			value: function() {
				return this.timezone;
			}
		},
		getTimezoneOffset: {
			value: function() {
				return this.getTimezoneInfo().tzOffset;
			}
		},
		getTimezoneAbbreviation: {
			value: function() {
				return this.getTimezoneInfo().tzAbbr;
			}
		},
		getTimezoneInfo: {
			value: function() {

				if (this.useCache) {
					return this.tzInfo;
				}

				var res;
				if (this.timezone) {
					// If timezone is specified, get the correct timezone info based on the Date given
					if (this.timezone === 'Etc/UTC' || this.timezone === 'Etc/GMT') {
						res = {
							tzOffset: 0,
							tzAbbr: 'Z'
							// tzAbbr: 'UTC'
						};
					} else {
						res = this.timezoneManager.getTzInfo(this.timeProxy, this.timezone);
					}
				} else {
					// If no timezone was specified, use the local browser offset
					res = {
						tzOffset: this.getLocalOffset(),
						tzAbbr: null
					};
				}
				this.tzInfo = res;
				this.useCache = true;
				return res;
			}
		},
		getUTCDateProxy: {
			value: function() {
				var dt = new Date(this.timeProxy);
				dt.setUTCMinutes(dt.getUTCMinutes() + this.getTimezoneOffset());
				return dt;
			}
		},
		setDate: {
			value: function(date) {
				this.setAttribute('date', date);
				return this.getTime();
			}
		},
		setFullYear: {
			value: function(year, month, date) {
				if (date !== undefined) {
					this.setAttribute('date', 1);
				}
				this.setAttribute('year', year);
				if (month !== undefined) {
					this.setAttribute('month', month);
				}
				if (date !== undefined) {
					this.setAttribute('date', date);
				}
				return this.getTime();
			}
		},
		setMonth: {
			value: function(month, date) {
				this.setAttribute('month', month);
				if (date !== undefined) {
					this.setAttribute('date', date);
				}
				return this.getTime();
			}
		},
		setYear: {
			value: function(year) {
				year = Number(year);
				if (0 <= year && year <= 99) {
					year += 1900;
				}
				this.setUTCAttribute('year', year);
				return this.getTime();
			}
		},
		setHours: {
			value: function(hours, minutes, seconds, milliseconds) {
				this.setAttribute('hours', hours);
				if (minutes !== undefined) {
					this.setAttribute('minutes', minutes);
				}
				if (seconds !== undefined) {
					this.setAttribute('seconds', seconds);
				}
				if (milliseconds !== undefined) {
					this.setAttribute('milliseconds', milliseconds);
				}
				return this.getTime();
			}
		},
		setMinutes: {
			value: function(minutes, seconds, milliseconds) {
				this.setAttribute('minutes', minutes);
				if (seconds !== undefined) {
					this.setAttribute('seconds', seconds);
				}
				if (milliseconds !== undefined) {
					this.setAttribute('milliseconds', milliseconds);
				}
				return this.getTime();
			}
		},
		setSeconds: {
			value: function(seconds, milliseconds) {
				this.setAttribute('seconds', seconds);
				if (milliseconds !== undefined) {
					this.setAttribute('milliseconds', milliseconds);
				}
				return this.getTime();
			}
		},
		setMilliseconds: {
			value: function(milliseconds) {
				this.setAttribute('milliseconds', milliseconds);
				return this.getTime();
			}
		},
		setTime: {
			value: function(n) {
				if (isNaN(n)) {
					throw new Error('Units must be a number.');
				}
				this.setFromTimeProxy(n, this.timezone);
				return this.getTime();
			}
		},
		setUTCFullYear: {
			value: function(year, month, date) {
				if (date !== undefined) {
					this.setUTCAttribute('date', 1);
				}
				this.setUTCAttribute('year', year);
				if (month !== undefined) {
					this.setUTCAttribute('month', month);
				}
				if (date !== undefined) {
					this.setUTCAttribute('date', date);
				}
				return this.getTime();
			}
		},
		setUTCMonth: {
			value: function(month, date) {
				this.setUTCAttribute('month', month);
				if (date !== undefined) {
					this.setUTCAttribute('date', date);
				}
				return this.getTime();
			}
		},
		setUTCDate: {
			value: function(date) {
				this.setUTCAttribute('date', date);
				return this.getTime();
			}
		},
		setUTCHours: {
			value: function(hours, minutes, seconds, milliseconds) {
				this.setUTCAttribute('hours', hours);
				if (minutes !== undefined) {
					this.setUTCAttribute('minutes', minutes);
				}
				if (seconds !== undefined) {
					this.setUTCAttribute('seconds', seconds);
				}
				if (milliseconds !== undefined) {
					this.setUTCAttribute('milliseconds', milliseconds);
				}
				return this.getTime();
			}
		},
		setUTCMinutes: {
			value: function(minutes, seconds, milliseconds) {
				this.setUTCAttribute('minutes', minutes);
				if (seconds !== undefined) {
					this.setUTCAttribute('seconds', seconds);
				}
				if (milliseconds !== undefined) {
					this.setUTCAttribute('milliseconds', milliseconds);
				}
				return this.getTime();
			}
		},
		setUTCSeconds: {
			value: function(seconds, milliseconds) {
				this.setUTCAttribute('seconds', seconds);
				if (milliseconds !== undefined) {
					this.setUTCAttribute('milliseconds', milliseconds);
				}
				return this.getTime();
			}
		},
		setUTCMilliseconds: {
			value: function(milliseconds) {
				this.setUTCAttribute('milliseconds', milliseconds);
				return this.getTime();
			}
		},
		setFromDateObjProxy: {
			value: function(dt) {
				this.year = dt.getFullYear();
				this.month = dt.getMonth();
				this.date = dt.getDate();
				this.hours = dt.getHours();
				this.minutes = dt.getMinutes();
				this.seconds = dt.getSeconds();
				this.milliseconds = dt.getMilliseconds();
				this.day = dt.getDay();
				this.dateProxy = dt;
				this.timeProxy = Date.UTC(this.year, this.month, this.date, this.hours, this.minutes, this.seconds, this.milliseconds);
				this.useCache = false;
			}
		},
		setFromTimeProxy: {
			value: function(utcMillis, tz) {
				var dt = new Date(utcMillis);
				var tzOffset;
				tzOffset = tz ? this.timezoneManager.getTzInfo(dt, tz).tzOffset : dt.getTimezoneOffset();
				dt.setTime(utcMillis + (dt.getTimezoneOffset() - tzOffset) * 60000);
				this.setFromDateObjProxy(dt);
			}
		},
		setAttribute: {
			value: function(unit, n) {
				if (isNaN(n)) {
					throw new Error('Units must be a number.');
				}
				var dt = this.dateProxy;
				var meth = unit === 'year' ? 'FullYear' : unit.substr(0, 1).toUpperCase() + unit.substr(1);
				dt['set' + meth](n);
				this.setFromDateObjProxy(dt);
			}
		},
		setUTCAttribute: {
			value: function(unit, n) {
				if (isNaN(n)) {
					throw new Error('Units must be a number.');
				}
				var meth = unit === 'year' ? 'FullYear' : unit.substr(0, 1).toUpperCase() + unit.substr(1);
				var dt = this.getUTCDateProxy();
				dt['setUTC' + meth](n);
				dt.setUTCMinutes(dt.getUTCMinutes() - this.getTimezoneOffset());
				this.setFromTimeProxy(dt.getTime() + this.getTimezoneOffset() * 60000, this.timezone);
			}
		},
		setTimezone: {
			value: function(tz) {
				var previousOffset = this.getTimezoneInfo().tzOffset;
				this.timezone = tz;
				this.useCache = false;
				// Set UTC minutes offsets by the delta of the two timezones
				this.setUTCMinutes(this.getUTCMinutes() - this.getTimezoneInfo().tzOffset + previousOffset);
			}
		},
		removeTimezone: {
			value: function() {
				this.timezone = null;
				this.useCache = false;
			}
		},
		valueOf: {
			value: function() {
				return this.getTime();
			}
		},
		toGMTString: {
			value: function() {
				var format = '%a, %d %b %Y %H:%M:%S %Z';

				return this.toString(format, 'Etc/GMT');
			}
		},
		toLocaleString: {
			value: function() {}
		},
		toLocaleDateString: {
			value: function() {}
		},
		toLocaleTimeString: {
			value: function() {}
		},
		toSource: {
			value: function() {}
		},
		toISOString: {
			value: function() {
				var formatter = Object.create(Timezone.Format);
				return formatter.strftime(formatter.ISOFORMAT, this);
			}
		},
		toJSON: {
			value: function() {
				return this.toISOString();
			}
		},
		// Allows different format following ISO8601 format:
		format: {
			value: function(format, tz) {
				return this.toString.call(this, format, tz);
			}
		},
		clone: {
			value: function () {
				return Object.create(this).init(this.getTime());
			}
		},
		toString: {
			value: function(format, tz) {
				// Default format is ttshe same as toISOString
				var formatter = Object.create(Timezone.Format);
				if (!format) {
					format = formatter.ISOFORMAT;
				}

				var that;
				if (tz) {
					that = Object.create(this).init(this.getTime(), this.timezoneManager, tz);
				} else {
					that = this;
				}

				return formatter.strftime(format, that);
			}
		},
		toUTCString: {
			value: function() {
				return this.toGMTString();
			}
		},
		civilToJulianDayNumber: {
			value: function(y, m, d) {
				var a;
				// Adjust for zero-based JS-style array
				m++;
				if (m > 12) {
					a = parseInt(m / 12, 10);
					m = m % 12;
					y += a;
				}
				if (m <= 2) {
					y -= 1;
					m += 12;
				}
				a = Math.floor(y / 100);
				var b = 2 - a + Math.floor(a / 4),
					jDt = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;
				return jDt;
			}
		},
		getLocalOffset: {
			value: function() {
				return this.dateProxy.getTimezoneOffset();
			}
		}
	});
	

	/*
	Timezone Prototype 
	*/
	Timezone.TimezoneManager = Object.create({}, {
		// Properties
		//config: {
		//	value: null
		//},
		//zoneFileBasePath: {
		//	value: null
		//},
		//loadingScheme: {
		//	value: null
		//},
		//loadedZones: {
		//	value: {}
		//},

		//defaultZoneFiles: {
		//	value: []
		//},
		//zones: {
		//	value: {}
		//},
		//rules: {
		//	value: {}
//
//		},

		// Constants
		loadingSchemes: {
			value: {
				PRELOAD_ALL: 'preloadAll',
				LAZY_LOAD: 'lazyLoad',
				MANUAL_LOAD: 'manualLoad'
			}
		},
		zoneFiles: {
			value: ['africa', 'antarctica', 'asia', 'australasia', 'backward', 'etcetera', 'europe', 'northamerica', 'pacificnew', 'southamerica']
		},
		
		TZ_REGEXP: {
			value: new RegExp('^[a-zA-Z]+/')
		},
		
		regionMap: {
			value: {
				'Etc': 'etcetera',
				'EST': 'northamerica',
				'MST': 'northamerica',
				'HST': 'northamerica',
				'EST5EDT': 'northamerica',
				'CST6CDT': 'northamerica',
				'MST7MDT': 'northamerica',
				'PST8PDT': 'northamerica',
				'America': 'northamerica',
				'Pacific': 'australasia',
				'Atlantic': 'europe',
				'Africa': 'africa',
				'Indian': 'africa',
				'Antarctica': 'antarctica',
				'Asia': 'asia',
				'Australia': 'australasia',
				'Europe': 'europe',
				'WET': 'europe',
				'CET': 'europe',
				'MET': 'europe',
				'EET': 'europe'
			}
		},
		regionExceptions: {
			value: {
				'Pacific/Honolulu': 'northamerica',
				'Atlantic/Bermuda': 'northamerica',
				'Atlantic/Cape_Verde': 'africa',
				'Atlantic/St_Helena': 'africa',
				'Indian/Kerguelen': 'antarctica',
				'Indian/Chagos': 'asia',
				'Indian/Maldives': 'asia',
				'Indian/Christmas': 'australasia',
				'Indian/Cocos': 'australasia',
				'America/Danmarkshavn': 'europe',
				'America/Scoresbysund': 'europe',
				'America/Godthab': 'europe',
				'America/Thule': 'europe',
				'Asia/Yekaterinburg': 'europe',
				'Asia/Omsk': 'europe',
				'Asia/Novosibirsk': 'europe',
				'Asia/Krasnoyarsk': 'europe',
				'Asia/Irkutsk': 'europe',
				'Asia/Yakutsk': 'europe',
				'Asia/Vladivostok': 'europe',
				'Asia/Sakhalin': 'europe',
				'Asia/Magadan': 'europe',
				'Asia/Kamchatka': 'europe',
				'Asia/Anadyr': 'europe',
				'Africa/Ceuta': 'europe',
				'America/Argentina/Buenos_Aires': 'southamerica',
				'America/Argentina/Cordoba': 'southamerica',
				'America/Argentina/Tucuman': 'southamerica',
				'America/Argentina/La_Rioja': 'southamerica',
				'America/Argentina/San_Juan': 'southamerica',
				'America/Argentina/Jujuy': 'southamerica',
				'America/Argentina/Catamarca': 'southamerica',
				'America/Argentina/Mendoza': 'southamerica',
				'America/Argentina/Rio_Gallegos': 'southamerica',
				'America/Argentina/Ushuaia': 'southamerica',
				'America/Aruba': 'southamerica',
				'America/La_Paz': 'southamerica',
				'America/Noronha': 'southamerica',
				'America/Belem': 'southamerica',
				'America/Fortaleza': 'southamerica',
				'America/Recife': 'southamerica',
				'America/Araguaina': 'southamerica',
				'America/Maceio': 'southamerica',
				'America/Bahia': 'southamerica',
				'America/Sao_Paulo': 'southamerica',
				'America/Campo_Grande': 'southamerica',
				'America/Cuiaba': 'southamerica',
				'America/Porto_Velho': 'southamerica',
				'America/Boa_Vista': 'southamerica',
				'America/Manaus': 'southamerica',
				'America/Eirunepe': 'southamerica',
				'America/Rio_Branco': 'southamerica',
				'America/Santiago': 'southamerica',
				'Pacific/Easter': 'southamerica',
				'America/Bogota': 'southamerica',
				'America/Curacao': 'southamerica',
				'America/Guayaquil': 'southamerica',
				'Pacific/Galapagos': 'southamerica',
				'Atlantic/Stanley': 'southamerica',
				'America/Cayenne': 'southamerica',
				'America/Guyana': 'southamerica',
				'America/Asuncion': 'southamerica',
				'America/Lima': 'southamerica',
				'Atlantic/South_Georgia': 'southamerica',
				'America/Paramaribo': 'southamerica',
				'America/Port_of_Spain': 'southamerica',
				'America/Montevideo': 'southamerica',
				'America/Caracas': 'southamerica'
			}
		},

		// Functions (methods)
		init: {
			value: function(config) {
				var opts = {
					async: true
				},
				done = 0,
				callbackFn;

				this.config = config;

				//Override default with any passed-in opts
				Object.keys(config).forEach(function(k) {
					opts[k] = config[k];
				});

				this.zoneFileBasePath = opts.zoneFileBasePath;

				// Set up our instance variables.
				this.loadedZones = {};
				this.defaultZoneFiles = [];
				this.zones = {};
				this.rules = {};
				this.EXACT_DATE_TIME = {};

				// alert("Init:"+opts.loadingScheme);
				
				this.loadingScheme = opts.loadingScheme ? opts.loadingScheme : this.loadingSchemes.LAZY_LOAD;
				this.defaultZoneFiles = opts.defaultZoneFile ? opts.defaultZoneFile : 'northamerica';

				if (this.loadingScheme === this.loadingSchemes.PRELOAD_ALL) {
					this.defaultZoneFiles = this.zoneFiles;
				}

				if (typeof this.defaultZoneFiles === 'string') {
					this.defaultZoneFiles = [this.defaultZoneFiles];
				}

				if (this.loadingScheme === this.loadingSchemes.MANUAL_LOAD) {
					// We don't really support async now in terms of eventing, so just do sync for now.
					
					this.loadZoneJSONData(opts.zoneJSONPath, {
						sync: true
					});
					return this;
				}

				// Wraps callback function in another one that makes
				// sure all files have been loaded.
				callbackFn = opts.callback;
				opts.callback = function() {
					done++;
					if ((done === this.defaultZoneFiles.length) && typeof callbackFn === 'function') {
						callbackFn();
					}
				};
				for (var i = 0; i < this.defaultZoneFiles.length; i++) {
					this.loadZoneFile(this.defaultZoneFiles[i], opts);
				}
				return this;
			}
		},
		invalidTZError: {
			value: function(t,loc) {
				throw new Error('Timezone "' + t +
					'" is either incorrect, or not loaded in the timezone registry. At:'+loc);
			}
		},
		loadZoneJSONData: {
			value: function(url, opts) {
				var that = this;

				var processData = function(raw) {

					var data = JSON.parse(raw);
//alert("here:"+Object.keys(that.rules).length);
					for (var z in data.zones) {
						that.zones[z] = data.zones[z];
					}
					for (var r in data.rules) {
						that.rules[r] = data.rules[r];
					}
// alert("here:"+Object.keys(that.rules).length);
				};
				if (opts.sync) {
					var data = this.transport({
						url: url,
						async: false
					});
					processData(data);
				} else {
					this.transport({
						url: url,
						success: processData
					});
				}
			}
		},
		loadZoneDataFromObject: {
			value: function(data) {
				if (!data) {
					return;
				}
				for (var z in data.zones) {
					this.zones[z] = data.zones[z];
				}
				for (var r in data.rules) {
					this.rules[r] = data.rules[r];
				}
			}
		},
		getAllZones: {
			value: function() {
				var arr = [];
				for (var z in this.zones) {
					arr.push(z);
				}
				return arr.sort();
			}
		},
		parseZones: {
			value: function(str) {
				var lines = str.split('\n'),
					arr = [],
					chunk = '',
					l, zone = null,
					rule = null;
				for (var i = 0; i < lines.length; i++) {
					l = lines[i];
					if (l.match(/^\s/)) {
						l = "Zone " + zone + l;
					}
					l = l.split("#")[0];
					if (l.length > 3) {
						arr = l.split(/\s+/);
						chunk = arr.shift();
						//Ignore Leap.
						switch (chunk) {
							case 'Zone':
								zone = arr.shift();
								if (!this.zones[zone]) {
									this.zones[zone] = [];
								}
								if (arr.length < 3) break;
								//Process zone right here and replace 3rd element with the processed array.
								arr.splice(3, arr.length, this.processZone(arr));
								if (arr[3]) arr[3] = Date.UTC.apply(null, arr[3]);
								arr[0] = -this.getBasicOffset(arr[0]);
								this.zones[zone].push(arr);
								break;
							case 'Rule':
								rule = arr.shift();
								if (!this.rules[rule]) {
									this.rules[rule] = [];
								}
								//Parse int FROM year and TO year
								arr[0] = parseInt(arr[0], 10);
								arr[1] = parseInt(arr[1], 10) || arr[1];
								//Parse time string AT
								arr[5] = this.parseTimeString(arr[5]);
								//Parse offset SAVE
								arr[6] = this.getBasicOffset(arr[6]);
								this.rules[rule].push(arr);
								break;
							case 'Link':
								//No zones for these should already exist.
								if (this.zones[arr[1]]) {
									throw new Error('Error with Link ' + arr[1] + '. Cannot create link of a preexisted zone. ['+Object.keys(this.zones).length+']');
								}
								//Create the link.tra
								this.zones[arr[1]] = arr[0];
								break;
						}
					}
				}
				return true;
			}
		},
		monthNumber: {
			value: function(monthString) {
				return lodash.indexOf(LOCALSTRINGS.shortMonths, monthString);
			}
		},
		dayNumber: {
			value: function(dayString) {
				return lodash.indexOf(LOCALSTRINGS.shortDays, dayString);
			}
		},
		loadZoneFile: {
			value: function(fileName, opts) {
				//Get the zone files via XHR -- if the sync flag
				// is set to true, it's being called by the lazy-loading
				// mechanism, so the result needs to be returned inline.
				if (typeof this.zoneFileBasePath === 'undefined') {
					throw new Error('Please define a base path to your zone file directory -- timezoneJS.timezone.zoneFileBasePath.');
				}
				//Ignore already loaded zones.
				if (this.loadedZones[fileName]) {
					return;
				}

				var url = this.zoneFileBasePath + '/' + fileName;

				var async = false;
				if (opts && opts.async) {
					async = true;
				}
				var that = this;
				if (async) {
					this.transport({
						async: true,
						url: url,
						success: function(str) {

							if (that.parseZones(str) && typeof opts.callback === 'function') {
								that.loadedZones[fileName] = true;
								opts.callback();
							}
							return true;
						},
						error: function() {
							throw new Error('Error retrieving "' + url + '" zoneinfo files');
						}
					});
				} else {
					var rslt = this.transport({
						url: url,
						async: false
					});
					that.loadedZones[fileName] = true;
					this.parseZones(rslt);
				}
			}
		},
		getRegionForTimezone: {
			value: function(tz) {
				var exc = this.regionExceptions[tz],
					reg, ret;
				if (exc) return exc;
				reg = tz.split('/')[0];
				ret = this.regionMap[reg];
				// If there's nothing listed in the main regions for this TZ, check the 'backward' links
				if (ret) return ret;
				var link = this.zones[tz];
				if (typeof link === 'string') {
					return this.getRegionForTimezone(link);
				}
				// Backward-compat file hasn't loaded yet, try looking in there
				if (!this.loadedZones.backward) {
					// This is for obvious legacy zones (e.g., Iceland) that don't even have 
					// a prefix like "America/" that look like normal zones
					this.loadZoneFile('backward');
					return this.getRegionForTimezone(tz);
				}
				this.invalidTZError(tz, "getRegionForTimezone");
			}
		},
		parseTimeString: {
			value: function(str) {
				var pat = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
				var hms = str.match(pat);
				hms[1] = parseInt(hms[1], 10);
				hms[2] = hms[2] ? parseInt(hms[2], 10) : 0;
				hms[3] = hms[3] ? parseInt(hms[3], 10) : 0;

				return hms;
			}
		},
		processZone: {
			value: function(z) {
				if (!z[3]) {
					return;
				}
				var year = parseInt(z[3], 10);
				var month = 11;
				var day = 31;
				if (z[4]) {
					month = this.monthNumber(z[4].substr(0, 3));
					day = parseInt(z[5], 10) || 1;
				}
				var string = z[6] ? z[6] : '00:00:00',
					t = this.parseTimeString(string);
				return [year, month, day, t[1], t[2], t[3]];
			}
		},
		getZone: {
			value: function(dt, tz) {
				var utcMillis = typeof dt === 'number' ? dt : new Date(dt).getTime();
				var t = tz;
				var zoneList = this.zones[t];

				// Follow links to get to an actual zone
				while (typeof zoneList === "string") {
					t = zoneList;
					zoneList = this.zones[t];
				}

				if (!zoneList) {

					// Backward-compat file hasn't loaded yet, try looking in there
					if (!this.loadedZones.backward) {

						//This is for backward entries like "America/Fort_Wayne" that
						// getRegionForTimezone *thinks* it has a region file and zone
						// for (e.g., America => 'northamerica'), but in reality it's a
						// legacy zone we need the backward file for.
						this.loadZoneFile('backward');
						return this.getZone(dt, tz);
					}
					this.invalidTZError(t, "getZone");
				}

				if (zoneList.length === 0) {
					throw new Error('No Zone found for "' + tz + '" on ' + dt);
				}
				//Do backwards lookup since most use cases deal with newer dates.

				for (var i = zoneList.length - 1; i >= 0; i--) {
					var z = zoneList[i];
					if (z[3] && utcMillis > z[3]) break;
				}

				return zoneList[i + 1];
			}
		},
		getBasicOffset: {
			value: function(time) {
				var off = this.parseTimeString(time),
					adj = time.charAt(0) === '-' ? -1 : 1;
				off = adj * (((off[1] * 60 + off[2]) * 60 + off[3]) * 1000);
				return off / 60 / 1000;
			}
		},

		//if isUTC is true, date is given in UTC, otherwise it's given
		// in local time (ie. date.getUTC*() returns local time components)
		getRule: {
			value: function(dt, zone, isUTC) {
				var that = this;
				var date = typeof dt === 'number' ? new Date(dt) : dt;
				var ruleset = zone[1];
				var basicOffset = zone[0];


				// If the zone has a DST rule like '1:00', create a rule and return it
				// instead of looking it up in the parsed rules
				var staticDstMatch = ruleset.match(/^([0-9]):([0-9][0-9])$/);
				if (staticDstMatch) {
					return [-1000000, 'max', '-', 'Jan', 1, this.parseTimeString('0:00'), parseInt(staticDstMatch[1], 10) * 60 + parseInt(staticDstMatch[2], 10), '-'];
				}

				//Convert a date to UTC. Depending on the 'type' parameter, the date
				// parameter may be:
				//
				// - `u`, `g`, `z`: already UTC (no adjustment).
				//
				// - `s`: standard time (adjust for time zone offset but not for DST)
				//
				// - `w`: wall clock time (adjust for both time zone and DST offset).
				//
				// DST adjustment is done using the rule given as third argument.
				var convertDateToUTC = function(date, type, rule) {
					var offset = 0;

					if (type === 'u' || type === 'g' || type === 'z') { // UTC
						offset = 0;
					} else if (type === 's') { // Standard Time
						offset = basicOffset;
					} else if (type === 'w' || !type) { // Wall Clock Time
						offset = that.getAdjustedOffset(basicOffset, rule);
					} else {
						throw ("unknown type " + type);
					}
					offset *= 60 * 1000; // to millis

					return new Date(date.getTime() + offset);
				};

				//Step 1:  Find applicable rules for this year.
				//
				//Step 2:  Sort the rules by effective date.
				//
				//Step 3:  Check requested date to see if a rule has yet taken effect this year.  If not,
				//
				//Step 4:  Get the rules for the previous year.  If there isn't an applicable rule for last year, then
				// there probably is no current time offset since they seem to explicitly turn off the offset
				// when someone stops observing DST.
				//
				// FIXME if this is not the case and we'll walk all the way back (ugh).
				//
				//Step 5:  Sort the rules by effective date.
				//Step 6:  Apply the most recent rule before the current time.
				var convertRuleToExactDateAndTime = function(yearAndRule, prevRule) {
					var year = yearAndRule[0],
						rule = yearAndRule[1];
					// Assume that the rule applies to the year of the given date.

					var hms = rule[5],
						effectiveDate;

					if (!that.EXACT_DATE_TIME[year]) {
						that.EXACT_DATE_TIME[year] = {};
					}


					// Result for given parameters is already stored
					if (that.EXACT_DATE_TIME[year][rule]) {
						effectiveDate = that.EXACT_DATE_TIME[year][rule];
					} else {

						//If we have a specific date, use that!
						if (!isNaN(rule[4])) {

							effectiveDate = new Date(Date.UTC(year, that.monthNumber(rule[3]), rule[4], hms[1], hms[2], hms[3], 0));
						} else {
							//Let's hunt for the date.
							var targetDay, operator;

							//Example: `lastThu`
							if (rule[4].substr(0, 4) === "last") {
								// Start at the last day of the month and work backward.
								effectiveDate = new Date(Date.UTC(year, that.monthNumber(rule[3]) + 1, 1, hms[1] - 24, hms[2], hms[3], 0));
								targetDay = this.getDayNumber(rule[4].substr(4, 3));
								operator = "<=";
							} else {
								//Example: `Sun>=15`
								//Start at the specified date.

								effectiveDate = new Date(Date.UTC(year, that.monthNumber(rule[3]), rule[4].substr(5), hms[1], hms[2], hms[3], 0));

								targetDay = that.dayNumber(rule[4].substr(0, 3));
								operator = rule[4].substr(3, 2);
							}
							var ourDay = effectiveDate.getUTCDay();
							//Go forwards.
							if (operator === ">=") {
								effectiveDate.setUTCDate(effectiveDate.getUTCDate() + (targetDay - ourDay + ((targetDay < ourDay) ? 7 : 0)));
							} else {
								//Go backwards.  Looking for the last of a certain day, or operator is "<=" (less likely).
								effectiveDate.setUTCDate(effectiveDate.getUTCDate() + (targetDay - ourDay - ((targetDay > ourDay) ? 7 : 0)));
							}
						}
						that.EXACT_DATE_TIME[year][rule] = effectiveDate;
					}


					//If previous rule is given, correct for the fact that the starting time of the current
					// rule may be specified in local time.
					if (prevRule) {
						effectiveDate = convertDateToUTC(effectiveDate, hms[4], prevRule);
					}
					return effectiveDate;
				};

				var findApplicableRules = function(year, ruleset) {
					var applicableRules = [];
					for (var i = 0; ruleset && i < ruleset.length; i++) {
						//Exclude future rules.
						if (ruleset[i][0] <= year && (
						// Date is in a set range.
						ruleset[i][1] >= year ||
						// Date is in an "only" year.
						(ruleset[i][0] === year && ruleset[i][1] === "only") ||
						//We're in a range from the start year to infinity.
						ruleset[i][1] === "max")) {
							//It's completely okay to have any number of matches here.
							// Normally we should only see two, but that doesn't preclude other numbers of matches.
							// These matches are applicable to this year.
							applicableRules.push([year, ruleset[i]]);
						}
					}
					return applicableRules;
				};

				var compareDates = function(a, b, prev) {
					var year, rule;

					if (a instanceof Array) {

						year = a[0];
						rule = a[1];
						if (prev && that.EXACT_DATE_TIME[year] && that.EXACT_DATE_TIME[year][rule]) {

							a = that.EXACT_DATE_TIME[year][rule];
						} else {
							a = convertRuleToExactDateAndTime(a, prev);
						}
						// a = (!prev && that.EXACT_DATE_TIME[year] && that.EXACT_DATE_TIME[year][rule]) ? that.EXACT_DATE_TIME[year][rule] : convertRuleToExactDateAndTime(a, prev);
					} else if (prev) {

						a = convertDateToUTC(a, isUTC ? 'u' : 'w', prev);
					}

					if (b instanceof Array) {
						year = b[0];
						rule = b[1];
						b = (!prev && that.EXACT_DATE_TIME[year] && that.EXACT_DATE_TIME[year][rule]) ? that.EXACT_DATE_TIME[year][rule] : convertRuleToExactDateAndTime(b, prev);
					} else if (prev) {
						b = convertDateToUTC(b, isUTC ? 'u' : 'w', prev);
					}
					a = Number(a);
					b = Number(b);
					return a - b;
				};

				var year = date.getUTCFullYear();
				var applicableRules;
				applicableRules = findApplicableRules(year, this.rules[ruleset]);

				applicableRules.push(date);
				//While sorting, the time zone in which the rule starting time is specified
				// is ignored. This is ok as long as the timespan between two DST changes is
				// larger than the DST offset, which is probably always true.
				// As the given date may indeed be close to a DST change, it may get sorted
				// to a wrong position (off by one), which is corrected below.

				applicableRules.sort(compareDates);

				//If there are not enough past DST rules...
				if (lodash.indexOf(applicableRules, date) < 2) {
					applicableRules = applicableRules.concat(findApplicableRules(year - 1, this.rules[ruleset]));
					applicableRules.sort(compareDates);
				}
				var pinpoint = lodash.indexOf(applicableRules, date);
				if (pinpoint > 1 && compareDates(date, applicableRules[pinpoint - 1], applicableRules[pinpoint - 2][1]) < 0) {
					//The previous rule does not really apply, take the one before that.
					return applicableRules[pinpoint - 2][1];
				} else if (pinpoint > 0 && pinpoint < applicableRules.length - 1 && compareDates(date, applicableRules[pinpoint + 1], applicableRules[pinpoint - 1][1]) > 0) {

					//The next rule does already apply, take that one.
					return applicableRules[pinpoint + 1][1];
				} else if (pinpoint === 0) {
					//No applicable rule found in this and in previous year.
					return null;
				}
				return applicableRules[pinpoint - 1][1];
			}
		},
		getAdjustedOffset: {
			value: function(off, rule) {
				return -Math.ceil(rule[6] - off);
			}
		},
		getAbbreviation: {
			value: function(zone, rule) {
				var res;
				var base = zone[2];
				if (base.indexOf('%s') > -1) {
					var repl;
					if (rule) {
						repl = rule[7] === '-' ? '' : rule[7];
					}
					//FIXME: Right now just falling back to Standard --
					// apparently ought to use the last valid rule,
					// although in practice that always ought to be Standard
					else {
						repl = 'S';
					}
					res = base.replace('%s', repl);
				} else if (base.indexOf('/') > -1) {
					//Chose one of two alternative strings.
					res = base.split("/", 2)[rule[6] ? 1 : 0];
				} else {
					res = base;
				}
				return res;
			}
		},
		getTzInfo: {
			value: function(dt, tz, isUTC) {
				//Lazy-load any zones not yet loaded.
				// alert("getting tz info..."+this.loadingScheme);

				if (this.loadingScheme === this.loadingSchemes.LAZY_LOAD) {
					//Get the correct region for the zone.
					var zoneFile = this.getRegionForTimezone(tz);
					if (!zoneFile) {
						throw new Error('Not a valid timezone ID.');
					}
					if (!this.loadedZones[zoneFile]) {
						//Get the file and parse it -- use synchronous XHR.
						this.loadZoneFile(zoneFile);
					}
				}

				var z = this.getZone(dt, tz);

				var off = z[0];
				//See if the offset needs adjustment.

				var rule = this.getRule(dt, z, isUTC);


				if (rule) {
					off = this.getAdjustedOffset(off, rule);
				}
				var abbr = this.getAbbreviation(z, rule);



				return {
					tzOffset: off,
					tzAbbr: abbr
				};
			}
		},
		transport: {
			value: function(opts) {
				var cfg;
				if (opts.async) {
					cfg = {
						url: opts.url,
						type: 'GET',
						processData: false,
						success: function(rsp) {
							opts.success(rsp);
						},
						error: function() {
							opts.error();
						}
					};
					jquery.ajax(cfg);
				} else {

					cfg = {
						method: 'GET',
						url: opts.url,
						async: false
					};
					var rsp = jquery.ajax(cfg);
					return rsp.responseText;
				}
			}
		}
	});

	return Timezone;

});
