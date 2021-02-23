"use strict";
exports.__esModule = true;
exports.MtgAuraAbility = void 0;
var MtgAbilityType_1 = require("../MtgAbilityType");
var StringHelper_1 = require("../../../helpers/StringHelper");
var Random_1 = require("../../../helpers/Random");
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../LogType");
var MtgAuraAbility = (function () {
    function MtgAuraAbility(effect) {
        this.type = MtgAbilityType_1.MtgAbilityType.Static;
        this.parserValue = 0;
        if (effect === undefined)
            throw "effect is undefined for MtgAuraAbility";
        this.effect = effect;
    }
    MtgAuraAbility.prototype.getColorIdentity = function () {
        return this.effect.colorIdentity;
    };
    MtgAuraAbility.prototype.getText = function () {
        return StringHelper_1.StringHelper.capitalizeFirstChar(this.effect.text);
    };
    MtgAuraAbility.prototype.getScore = function () {
        var scoreWeight = Random_1.Random.next(80, 100) / 100;
        var effectScore = this.effect.score * scoreWeight;
        var parsedScore = this.parserValue / 2.5;
        var finalScore = effectScore + parsedScore;
        Logger_1.Logger.log("Ability '" + this.getText().substr(0, 10) + "..':", LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log(" - effect score: " + effectScore, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log(" - parsed score: " + parsedScore, LogType_1.LogType.CostEstimation);
        Logger_1.Logger.log(" - final score: " + finalScore, LogType_1.LogType.CostEstimation);
        return finalScore;
    };
    MtgAuraAbility.prototype.combine = function (other) {
        this.effect.text += " and " + other.effect.text;
        this.effect.score += other.effect.score;
        this.effect.colorIdentity += other.effect.colorIdentity;
    };
    MtgAuraAbility.prototype.getContext = function () {
        return "";
    };
    return MtgAuraAbility;
}());
exports.MtgAuraAbility = MtgAuraAbility;
//# sourceMappingURL=MtgAuraAbility.js.map