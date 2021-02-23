"use strict";
exports.__esModule = true;
exports.MtgKeyword = void 0;
var Logger_1 = require("../../../helpers/Logger");
var LogType_1 = require("../../../dtos/LogType");
var MtgKeyword = (function () {
    function MtgKeyword(data) {
        this.parserValue = 0;
        this.name = data.name;
        this.hasCost = data.hasCost;
        this.isTop = data.isTop;
        this.score = data.score;
        this.nameExtension = data.nameExtension;
        this.colorIdentity = data.colorIdentity;
        this.types = data.types;
        this.excludeFromSimple = data.excludeFromSimple;
    }
    MtgKeyword.prototype.getScore = function () {
        Logger_1.Logger.log("Keyword '" + this.name + "': " + this.score, LogType_1.LogType.CostEstimation);
        return this.score;
    };
    MtgKeyword.prototype.getText = function (card) {
        var costText = "(cost[s:" + this.score + ",c:" + card.color + "])";
        if (this.nameExtension.length > 0 && this.hasCost)
            return this.name + " " + this.nameExtension + " - " + costText;
        if (this.nameExtension.length)
            return this.name + " " + this.nameExtension;
        if (this.hasCost)
            return this.name + " " + costText;
        return this.name;
    };
    MtgKeyword.prototype.getContext = function () { return ""; };
    return MtgKeyword;
}());
exports.MtgKeyword = MtgKeyword;
//# sourceMappingURL=MtgKeyword.js.map