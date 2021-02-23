"use strict";
exports.__esModule = true;
exports.MtgEnchantmentEffect = void 0;
var MtgEnchantmentEffect = (function () {
    function MtgEnchantmentEffect(data) {
        this.text = data.text;
        this.colorIdentity = data.colorIdentity;
        this.score = data.score;
        this.auraType = data.auraType;
        this.onlyOnce = data.onlyOnce;
        this.isForOpponent = data.isForOpponent;
    }
    return MtgEnchantmentEffect;
}());
exports.MtgEnchantmentEffect = MtgEnchantmentEffect;
//# sourceMappingURL=MtgEnchantmentEffect.js.map