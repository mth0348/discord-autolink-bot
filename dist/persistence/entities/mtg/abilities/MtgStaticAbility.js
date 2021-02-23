"use strict";
exports.__esModule = true;
exports.MtgStaticAbility = void 0;
var MtgAbilityType_1 = require("../../../../dtos/mtg/MtgAbilityType");
var MtgStaticAbility = (function () {
    function MtgStaticAbility(event) {
        this.type = MtgAbilityType_1.MtgAbilityType.Static;
        this.event = event;
    }
    return MtgStaticAbility;
}());
exports.MtgStaticAbility = MtgStaticAbility;
//# sourceMappingURL=MtgStaticAbility.js.map