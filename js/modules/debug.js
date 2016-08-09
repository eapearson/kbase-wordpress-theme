define(["lodash"], function(LD) {
	var debug = Object.create({});
	debug.objDump =  function objDump(o) {
		if (o === null) {
			return "[NULL]";
		} else if (o === undefined) {
			return "[UNDEFINED]";
		} else if (typeof o === "object") {
			var type;
			if (Array.isArray(o)) {
				type = "ARRAY";
			} else {
				type = "OBJECT";
			}
			// var s = Object.keys(o).join(",");
			var s = LD.map(Object.keys(o), function(key) {
				return "("+key+":"+objDump(o[key])+")";
			});

			return "["+type+"]("+s+")";
		} else {
			return o;
		}
	}
	
	return debug;
})