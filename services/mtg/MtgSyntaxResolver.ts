import { MtgCard } from '../../dtos/mtg/MtgCard';
import { MtgDataRepository } from '../../persistence/repositories/MtgDataRepository';
import { Random } from '../../helpers/Random';
import { MtgCardType } from '../../dtos/mtg/MtgCardType';
import { MtgCommandParser } from '../../parsers/MtgCommandParser';
export class MtgSyntaxResolver {

    public static COLOR_NAMES = ["white", "blue", "black", "red", "green"];

    constructor(private mtgDataRepository: MtgDataRepository) {
    }

    public resolveSyntax(card: MtgCard) {
        card.oracle.keywords.forEach(k => k.setParsedText(this.parseSyntax(k.getText(), card)));
        card.oracle.abilities.forEach(a => a.setParsedText(this.parseSyntax(a.getText(), card, a.getContext()) + "."));
    }

    public parseSyntax(text: string, card: MtgCard, context: string = "self") {
        let maxDepth = 30;
        let depth = 0;

        let selfCount = 0;
        let useN = false;

        while (text.indexOf("(") >= 0) {
            depth++;
            if (depth >= maxDepth) break;

            let moreThanOne = false;
            if (text.indexOf("(numbername)") >= 0) {
                moreThanOne = true;
                let number = ["two", "two", "two", "two", "two", "three", "three"][Random.next(0, 6)];
                text = text.replace("(numbername)", number);
                // this.lastNumber = Math.max(this.lastNumber, number === "two" ? 2 : 3);
                // this.lastNumberCount++;
            }
            if (text.indexOf("(numbername2)") >= 0) {
                moreThanOne = true;
                let number = ["two", "two", "three", "three", "three", "four", "five"][Random.next(0, 6)];
                text = text.replace("(numbername2)", number);
                // this.lastNumber = Math.max(this.lastNumber, number === "two" ? 2 : number === "three" ? 3 : number === "four" ? 4 : 5);
                // this.lastNumberCount++;
            }
            if (text.indexOf("(numbername3)") >= 0) {
                moreThanOne = true;
                let number = ["four", "five", "five", "six"][Random.next(0, 3)];
                text = text.replace("(numbername3)", number);
                // this.lastNumber = Math.max(this.lastNumber, number === "four" ? 4 : number === "five" ? 5 : 6);
                // this.lastNumberCount++;
            }
            if (text.indexOf("(number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][Random.next(0, 8)];
                moreThanOne = moreThanOne || number > 1;
                text = text.replace("(number)", number.toString());
                text = text.replace("(samenumber)", number.toString());
                // this.lastNumber = Math.max(this.lastNumber, number);
                // this.lastNumberCount++;
            }
            if (text.indexOf("(!number)") >= 0) {
                let number = [1, 1, 1, 2, 2, 2, 2, 3, 3][Random.next(0, 8)].toString();
                text = text.replace("(!number)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }
            if (text.indexOf("(number2)") >= 0) {
                let number = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6][Random.next(0, 12)].toString();
                moreThanOne = true;
                text = text.replace("(number2)", number);
                text = text.replace("(samenumber)", number);
                // this.lastNumber = Math.max(this.lastNumber, number);
                // this.lastNumberCount++;
            }
            if (text.indexOf("(!number2)") >= 0) {
                let number = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6][Random.next(0, 12)].toString();
                text = text.replace("(!number2)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }
            if (text.indexOf("(number3)") >= 0) {
                let number = [5, 5, 5, 6, 6, 6, 7, 8, 9][Random.next(0, 8)].toString();
                moreThanOne = true;
                text = text.replace("(number3)", number);
                text = text.replace("(samenumber)", number);
                // this.lastNumber = Math.max(this.lastNumber, number);
                // this.lastNumberCount++;
            }
            if (text.indexOf("(!number3)") >= 0) {
                let number = [5, 5, 5, 6, 6, 6, 7, 8, 9][Random.next(0, 8)].toString();
                text = text.replace("(!number3)", number);
                text = text.replace("(samenumber)", number);
                // ignore lastNumber increase.
            }

            if (text.indexOf("(keyword)") >= 0) {
                const keyword = this.mtgDataRepository.getKeywordsByColorAndType(card.color.split(''), card.type.toLowerCase(), 1)[0];
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
                if (context === "self" || selfCount > 0) {
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

            if (text.indexOf("(mana)") >= 0) {
                let symbol = "X" + Random.nextFromList(MtgCommandParser.AVAILABLE_COLORS);
                if (Random.flipCoin()) symbol += "X" + Random.nextFromList(MtgCommandParser.AVAILABLE_COLORS);
                text = text.replace("(mana)", symbol);
            }

            if (text.indexOf("(cost)") >= 0) {
                let symbol = "";
                if (Random.chance(0.5)) symbol += "X" + Random.next(1, 2);
                if (Random.chance(0.4)) symbol += "X" + Random.nextFromList(MtgCommandParser.AVAILABLE_COLORS);
                if (Random.chance(0.4)) symbol += "X" + Random.nextFromList(MtgCommandParser.AVAILABLE_COLORS);
                if (symbol.length <= 0) symbol = "X2";
                text = text.replace("(cost)", symbol);
            }

            // TODO Aura not yet supported.
            // if (text.indexOf("(ability)") >= 0) {
            //     let cardname = this.card.name;
            //     this.card.name = "enchanted creature";

            //     let isTriggered = this.flipCoin();
            //     let ability = undefined;
            //     if (isTriggered) {
            //         ability = this.getTriggeredAbility();
            //     } else {
            //         ability = this.getActivatedAbility(this.rarityNumber);
            //     }
            //     this.lastAbilityScore = ability.score;

            //     text = text.replace("(ability)", `"${ability.text.replace(/\.$/g, '')}"`);
            //     this.card.name = cardname;
            // }
            // text = text.replace("(auratype)", this.auraType);

            text = text.replace("(player)", Random.nextFromList(["player", "opponent"]));
            text = text.replace(/\(name\)/g, card.name);
            text = text.replace("(s)", moreThanOne ? "s" : "");
            text = text.replace("(n)", useN ? "n" : "");
            text = text.replace("(color)", Random.nextFromList(MtgSyntaxResolver.COLOR_NAMES));
        }

        return text;
    }

}