"use strict";
exports.__esModule = true;
exports.MtgCardParams = void 0;
var MtgCardType_1 = require("./MtgCardType");
var MtgCardParams = (function () {
    function MtgCardParams() {
    }
    MtgCardParams.prototype.getFullType = function () {
        return (this.supertype ? this.supertype + " " : "") + this.type + " — " + this.subtype;
    };
    MtgCardParams.prototype.hasPowerToughness = function () {
        return this.type === MtgCardType_1.MtgCardType.Creature;
    };
    return MtgCardParams;
}());
exports.MtgCardParams = MtgCardParams;
//# sourceMappingURL=MtgCard.js.map