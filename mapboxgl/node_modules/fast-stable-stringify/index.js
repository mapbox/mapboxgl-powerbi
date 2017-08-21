var toString = {}.toString,
	isArray = Array.isArray || function(obj){
		return toString.call(obj) === "[object Array]";
	},
	objKeys = Object.keys || function(obj) {
			var keys = [];
			for (var name in obj) {
				if (obj.hasOwnProperty(name)) {
					keys.push(name);
				}
			}
			return keys;
		},
	strReg = /[\u0000-\u001f"\\]/g,
	strReplace = function(str) {
		var code = str.charCodeAt(0);
		switch (code) {
			case 34: return '\\"';
			case 92: return '\\\\';
			case 12: return "\\f";
			case 10: return "\\n";
			case 13: return "\\r";
			case 9: return "\\t";
			case 8: return "\\b";
			default:
				if (code > 15) {
					return "\\u00" + code.toString(16);
				} else {
					return "\\u000" + code.toString(16);
				}
		}
	};

/**
 * Simple stable stringify. Object keys sorted. No options, no spaces.
 * @param {*} val
 * @returns {string}
 */
module.exports = function simpleStableStringify(val) {
	if (val !== undefined) {
		return ''+ sss(val);
	}
};

module.exports.stringSearch = strReg;
module.exports.stringReplace = strReplace;

function sss(val) {
	var i, max, str, keys, key, pass;
	switch (typeof val) {
		case "object":
			if (val === null) {
				return null;
			} else if (isArray(val)) {
				str = '[';
				max = val.length - 1;
				for (i = 0; i < max; i++) {
					str += sss(val[i]) + ',';
				}
				if (max > -1) {
					str += sss(val[i]);
				}
				return str + ']';
			} else {
				// only object is left
				keys = objKeys(val).sort();
				max = keys.length;
				str = "{";
				key = keys[i = 0];
				pass = max > 0 && val[key] !== undefined;
				while (i < max) {
					if (pass) {
						str += '"' + key.replace(strReg, strReplace) + '":' + sss(val[key]);
						key = keys[++i];
						pass = i < max && val[key] !== undefined;
						if (pass) {
							str += ',';
						}
					} else {
						key = keys[++i];
						pass = i < max && val[key] !== undefined;
					}
				}
				return str + '}';
			}
		case "undefined":
			return null;
		case "string":
			return '"' + val.replace(strReg, strReplace) + '"';
		default:
			return val;
	}
}
