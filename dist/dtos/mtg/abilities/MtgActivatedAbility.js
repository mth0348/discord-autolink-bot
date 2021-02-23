"use strict";
exports.__esModule = true;
exports.MtgActivatedAbility = void 0;
var MtgAbilityType_1 = require("../MtgAbilityType");
var StringHelper_1 = require("../../../helpers/StringHelper");
var Random_1 = require("../../../helpers/Random");
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../LogType");
var MtgActivatedAbility = (function () {
    function MtgActivatedAbility(cost, event) {
        this.type = MtgAbilityType_1.MtgAbilityType.Activated;
        this.parserValue = 0;
        if (event === undefined || cost === undefined)
            throw "event or cost is undefined for MtgPermanentActivatedCost";
        this.cost = cost;
        this.event = event;
    }
    MtgActivatedAbility.prototype.getColorIdentity = function () {
        return this.cost.colorIdentity + this.event.colorIdentity;
    };
    MtgActivatedAbility.prototype.getText = function () {
        return StringHelper_1.StringHelper.capitalizeFirstChar(this.cost.text) + ": " + StringHelper_1.StringHelper.capitalizeFirstChar(this.event.text);
    };
    MtgActivatedAbility.prototype.getScore = function () {
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
    MtgActivatedAbility.prototype.getContext = function () {
        return "";
    };
    return MtgActivatedAbility;
}());
exports.MtgActivatedAbility = MtgActivatedAbility;
//# sourceMappingURL=MtgActivatedAbility.js.map