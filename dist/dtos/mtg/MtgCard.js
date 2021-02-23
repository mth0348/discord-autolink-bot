"use strict";
exports.__esModule = true;
exports.MtgCard = void 0;
var MtgCardType_1 = require("./MtgCardType");
var MtgOracleText_1 = require("./MtgOracleText");
var MtgCard = (function () {
    function MtgCard() {
        this.oracle = new MtgOracleText_1.MtgOracleText();
    }
    MtgCard.prototype.getFullType = function () {
        var supertypeText = this.supertype ? this.supertype + " " : "";
        var typeText = this.type;
        var subtypeText = (this.subtype ? (" — " + this.subtype) : "");
        return supertypeText + typeText + subtypeText;
    };
    MtgCard.prototype.hasPowerToughness = function () {
        return this.type === MtgCardType_1.MtgCardType.Creature || this.type === MtgCardType_1.MtgCardType.Artifactcreature;
    };
    MtgCard.prototype.toLogString = function () {
        var _this = this;
        var result = [];
        result.push("MtgCard: { name: " + this.name + ", type: " + this.supertype + " " + this.type + " - " + this.subtype + ", cost: " + this.manacost + " (" + this.cmc + "), rarity: " + this.rarity + ", P/T: " + this.power + "/" + this.toughness + ", image: " + this.imageUrl + " }");
        result.push("\t- keywords (" + this.oracle.keywords.length + "): " + this.oracle.keywords.map(function (k) { return k.getText(_this); }).join(", "));
        result.push("\t- abilities (" + this.oracle.abilities.length + "):");
        this.oracle.abilities.forEach(function (a) {
            result.push("\t-- " + a.getText());
        });
        return result;
    };
    return MtgCard;
}());
exports.MtgCard = MtgCard;
//# sourceMappingURL=MtgCard.js.map