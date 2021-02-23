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
exports.__esModule = true;
exports.MtgLandGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgBaseGenerator_1 = require("./MtgBaseGenerator");
var MtgAbilityType_1 = require("../../../dtos/mtg/MtgAbilityType");
var MtgCardRarity_1 = require("../../../dtos/mtg/MtgCardRarity");
var MtgLandGenerator = (function (_super) {
    __extends(MtgLandGenerator, _super);
    function MtgLandGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        return _super.call(this, mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) || this;
    }
    MtgLandGenerator.prototype.generate = function (card) {
        card.isLegendary = card.isLegendary || Random_1.Random.chance(0.25) && (card.rarity === MtgCardRarity_1.MtgCardRarity.Rare || card.rarity === MtgCardRarity_1.MtgCardRarity.Mythic);
        card.supertype = card.isLegendary ? "Legendary" : "";
        card.name = card.name || this.mtgDataRepository.getLandName(card.isLegendary);
        this.chooseAbilities(card);
        this.chooseArtwork(card, "land");
        this.resolveSyntax(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.manacost = "";
        card.cmc = 0;
        return card;
    };
    MtgLandGenerator.prototype.chooseAbilities = function (card) {
        var entersTapped = Random_1.Random.chance(0.5);
        var hasManaAbility = Random_1.Random.chance(0.7);
        var abilityCount = 0;
        if (card.rarity === MtgCardRarity_1.MtgCardRarity.Common || card.rarity === MtgCardRarity_1.MtgCardRarity.Uncommon) {
            abilityCount = Random_1.Random.complex([
                { value: 0, chance: 0.70 },
                { value: 1, chance: 0.30 },
            ], 0);
        }
        if (card.rarity === MtgCardRarity_1.MtgCardRarity.Rare || card.rarity === MtgCardRarity_1.MtgCardRarity.Mythic) {
            abilityCount = Random_1.Random.complex([
                { value: 1, chance: 0.50 },
                { value: 2, chance: 0.50 + ((entersTapped || hasManaAbility) ? -1.0 : 0.0) }
            ], 1);
        }
        var abilityTypes = [];
        for (var i = 0; i < abilityCount; i++) {
            var abilityType = Random_1.Random.complex([
                { value: MtgAbilityType_1.MtgAbilityType.Activated, chance: 0.40 },
                { value: MtgAbilityType_1.MtgAbilityType.Triggered, chance: 0.40 },
                { value: MtgAbilityType_1.MtgAbilityType.Static, chance: 0.20 }
            ], MtgAbilityType_1.MtgAbilityType.Activated);
            abilityTypes.push(abilityType);
        }
        if (entersTapped) {
            this.mtgAbilityService.generateLandEtbAbility(card);
        }
        if (hasManaAbility || abilityCount === 0) {
            var colorsAllowed = entersTapped ? 5 : Random_1.Random.next(0, 1);
            this.mtgAbilityService.generateManaAbility(card, colorsAllowed);
            var colorSymbolRegex = /Xw|Xu|Xb|Xr|Xg|Xc/gi;
            var manaAbility = card.oracle.abilities[card.oracle.abilities.length - 1];
            var eventsSymbols = manaAbility.event.text.match(colorSymbolRegex);
            card.color = eventsSymbols.join("").replace(/[X,\s]/gi, "");
        }
        else {
            card.color = "c";
        }
        for (var i = 0; i < abilityCount; i++) {
            this.generateAbility(card, abilityTypes[i]);
        }
    };
    MtgLandGenerator.prototype.generateAbility = function (card, abilityType) {
        var scoreSoFar = card.oracle.abilities.length > 0 ? card.oracle.abilities.reduce(function (a, b) { return a += b.getScore(); }, 0) : 0;
        var minScore = scoreSoFar <= 0 ? scoreSoFar : -99;
        var maxScore = Math.min(2, Math.max(1, 1 - scoreSoFar));
        switch (abilityType) {
            case MtgAbilityType_1.MtgAbilityType.Activated:
                this.mtgAbilityService.generateActivatedAbility(card, minScore, maxScore);
                break;
            case MtgAbilityType_1.MtgAbilityType.Triggered:
                this.mtgAbilityService.generateTriggeredAbility(card, minScore, maxScore);
                break;
            case MtgAbilityType_1.MtgAbilityType.Static:
                this.mtgAbilityService.generateStaticAbility(card, minScore, maxScore);
                break;
        }
    };
    MtgLandGenerator.prototype.chooseFlavorText = function (card) {
        if (Random_1.Random.chance(0.5) || card.wrappedOracleLines.length <= 3) {
            var maxFlavorTextLength = (card.rendererPreset.maxLines - card.wrappedOracleLines.length - 1) * card.rendererPreset.maxCharactersPerLine;
            var smallEnoughFlavorText = this.mtgDataRepository.getLandFlavorText(maxFlavorTextLength);
            if (smallEnoughFlavorText !== undefined && smallEnoughFlavorText !== null) {
                card.wrappedOracleLines.push("FT_LINE");
                var flavorTextLines = this.mtgOracleTextWrapperService.wordWrapText(smallEnoughFlavorText, card.rendererPreset.maxCharactersPerLine);
                flavorTextLines.forEach(function (f) { return card.wrappedOracleLines.push("FT_" + f); });
            }
        }
    };
    return MtgLandGenerator;
}(MtgBaseGenerator_1.MtgBaseGenerator));
exports.MtgLandGenerator = MtgLandGenerator;
//# sourceMappingURL=MtgLandGenerator.js.map