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
exports.MtgEnchantmentGenerator = void 0;
var Random_1 = require("../../../helpers/Random");
var MtgCardRarity_1 = require("../../../dtos/mtg/MtgCardRarity");
var MtgAbilityType_1 = require("../../../dtos/mtg/MtgAbilityType");
var MtgHelper_1 = require("../../../helpers/mtg/MtgHelper");
var MtgBaseGenerator_1 = require("./MtgBaseGenerator");
var MtgKeyword_1 = require("../../../persistence/entities/mtg/MtgKeyword");
var MtgCardType_1 = require("../../../dtos/mtg/MtgCardType");
var MtgEnchantmentGenerator = (function (_super) {
    __extends(MtgEnchantmentGenerator, _super);
    function MtgEnchantmentGenerator(mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) {
        return _super.call(this, mtgDataRepository, mtgAbilityService, mtgSyntaxResolver, mtgOracleTextWrapperService) || this;
    }
    MtgEnchantmentGenerator.prototype.generate = function (card) {
        card.isLegendary = card.isLegendary || Random_1.Random.chance(0.25) && (card.rarity === MtgCardRarity_1.MtgCardRarity.Rare || card.rarity === MtgCardRarity_1.MtgCardRarity.Mythic);
        card.supertype = card.isLegendary ? "Legendary" : "";
        card.name = card.name || this.mtgDataRepository.getEnchantmentName();
        var isAura = Random_1.Random.chance(0.3) || card.type === MtgCardType_1.MtgCardType.Aura;
        card.type = MtgCardType_1.MtgCardType.Enchantment;
        this.chooseSubtypes(card, isAura);
        this.chooseAbilities(card, isAura);
        this.chooseArtwork(card, isAura ? "aura" : "enchantment");
        this.resolveSyntax(card);
        this.estimateCmc(card);
        this.wrapTextForRenderer(card);
        this.chooseFlavorText(card);
        card.color = MtgHelper_1.MtgHelper.getDominantColor(card, card.cmc);
        card.manacost = MtgHelper_1.MtgHelper.getManacost(card.cmc, card.color);
        return card;
    };
    MtgEnchantmentGenerator.prototype.chooseSubtypes = function (card, isAura) {
        if (isAura) {
            card.subtype = "Aura";
        }
    };
    MtgEnchantmentGenerator.prototype.chooseAbilities = function (card, isAura) {
        var abilityCount = Random_1.Random.complex([
            { value: 1, chance: 0.50 },
            { value: 2, chance: 0.50 + (card.rarityScore <= 2 ? -1.0 : 0.0) }
        ], 1);
        if (isAura) {
            this.mtgAbilityService.generateAuraAbility(card, -99, +99);
            var a1 = card.oracle.abilities[0];
            card.oracle.keywords.push(new MtgKeyword_1.MtgKeyword({
                name: "Enchant " + a1.effect.auraType + (a1.effect.isForOpponent ? " an opponent controls" : ""),
                score: 0,
                colorIdentity: a1.effect.colorIdentity,
                nameExtension: "",
                hasCost: false,
                isTop: true
            }));
            a1.effect.text = "Enchanted " + a1.effect.auraType + " " + a1.effect.text;
            if (abilityCount === 2) {
                this.mtgAbilityService.generateAuraAbility(card, -99, +99, a1.effect);
                var a2 = card.oracle.abilities[1];
                a1.combine(a2);
                card.oracle.abilities = [a1];
            }
        }
        else {
            for (var i = 0; i < abilityCount; i++) {
                var abilityType = Random_1.Random.complex([
                    { value: MtgAbilityType_1.MtgAbilityType.Activated, chance: 0.25 },
                    { value: MtgAbilityType_1.MtgAbilityType.Triggered, chance: 0.25 },
                    { value: MtgAbilityType_1.MtgAbilityType.Static, chance: 0.50 }
                ], 0);
                this.generateEnchantmentAbility(card, abilityType);
            }
        }
        card.oracle.abilities.sort(function (a, b) { return a.type - b.type; });
    };
    MtgEnchantmentGenerator.prototype.generateEnchantmentAbility = function (card, abilityType) {
        switch (abilityType) {
            case MtgAbilityType_1.MtgAbilityType.Activated:
                return this.mtgAbilityService.generateActivatedAbility(card, 0, +99, false);
            case MtgAbilityType_1.MtgAbilityType.Triggered:
                return this.mtgAbilityService.generateTriggeredAbility(card, 0, +99);
            case MtgAbilityType_1.MtgAbilityType.Static:
                return this.mtgAbilityService.generateStaticAbility(card, 0, +99);
        }
    };
    MtgEnchantmentGenerator.prototype.chooseFlavorText = function (card) {
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
    return MtgEnchantmentGenerator;
}(MtgBaseGenerator_1.MtgBaseGenerator));
exports.MtgEnchantmentGenerator = MtgEnchantmentGenerator;
//# sourceMappingURL=MtgEnchantmentGenerator.js.map