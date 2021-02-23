"use strict";
exports.__esModule = true;
exports.MtgTriggeredAbility = void 0;
var MtgAbilityType_1 = require("../../../../dtos/mtg/MtgAbilityType");
var MtgTriggeredAbility = (function () {
    function MtgTriggeredAbility(condition, event) {
        this.type = MtgAbilityType_1.MtgAbilityType.Triggered;
        this.condition = condition;
        this.event = event;
    }
    return MtgTriggeredAbility;
}());
exports.MtgTriggeredAbility = MtgTriggeredAbility;
//# sourceMappingURL=MtgTriggeredAbility.js.map