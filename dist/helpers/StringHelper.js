"use strict";
exports.__esModule = true;
exports.StringHelper = void 0;
var StringHelper = (function () {
    function StringHelper() {
    }
    StringHelper.toCamelCase = function (input) {
        var _this = this;
        var words = input.split(" ");
        words.forEach(function (w, i) {
            if (_this.ignores.indexOf(w) === -1) {
                words[i] = _this.capitalizeFirstChar(w);
            }
        });
        return words.join(" ");
    };
    StringHelper.startsWith = function (text, find) {
        return text.indexOf(find) === 0;
    };
    StringHelper.isEqualIgnoreCase = function (s1, s2) {
        return s1.toLowerCase() === s2.toLowerCase();
    };
    StringHelper.regexIndexOf = function (text, regex, startpos) {
        if (startpos === void 0) { startpos = 0; }
        var indexOf = text.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    };
    StringHelper.removeDuplicateChars = function (text) {
        return text.replace(/(.)(?=.*\1)/g, "");
    };
    StringHelper.capitalizeFirstChar = function (word) {
        return word.substr(0, 1).toUpperCase() + word.substr(1);
    };
    StringHelper.lowercaseFirstChar = function (word) {
        return word.substr(0, 1).toLowerCase() + word.substr(1);
    };
    StringHelper.ignores = "the";
    return StringHelper;
}());
exports.StringHelper = StringHelper;
//# sourceMappingURL=StringHelper.js.map