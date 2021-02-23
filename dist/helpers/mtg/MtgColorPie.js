"use strict";
exports.__esModule = true;
exports.MtgColorPie = void 0;
var discord_js_1 = require("discord.js");
var MtgColorPie = (function () {
    function MtgColorPie() {
    }
    MtgColorPie.sortWubrg = function (text) {
        var _this = this;
        return text.split('').sort(function (a, b) { return _this.wubrgLUT.get(a) - _this.wubrgLUT.get(b); }).join("");
    };
    MtgColorPie.wubrgLUT = new discord_js_1.Collection([
        ["0", 0],
        ["1", 1],
        ["2", 2],
        ["3", 3],
        ["4", 4],
        ["5", 5],
        ["6", 6],
        ["7", 7],
        ["8", 8],
        ["9", 9],
        ["w", 0],
        ["u", 1],
        ["b", 2],
        ["r", 3],
        ["g", 4],
    ]);
    return MtgColorPie;
}());
exports.MtgColorPie = MtgColorPie;
//# sourceMappingURL=MtgColorPie.js.map