"use strict";
exports.__esModule = true;
exports.MtgSyntaxResolver = void 0;
var Random_1 = require("../../helpers/Random");
var MtgCardType_1 = require("../../dtos/mtg/MtgCardType");
var MtgCommandParser_1 = require("../../parsers/MtgCommandParser");
var MtgHelper_1 = require("../../helpers/mtg/MtgHelper");
var StringHelper_1 = require("../../helpers/StringHelper");
var MtgSyntaxResolver = (function () {
    function MtgSyntaxResolver(mtgDataRepository, mtgAbilityService) {
        this.mtgDataRepository = mtgDataRepository;
        this.mtgAbilityService = mtgAbilityService;
    }
    MtgSyntaxResolver.prototype.resolveSyntax = function (card) {
        var _this = this;
        card.oracle.keywords.forEach(function (k) { return _this.parseSyntax(k, card); });
        card.oracle.abilities.forEach(function (a) { return _this.parseSyntax(a, card, true); });
    };
    MtgSyntaxResolver.prototype.parseSyntax = function (parsable, card, addDot) {
        if (addDot === void 0) { addDot = false; }
        var parserValue = 0;
        var maxDepth = 30;
        var depth = 0;
        var selfCount = 0;
        var useN = false;
        var text = parsable.getText(card);
        while (text.indexOf("(") >= 0) {
            depth++;
            if (depth >= maxDepth)
                break;
            var moreThanOne = false;
            if (text.indexOf("(numbername)") >= 0) {
                moreThanOne = true;
                var number = Random_1.Random.nextFromList(["two", "two", "two", "two", "two", "three", "three"]);
                text = text.replace("(numbername)", number);
                parserValue = number === "two" ? 2 : 3;
            }
            if (text.indexOf("(numbername2)") >= 0) {
                moreThanOne = true;
                var number = Random_1.Random.nextFromList(["two", "two", "three", "three", "three", "four", "five"]);
                text = text.replace("(numbername2)", number);
                parserValue = Math.max(parserValue, number === "two" ? 2 : number === "three" ? 3 : number === "four" ? 4 : 5);
            }
            if (text.indexOf("(numbername3)") >= 0) {
                moreThanOne = true;
                var number = Random_1.Random.nextFromList(["four", "five", "five", "six"]);
                text = text.replace("(numbername3)", number);
                parserValue = Math.max(parserValue, number === "four" ? 4 : number === "five" ? 5 : 6);
            }
            if (text.indexOf("(number)") >= 0) {
                var number = Random_1.Random.nextFromList([1, 1, 1, 2, 2, 2, 2, 3, 3]);
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                parserValue = Math.max(parserValue, number);
            }
            if (text.indexOf("(!number)") >= 0) {
                var number = Random_1.Random.nextFromList([1, 1, 1, 2, 2, 2, 2, 3, 3]).toString();
                text = text.replace("(!number)", number);
                text = text.replace("(samenumber)", number);
            }
            if (text.indexOf("(number2)") >= 0) {
                var number = Random_1.Random.nextFromList([2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5]);
                moreThanOne = true;
                text = text.replace("(number2)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                parserValue = Math.max(parserValue, number);
            }
            if (text.indexOf("(!number2)") >= 0) {
                var number = Random_1.Random.nextFromList([2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5]).toString();
                text = text.replace("(!number2)", number);
                text = text.replace("(samenumber)", number);
            }
            if (text.indexOf("(number3)") >= 0) {
                var number = Random_1.Random.nextFromList([5, 5, 5, 6, 6, 6, 7, 8, 9]);
                moreThanOne = true;
                text = text.replace("(number3)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                parserValue = Math.max(parserValue, number);
            }
            if (text.indexOf("(!number3)") >= 0) {
                var number = Random_1.Random.nextFromList([5, 5, 5, 6, 6, 6, 7, 8, 9]).toString();
                text = text.replace("(!number3)", number);
                text = text.replace("(samenumber)", number);
            }
            if (text.indexOf("(keyword)") >= 0) {
                var keyword = this.mtgDataRepository.getKeywordsByColorAndType(card.color, "creature", 1, true)[0];
                text = text.replace("(keyword)", keyword.name.toLowerCase());
            }
            var subtype = "";
            if (text.indexOf("(subtype)") >= 0) {
                subtype = this.mtgDataRepository.getSubtypes(1)[0];
                var firstLetter = subtype[0].toLowerCase();
                useN = useN || firstLetter === "a" || firstLetter === "e" || firstLetter === "i" || firstLetter === "o" || firstLetter === "u";
                text = text.replace("(subtype)", subtype);
            }
            if (text.indexOf("(another)") >= 0 && card.subtype !== undefined && card.subtype.indexOf(subtype) >= 0) {
                text = text.replace("(another)", "another ");
            }
            else {
                text = text.replace("(another)", "");
            }
            if (text.indexOf("(other creatures)") >= 0 && card.type === MtgCardType_1.MtgCardType.Creature) {
                text = text.replace("(other creatures)", "other creatures");
            }
            else {
                text = text.replace("(other creatures)", "creatures");
            }
            if (text.indexOf("(self)") >= 0) {
                if (parsable.getContext() === "self" || selfCount > 0) {
                    text = text.replace("(self)", "it");
                }
                else {
                    selfCount++;
                    text = text.replace("(self)", card.name);
                }
            }
            if (text.indexOf("(type)") >= 0) {
                var type = Random_1.Random.nextFromList(this.mtgDataRepository.getTypes());
                useN = useN || type === "enchantment" || type === "artifact";
                text = text.replace("(type)", type);
            }
            if (text.indexOf("(permanent)") >= 0) {
                var type = Random_1.Random.nextFromList(this.mtgDataRepository.getPermanentTypes());
                useN = useN || type === "enchantment" || type === "artifact";
                text = text.replace("(permanent)", type);
            }
            if (text.indexOf("(type/counterable)") >= 0) {
                var type = Random_1.Random.nextFromList(this.mtgDataRepository.getTypes());
                text = text.replace("(type/counterable)", type.replace("land", "noncreature"));
            }
            if (text.indexOf("(types|color)") >= 0) {
                var type = Random_1.Random.flipCoin() ? Random_1.Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES) : Random_1.Random.nextFromList(this.mtgDataRepository.getTypes()) + "s";
                text = text.replace("(types|color)", type.replace("ys", "ies"));
            }
            if (text.indexOf("(type|color)") >= 0) {
                var type = Random_1.Random.flipCoin() ? Random_1.Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES) : Random_1.Random.nextFromList(this.mtgDataRepository.getTypes());
                text = text.replace("(type|color)", type);
            }
            if (text.indexOf("(mana)") >= 0) {
                var symbol = Random_1.Random.nextFromList(MtgCommandParser_1.MtgCommandParser.BASIC_COLORS);
                if (Random_1.Random.flipCoin())
                    symbol += Random_1.Random.nextFromList(MtgCommandParser_1.MtgCommandParser.BASIC_COLORS);
                text = text.replace("(mana)", "X" + MtgHelper_1.MtgHelper.sortWubrg(symbol).split("").join("X"));
            }
            if (text.indexOf("(mana2)") >= 0) {
                var symbol = Random_1.Random.nextFromList(MtgCommandParser_1.MtgCommandParser.BASIC_COLORS);
                symbol += Random_1.Random.nextFromList(MtgCommandParser_1.MtgCommandParser.BASIC_COLORS);
                symbol += Random_1.Random.nextFromList(MtgCommandParser_1.MtgCommandParser.BASIC_COLORS);
                if (Random_1.Random.flipCoin())
                    symbol += Random_1.Random.nextFromList(MtgCommandParser_1.MtgCommandParser.BASIC_COLORS);
                text = text.replace("(mana2)", "X" + MtgHelper_1.MtgHelper.sortWubrg(symbol).split("").join("X"));
            }
            var costPattern = /\(cost\[s:-{0,1}\d+\.{0,1}\d*\,c:.+\]\)/g;
            var costIndex = StringHelper_1.StringHelper.regexIndexOf(text, costPattern);
            if (costIndex >= 0) {
                var score = text.substr(text.indexOf("s:") + 2, text.indexOf(",c:") - text.indexOf("s:") - 2);
                var colors = text.substr(text.indexOf("c:") + 2, text.indexOf("]") - text.indexOf("c:") - 2);
                var cost = MtgHelper_1.MtgHelper.getManacost(Math.max(1, Math.round(parseFloat(score) + Random_1.Random.next(100, 175) / 100)), colors);
                text = text.replace(costPattern, cost);
            }
            if (text.indexOf("(ability)") >= 0) {
                var previousAbilities = card.oracle.abilities;
                var isTriggered = Random_1.Random.chance(0.5);
                if (isTriggered) {
                    this.mtgAbilityService.generateTriggeredAbility(card, 0, 3, true);
                }
                else {
                    this.mtgAbilityService.generateActivatedAbility(card, 0, 3);
                }
                var ability = card.oracle.abilities[card.oracle.abilities.length - 1];
                parserValue += ability.getScore();
                card.oracle.abilities = previousAbilities;
                var selfName = card.type === MtgCardType_1.MtgCardType.Enchantment ? "enchanted creature" : "equipped creature";
                text = text.replace("(ability)", "\"" + ability.getText().replace("(name)", selfName).replace("(self)", selfName) + "\"");
            }
            text = text.replace("(player)", Random_1.Random.nextFromList(["player", "opponent"]));
            text = text.replace(/\(name\)/g, card.name);
            text = text.replace("(s)", moreThanOne ? "s" : "");
            text = text.replace("(n)", useN ? "n" : "");
            text = text.replace("(color)", Random_1.Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES));
        }
        parsable.parsedText = StringHelper_1.StringHelper.capitalizeFirstChar(text.trim()) + (addDot ? "." : "");
        parsable.parserValue = parserValue;
    };
    MtgSyntaxResolver.COLOR_NAMES = ["white", "blue", "black", "red", "green"];
    return MtgSyntaxResolver;
}());
exports.MtgSyntaxResolver = MtgSyntaxResolver;
//# sourceMappingURL=MtgSyntaxResolver.js.map