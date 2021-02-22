import { MtgCard } from '../../dtos/mtg/MtgCard';
import { MtgDataRepository } from '../../persistence/repositories/MtgDataRepository';
import { Random } from '../../helpers/Random';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MtgCommandParser } from '../../parsers/MtgCommandParser';
import { MtgHelper } from '../../helpers/mtg/MtgHelper';
import { StringHelper } from '../../helpers/StringHelper';
import { MtgParsable } from '../../dtos/mtg/abilities/MtgParsable';
import { MtgAbilityService } from './MtgAbilityService';

export class MtgSyntaxResolver {

    public static COLOR_NAMES = ["white", "blue", "black", "red", "green"];

    constructor(private mtgDataRepository: MtgDataRepository, private mtgAbilityService: MtgAbilityService) {
    }

    public resolveSyntax(card: MtgCard): void {
        card.oracle.keywords.forEach(k => this.parseSyntax(k, card));
        card.oracle.abilities.forEach(a => this.parseSyntax(a, card, true));
    }

    public parseSyntax(parsable: MtgParsable, card: MtgCard, addDot: boolean = false): void {

        // this represents the amplitude of an ability when large numbers are used, like "draw 4 cards".
        let parserValue = 0;

        let maxDepth = 30;
        let depth = 0;

        let selfCount = 0;
        let useN = false;

        let text = parsable.getText(card);

        while (text.indexOf("(") >= 0) {
            depth++;
            if (depth >= maxDepth) break;

            let moreThanOne = false;
            if (text.indexOf("(numbername)") >= 0) {
                moreThanOne = true;
                let number = Random.nextFromList(["two", "two", "two", "two", "two", "three", "three"]);
                text = text.replace("(numbername)", number);
                parserValue = number === "two" ? 2 : 3;
            }
            if (text.indexOf("(numbername2)") >= 0) {
                moreThanOne = true;
                let number = Random.nextFromList(["two", "two", "three", "three", "three", "four", "five"]);
                text = text.replace("(numbername2)", number);
                parserValue = Math.max(parserValue, number === "two" ? 2 : number === "three" ? 3 : number === "four" ? 4 : 5);
            }
            if (text.indexOf("(numbername3)") >= 0) {
                moreThanOne = true;
                let number = Random.nextFromList(["four", "five", "five", "six"]);
                text = text.replace("(numbername3)", number);
                parserValue = Math.max(parserValue, number === "four" ? 4 : number === "five" ? 5 : 6);
            }
            if (text.indexOf("(number)") >= 0) {
                let number = Random.nextFromList([1, 1, 1, 2, 2, 2, 2, 3, 3]);
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                parserValue = Math.max(parserValue, number);
            }
            if (text.indexOf("(!number)") >= 0) {
                let number = Random.nextFromList([1, 1, 1, 2, 2, 2, 2, 3, 3]).toString();
                text = text.replace("(!number)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }
            if (text.indexOf("(number2)") >= 0) {
                let number = Random.nextFromList([2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5]);
                moreThanOne = true;
                text = text.replace("(number2)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                parserValue = Math.max(parserValue, number);
            }
            if (text.indexOf("(!number2)") >= 0) {
                let number = Random.nextFromList([2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5]).toString();
                text = text.replace("(!number2)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }
            if (text.indexOf("(number3)") >= 0) {
                let number = Random.nextFromList([5, 5, 5, 6, 6, 6, 7, 8, 9]);
                moreThanOne = true;
                text = text.replace("(number3)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                parserValue = Math.max(parserValue, number);
            }
            if (text.indexOf("(!number3)") >= 0) {
                let number = Random.nextFromList([5, 5, 5, 6, 6, 6, 7, 8, 9]).toString();
                text = text.replace("(!number3)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }

            if (text.indexOf("(keyword)") >= 0) {
                const keyword = this.mtgDataRepository.getKeywordsByColorAndType(card.color, "creature", 1, true)[0];
                text = text.replace("(keyword)", keyword.name.toLowerCase());
            }

            let subtype = "";
            if (text.indexOf("(subtype)") >= 0) {
                subtype = this.mtgDataRepository.getSubtypes(1)[0];
                let firstLetter = subtype[0].toLowerCase();
                useN = useN || firstLetter === "a" || firstLetter === "e" || firstLetter === "i" || firstLetter === "o" || firstLetter === "u";
                text = text.replace("(subtype)", subtype);
            }

            if (text.indexOf("(another)") >= 0 && card.subtype !== undefined && card.subtype.indexOf(subtype) >= 0) {
                text = text.replace("(another)", "another ");
            } else {
                text = text.replace("(another)", "");
            }

            if (text.indexOf("(other creatures)") >= 0 && card.type === MtgCardType.Creature) {
                text = text.replace("(other creatures)", "other creatures");
            } else {
                text = text.replace("(other creatures)", "creatures");
            }

            if (text.indexOf("(self)") >= 0) {
                if (parsable.getContext() === "self" || selfCount > 0) {
                    text = text.replace("(self)", "it");
                } else {
                    selfCount++;
                    text = text.replace("(self)", card.name);
                }
            }

            if (text.indexOf("(type)") >= 0) {
                let type = Random.nextFromList(this.mtgDataRepository.getTypes());
                useN = useN || type === "enchantment" || type === "artifact";
                text = text.replace("(type)", type);
            }
            if (text.indexOf("(permanent)") >= 0) {
                let type = Random.nextFromList(this.mtgDataRepository.getPermanentTypes());
                useN = useN || type === "enchantment" || type === "artifact";
                text = text.replace("(permanent)", type);
            }

            if (text.indexOf("(type/counterable)") >= 0) {
                let type = Random.nextFromList(this.mtgDataRepository.getTypes());
                text = text.replace("(type/counterable)", type.replace("land", "noncreature"));
            }
            if (text.indexOf("(types|color)") >= 0) {
                let type = Random.flipCoin() ? Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES) : Random.nextFromList(this.mtgDataRepository.getTypes()) + "s";
                text = text.replace("(types|color)", type);
            }
            if (text.indexOf("(type|color)") >= 0) {
                let type = Random.flipCoin() ? Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES) : Random.nextFromList(this.mtgDataRepository.getTypes());
                text = text.replace("(type|color)", type);
            }

            if (text.indexOf("(mana)") >= 0) {
                let symbol = Random.nextFromList(MtgCommandParser.BASIC_COLORS);
                if (Random.flipCoin()) symbol += Random.nextFromList(MtgCommandParser.BASIC_COLORS);
                text = text.replace("(mana)", "X" + MtgHelper.sortWubrg(symbol).split("").join("X"));
            }
            if (text.indexOf("(mana2)") >= 0) {
                let symbol = Random.nextFromList(MtgCommandParser.BASIC_COLORS);
                symbol += Random.nextFromList(MtgCommandParser.BASIC_COLORS);
                symbol += Random.nextFromList(MtgCommandParser.BASIC_COLORS);
                if (Random.flipCoin()) symbol += Random.nextFromList(MtgCommandParser.BASIC_COLORS);
                text = text.replace("(mana2)", "X" + MtgHelper.sortWubrg(symbol).split("").join("X"));
            }

            const costPattern = /\(cost\[s:-{0,1}\d+\.{0,1}\d*\,c:.+\]\)/g;
            const costIndex = StringHelper.regexIndexOf(text, costPattern);
            if (costIndex >= 0) {
                const score = text.substr(text.indexOf("s:") + 2, text.indexOf(",c:") - text.indexOf("s:") - 2);
                const colors = text.substr(text.indexOf("c:") + 2, text.indexOf("]") - text.indexOf("c:") - 2);

                let cost = MtgHelper.getManacost(Math.max(1, Math.round(parseFloat(score))), colors);
                text = text.replace(costPattern, cost);
            }


            if (text.indexOf("(ability)") >= 0) {
                let cardname = card.name;
                card.name = card.type === MtgCardType.Enchantment ? "enchanted creature" : "equipped creature";
                let previousAbilities = card.oracle.abilities;

                let isTriggered = Random.chance(0.5);
                if (isTriggered) {
                    this.mtgAbilityService.generateTriggeredAbility(card, 0, 3, true);
                } else {
                    this.mtgAbilityService.generateActivatedAbility(card, 0, 3);
                }
                let ability = card.oracle.abilities[card.oracle.abilities.length - 1];
                parserValue += ability.getScore();
                card.oracle.abilities = previousAbilities;

                text = text.replace("(ability)", `"${ability.getText()}"`);
                card.name = cardname;
            }

            text = text.replace("(player)", Random.nextFromList(["player", "opponent"]));
            text = text.replace(/\(name\)/g, card.name);
            text = text.replace("(s)", moreThanOne ? "s" : "");
            text = text.replace("(n)", useN ? "n" : "");
            text = text.replace("(color)", Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES));
        }

        parsable.parsedText = StringHelper.capitalizeFirstChar(text.trim()) + (addDot ? "." : "");
        parsable.parserValue = parserValue;
    }

}