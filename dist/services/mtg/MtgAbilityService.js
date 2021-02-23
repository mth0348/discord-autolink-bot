"use strict";
exports.__esModule = true;
exports.MtgAbilityService = void 0;
var Random_1 = require("../../helpers/Random");
var MtgActivatedAbility_1 = require("../../dtos/mtg/abilities/MtgActivatedAbility");
var MtgStaticAbility_1 = require("../../dtos/mtg/abilities/MtgStaticAbility");
var MtgTriggeredAbility_1 = require("../../dtos/mtg/abilities/MtgTriggeredAbility");
var StringHelper_1 = require("../../helpers/StringHelper");
var MtgCardRarity_1 = require("../../dtos/mtg/MtgCardRarity");
var discord_js_1 = require("discord.js");
var MtgPermanentActivatedCost_1 = require("../../persistence/entities/mtg/MtgPermanentActivatedCost");
var MtgHelper_1 = require("../../helpers/mtg/MtgHelper");
var MtgPermanentStatics_1 = require("../../persistence/entities/mtg/MtgPermanentStatics");
var MtgPermanentEvent_1 = require("../../persistence/entities/mtg/MtgPermanentEvent");
var MtgCommandParser_1 = require("../../parsers/MtgCommandParser");
var MtgCardType_1 = require("../../dtos/mtg/MtgCardType");
var Logger_1 = require("../../helpers/Logger");
var LogType_1 = require("../../dtos/LogType");
var MtgActivatedPwAbility_1 = require("../../dtos/mtg/abilities/MtgActivatedPwAbility");
var MtgSpellAbility_1 = require("../../dtos/mtg/abilities/MtgSpellAbility");
var MtgAuraAbility_1 = require("../../dtos/mtg/abilities/MtgAuraAbility");
var MtgAbilityService = (function () {
    function MtgAbilityService(mtgDataRepository) {
        this.mtgDataRepository = mtgDataRepository;
        this.rarityScoreLUT = new discord_js_1.Collection([
            [MtgCardRarity_1.MtgCardRarity.Common, 2],
            [MtgCardRarity_1.MtgCardRarity.Uncommon, 3],
            [MtgCardRarity_1.MtgCardRarity.Rare, 5.5],
            [MtgCardRarity_1.MtgCardRarity.Mythic, 9999]
        ]);
    }
    MtgAbilityService.prototype.generateSpellAbility = function (card, minScore, maxScore) {
        var _this = this;
        if (minScore === void 0) { minScore = 0; }
        if (maxScore === void 0) { maxScore = 99; }
        var colors = this.getColors(card);
        var events = this.mtgDataRepository.getInstantSorceryEvents()
            .filter(function (a) {
            return a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0 || c === "c"; })
                && a.score <= _this.rarityScoreLUT.get(card.rarity);
        });
        if (events.length <= 0) {
            Logger_1.Logger.log("No spell ability found for card.", LogType_1.LogType.Warning, card);
            return;
        }
        var spellEvent = Random_1.Random.nextFromList(events);
        card.oracle.abilities.push(new MtgSpellAbility_1.MtgSpellAbility(spellEvent));
    };
    MtgAbilityService.prototype.generateLandEtbAbility = function (card) {
        var colors = this.getColors(card);
        var isRegularTapped = Random_1.Random.chance(0.8);
        if (isRegularTapped) {
            var etbEvent = new MtgPermanentStatics_1.MtgPermanentStatics({
                colorIdentity: "",
                text: "(self) enters the battlefield tapped",
                score: -1.5
            });
            card.oracle.abilities.push(new MtgStaticAbility_1.MtgStaticAbility(etbEvent));
        }
        else {
            var costs = this.mtgDataRepository.getPermanentActivatedCosts()
                .filter(function (a) {
                return (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                    && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0; });
            });
            if (costs.length <= 0) {
                Logger_1.Logger.log("No land ETB ability found for card.", LogType_1.LogType.Warning, card);
                return;
            }
            var chosenCost = Random_1.Random.nextFromList(costs);
            var etbEvent = new MtgPermanentStatics_1.MtgPermanentStatics({
                colorIdentity: chosenCost.colorIdentity,
                text: "as (self) enters the battlefield, you may " + chosenCost.text + ". If you don't, (self) enters the battlefield tapped",
                score: 1 - chosenCost.score / 6
            });
            card.oracle.abilities.push(new MtgStaticAbility_1.MtgStaticAbility(etbEvent));
        }
    };
    MtgAbilityService.prototype.generateManaAbility = function (card, collorsAllowed) {
        var colorString = "";
        if (collorsAllowed === 0)
            colorString = "XC";
        else if (card.color.length === 1 || collorsAllowed === 1)
            colorString = "X" + Random_1.Random.nextFromList(card.color.split(""));
        else if (card.color.length === 2)
            colorString = "X" + card.color.split("").join(" or X");
        else if (card.color.length > 2)
            colorString = "X" + card.color.slice(0, card.color.length - 1).split("").join(", X") + " or X" + card.color[card.color.length - 1];
        var cost = new MtgPermanentActivatedCost_1.MtgPermanentActivatedCost({
            text: "XT",
            score: 0,
            colorIdentity: card.color
        });
        var event = new MtgPermanentEvent_1.MtgPermanentEvent({
            text: "add " + colorString,
            score: 1,
            colorIdentity: card.color
        });
        card.oracle.abilities.push(new MtgActivatedAbility_1.MtgActivatedAbility(cost, event));
    };
    MtgAbilityService.prototype.generateActivatedAbility = function (card, minScore, maxScore, allowTapSymbol, enforceTapSymbol) {
        var _this = this;
        if (minScore === void 0) { minScore = 0; }
        if (maxScore === void 0) { maxScore = 99; }
        if (allowTapSymbol === void 0) { allowTapSymbol = true; }
        if (enforceTapSymbol === void 0) { enforceTapSymbol = true; }
        var colors = this.getColors(card);
        var events = this.mtgDataRepository.getPermanentEvents()
            .filter(function (a) {
            return a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0; })
                && a.score <= _this.rarityScoreLUT.get(card.rarity);
        });
        if (events.length <= 0) {
            Logger_1.Logger.log("No activated ability event found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        var activatedEvent = Random_1.Random.nextFromList(events);
        var cost = null;
        if (Random_1.Random.chance(0.2)) {
            var costs = this.mtgDataRepository.getPermanentActivatedCosts()
                .filter(function (a) {
                return (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                    && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0; });
            });
            if (costs.length <= 0) {
                Logger_1.Logger.log("No activated costs found for card.", LogType_1.LogType.Warning, card);
                return true;
            }
            var fairCosts = costs.filter(function (c) { return c.score >= activatedEvent.score; }).sort(function (a, b) { return b.score - a.score; });
            if (fairCosts.length < 3) {
                fairCosts = costs.sort(function (a, b) { return b.score - a.score; });
            }
            cost = fairCosts[Random_1.Random.next(0, 2)];
        }
        else {
            var useTapSymbol = Random_1.Random.chance(0.5) && allowTapSymbol || enforceTapSymbol;
            var tapSymbolText = useTapSymbol ? ", XT" : "";
            var cmc = Math.max(1, Math.min(6, Math.round(activatedEvent.score * Random_1.Random.next(50, 80) / 100)));
            cmc += card.type === MtgCardType_1.MtgCardType.Land ? 1 : 0;
            var manacost = MtgHelper_1.MtgHelper.getManacost(cmc, card.color);
            cost = new MtgPermanentActivatedCost_1.MtgPermanentActivatedCost({
                text: manacost + tapSymbolText,
                score: cmc,
                colorIdentity: activatedEvent.colorIdentity
            });
        }
        card.oracle.abilities.push(new MtgActivatedAbility_1.MtgActivatedAbility(cost, activatedEvent));
        return !activatedEvent.noFollowUp;
    };
    MtgAbilityService.prototype.generateActivatedPwAbility = function (card, minScore, maxScore, isFirst) {
        if (minScore === void 0) { minScore = 0; }
        if (maxScore === void 0) { maxScore = 99; }
        if (isFirst === void 0) { isFirst = false; }
        var colors = this.getColors(card);
        var events = this.mtgDataRepository.getPermanentEvents()
            .filter(function (a) {
            return a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0; });
        });
        if (events.length <= 0) {
            Logger_1.Logger.log("No activated ability event found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        var activatedEvent = Random_1.Random.nextFromList(events);
        var score = Math.max(-8, Math.min(8, activatedEvent.score * Random_1.Random.next(70, 110) / 100));
        var roundedScore = Math.round(score);
        if (roundedScore === 0)
            roundedScore = 1;
        var cost = new MtgPermanentActivatedCost_1.MtgPermanentActivatedCost({
            text: "" + (isFirst ? '+' : '-') + Math.abs(roundedScore),
            score: roundedScore,
            colorIdentity: activatedEvent.colorIdentity
        });
        card.oracle.abilities.push(new MtgActivatedPwAbility_1.MtgActivatedPwAbility(cost, activatedEvent));
    };
    MtgAbilityService.prototype.generateTriggeredAbility = function (card, minScore, maxScore, mustContainSelfRef) {
        var _this = this;
        if (minScore === void 0) { minScore = -99; }
        if (maxScore === void 0) { maxScore = 99; }
        if (mustContainSelfRef === void 0) { mustContainSelfRef = false; }
        var colors = this.getColors(card);
        var conditions = this.mtgDataRepository.getPermanentConditions()
            .filter(function (c) {
            return (!mustContainSelfRef || (c.text.indexOf("(self)") >= 0 || c.text.indexOf("(name)") >= 0))
                && (c.restrictedTypes == undefined || c.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }));
        });
        var events = this.mtgDataRepository.getPermanentEvents()
            .filter(function (a) {
            return a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0; })
                && a.score <= _this.rarityScoreLUT.get(card.rarity);
        });
        if (conditions.length <= 0) {
            Logger_1.Logger.log("No conditions found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        if (events.length <= 0) {
            Logger_1.Logger.log("No triggered events found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        var condition = Random_1.Random.nextFromList(conditions);
        var triggeredEvent = Random_1.Random.nextFromList(events);
        card.oracle.abilities.push(new MtgTriggeredAbility_1.MtgTriggeredAbility(condition, triggeredEvent));
        return !triggeredEvent.noFollowUp;
    };
    MtgAbilityService.prototype.generateAuraAbility = function (card, minScore, maxScore, prevEffect) {
        var _this = this;
        if (minScore === void 0) { minScore = -99; }
        if (maxScore === void 0) { maxScore = 99; }
        if (prevEffect === void 0) { prevEffect = null; }
        var colors = this.getColors(card);
        var effects;
        if (prevEffect == null) {
            effects = this.mtgDataRepository.getEnchantmentEffects()
                .filter(function (e) {
                return e.score >= minScore && e.score <= maxScore
                    && colors.some(function (c) { return e.colorIdentity.indexOf(c) >= 0; })
                    && e.score <= _this.rarityScoreLUT.get(card.rarity);
            });
        }
        else {
            effects = this.mtgDataRepository.getEnchantmentEffects()
                .filter(function (e) {
                return e.score >= minScore && e.score <= maxScore
                    && colors.some(function (c) { return e.colorIdentity.indexOf(c) >= 0; })
                    && e.score <= _this.rarityScoreLUT.get(card.rarity)
                    && (!prevEffect.onlyOnce || !e.onlyOnce)
                    && (e.isForOpponent === prevEffect.isForOpponent)
                    && (e.auraType === prevEffect.auraType);
            });
        }
        if (effects.length <= 0) {
            Logger_1.Logger.log("No aura effects found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        var effect = Random_1.Random.nextFromList(effects);
        card.oracle.abilities.push(new MtgAuraAbility_1.MtgAuraAbility(effect));
    };
    MtgAbilityService.prototype.generateEquipmentAbility = function (card, minScore, maxScore, prevEffect) {
        var _this = this;
        if (minScore === void 0) { minScore = -99; }
        if (maxScore === void 0) { maxScore = 99; }
        if (prevEffect === void 0) { prevEffect = null; }
        var effects;
        if (prevEffect === undefined || prevEffect === null) {
            effects = this.mtgDataRepository.getEnchantmentEffects()
                .filter(function (e) {
                return e.score >= minScore && e.score <= maxScore
                    && e.auraType == "creature"
                    && (e.isForOpponent === undefined || e.isForOpponent === false)
                    && e.score <= _this.rarityScoreLUT.get(card.rarity);
            });
        }
        else {
            effects = this.mtgDataRepository.getEnchantmentEffects()
                .filter(function (e) {
                return e.score >= minScore && e.score <= maxScore
                    && e.auraType == "creature"
                    && (e.isForOpponent === undefined || e.isForOpponent === false)
                    && e.score <= _this.rarityScoreLUT.get(card.rarity)
                    && (!prevEffect.onlyOnce || !e.onlyOnce);
            });
        }
        if (effects.length <= 0) {
            Logger_1.Logger.log("No equipment effects found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        var effect = Random_1.Random.nextFromList(effects);
        card.oracle.abilities.push(new MtgAuraAbility_1.MtgAuraAbility(effect));
    };
    MtgAbilityService.prototype.generateStaticAbility = function (card, minScore, maxScore) {
        var _this = this;
        if (minScore === void 0) { minScore = -99; }
        if (maxScore === void 0) { maxScore = 99; }
        var colors = this.getColors(card);
        var statics = this.mtgDataRepository.getPermanentStatics()
            .filter(function (a) {
            return a.score >= minScore && a.score <= maxScore
                && (a.restrictedTypes == undefined || a.restrictedTypes.some(function (t) { return StringHelper_1.StringHelper.isEqualIgnoreCase(t, card.type); }))
                && colors.some(function (c) { return a.colorIdentity.indexOf(c) >= 0; })
                && a.score <= _this.rarityScoreLUT.get(card.rarity);
        });
        if (statics.length <= 0) {
            Logger_1.Logger.log("No static events found for card.", LogType_1.LogType.Warning, card);
            return true;
        }
        var staticEvent = Random_1.Random.nextFromList(statics);
        card.oracle.abilities.push(new MtgStaticAbility_1.MtgStaticAbility(staticEvent));
        return true;
    };
    MtgAbilityService.prototype.getColors = function (card) {
        return MtgHelper_1.MtgHelper.isExactlyColor(card.color, "c") ? MtgCommandParser_1.MtgCommandParser.BASIC_COLORS.map(function (c) { return c; }) : card.color.split('');
    };
    return MtgAbilityService;
}());
exports.MtgAbilityService = MtgAbilityService;
//# sourceMappingURL=MtgAbilityService.js.map