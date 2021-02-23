"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.MtgInstantSorceryGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgHelper_1 = require("../../../helpers/mtg/MtgHelper");
var MtgBaseGenerator_1 = require("./MtgBaseGenerator");
var MtgInstantSorceryGenerator = (function (_super) {
    __extends(MtgInstantSorceryGenerator, _super);
    function MtgInstantSorceryGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        return _super.call(this, mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) || this;
    }
    MtgInstantSorceryGenerator.prototype.generate = function (card) {
        card.subtype = Random_1.Random.chance(0.05) ? "Arcane" : undefined;
        card.name = card.name || this.mtgDataRepository.getInstantSorceryName();
        this.chooseAbilities(card);
        this.chooseArtwork(card, "spell");
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper_1.MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper_1.MtgHelper.getManacost(card.cmc, card.color);
        return card;
    };
    MtgInstantSorceryGenerator.prototype.chooseAbilities = function (card) {
        var abilityCount = Random_1.Random.complex([
            { value: 1, chance: 0.50 + (card.rarityScore <= 2 ? +0.3 : 0.0) },
            { value: 2, chance: 0.20 + (card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.5 : 0.0) },
            { value: 3, chance: 0.10 + (card.rarityScore <= 1 ? -1.0 : card.rarityScore >= 4 ? 0.2 : 0.0) }
        ], 1);
        for (var i = 0; i < abilityCount; i++) {
            var minScore = i === 0 ? 0 : -99;
            this.mtgAbilityService.generateSpellAbility(card, minScore);
        }
        if (abilityCount === 3 || (abilityCount === 2 && Random_1.Random.chance(0.25))) {
            var a1 = card.oracle.abilities[0];
            var a2 = card.oracle.abilities[1];
            if (!a1.event.noFollowUp) {
                a1.combine(a2);
                card.oracle.abilities = __spreadArrays([a1], card.oracle.abilities.slice(2));
            }
        }
    };
    MtgInstantSorceryGenerator.prototype.chooseFlavorText = function (card) {
        if (Random_1.Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            var maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            var smallEnoughFlavorText = this.mtgDataRepository.getSpellFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                var flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine);
                flavorTextLines.forEach(function (f) { return card.wrappedOracleLines.push("FT_" + f); });
            }
        }
    };
    return MtgInstantSorceryGenerator;
}(MtgBaseGenerator_1.MtgBaseGenerator));
exports.MtgInstantSorceryGenerator = MtgInstantSorceryGenerator;
//# sourceMappingURL=MtgInstantSorceryGenerator.js.map