"use strict";
exports.__esModule = true;
exports.MtgSpellAbility = void 0;
var MtgAbilityType_1 = require("../MtgAbilityType");
var StringHelper_1 = require("../../../helpers/StringHelper");
var Random_1 = require("../../../helpers/Random");
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../LogType");
var MtgSpellAbility = (function () {
    function MtgSpellAbility(event) {
        this.type = MtgAbilityType_1.MtgAbilityType.Static;
        this.parserValue = 0;
        if (event === undefined)
            throw "event is undefined for MtgPermanentActivatedCost";
        this.event = event;
    }
    MtgSpellAbility.prototype.getColorIdentity = function () {
        return this.event.colorIdentity;
    };
    MtgSpellAbility.prototype.getText = function () {
        return StringHelper_1.StringHelper.capitalizeFirstChar(this.event.text);
    };
    MtgSpellAbility.prototype.getScore = function () {
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
    MtgSpellAbility.prototype.combine = function (other) {
        this.event.text += ", then " + other.event.text;
        this.event.score += other.event.score;
        this.event.colorIdentity += other.event.colorIdentity;
    };
    MtgSpellAbility.prototype.getContext = function () {
        return "";
    };
    return MtgSpellAbility;
}());
exports.MtgSpellAbility = MtgSpellAbility;
//# sourceMappingURL=MtgSpellAbility.js.map