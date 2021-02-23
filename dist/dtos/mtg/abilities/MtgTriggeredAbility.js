"use strict";
exports.__esModule = true;
exports.MtgTriggeredAbility = void 0;
var MtgAbilityType_1 = require("../MtgAbilityType");
var StringHelper_1 = require("../../../helpers/StringHelper");
var Random_1 = require("../../../helpers/Random");
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../LogType");
var MtgTriggeredAbility = (function () {
    function MtgTriggeredAbility(condition, event) {
        this.type = MtgAbilityType_1.MtgAbilityType.Triggered;
        this.parserValue = 0;
        if (event === undefined || condition === undefined)
            throw "event or cost is undefined for MtgPermanentActivatedCost";
        this.condition = condition;
        this.event = event;
    }
    MtgTriggeredAbility.prototype.getColorIdentity = function () {
        return this.event.colorIdentity;
    };
    MtgTriggeredAbility.prototype.getText = function () {
        return StringHelper_1.StringHelper.capitalizeFirstChar(this.condition.text) + ", " + this.event.text;
    };
    MtgTriggeredAbility.prototype.getScore = function () {
        var scoreWeight = Random_1.Random.next(80, 100) / 100;
        var eventScore = this.event.score * scoreWeight;
        var parsedScore = this.parserValue / 2;
        var finalScore = eventScore + parsedScore;
        Logger_1.Logger.log("Ability '" + this.getText().substr(0, 10) + "..':", LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log(" - event score: " + eventScore, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log(" - parsed score: " + parsedScore, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log(" - final score: " + finalScore, LogType_1.LogType.CostEstimation);
        return finalScore;
    };
    MtgTriggeredAbility.prototype.getContext = function () {
        return this.condition.context;
    };
    return MtgTriggeredAbility;
}());
exports.MtgTriggeredAbility = MtgTriggeredAbility;
//# sourceMappingURL=MtgTriggeredAbility.js.map