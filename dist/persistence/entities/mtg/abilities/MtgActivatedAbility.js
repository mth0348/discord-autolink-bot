"use strict";
exports.__esModule = true;
exports.MtgActivatedAbility = void 0;
var MtgAbilityType_1 = require("../../../../dtos/mtg/MtgAbilityType");
var MtgActivatedAbility = (function () {
    function MtgActivatedAbility(cost, event) {
        this.type = MtgAbilityType_1.MtgAbilityType.Activated;
        this.cost = cost;
        this.event = event;
    }
    return MtgActivatedAbility;
}());
exports.MtgActivatedAbility = MtgActivatedAbility;
//# sourceMappingURL=MtgActivatedAbility.js.map