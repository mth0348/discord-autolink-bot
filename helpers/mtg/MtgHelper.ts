import { Collection } from 'discord.js';
import { MtgCard } from '../../dtos/mtg/MtgCard';
import { Random } from '../Random';
import { StringHelper } from '../StringHelper';
import { MtgOracleTextWrapperService } from '../../services/mtg/MtgOracleTextWrapperService';
export class MtgHelper {

    private static numberSortLUT: any[] = [
        ["0", 0],
        ["1", 1],
        ["2", 2],
        ["3", 3],
        ["4", 4],
        ["5", 5],
        ["6", 6],
        ["7", 7],
        ["8", 8],
        ["9", 9],
    ];

    private static standardSortLUT = new Collection<string, number>([
        ...MtgHelper.numberSortLUT,
        ["w", 10],
        ["u", 11],
        ["b", 12],
        ["r", 13],
        ["g", 14],
    ]);

    /* special sorts
    1: brgw, br, gw, rgw, rw, rgwu  = brgwu
    2: gwub, gu, gwu, rwb, wu       = rgwub
    3: bgu, gur, urw,               = bgurw
    */
    private static brgwuSortLUT = new Collection<string, number>([
        ...MtgHelper.numberSortLUT,
        ["b", 10],
        ["r", 11],
        ["g", 12],
        ["w", 13],
        ["u", 14],
    ]);
    private static rgwubSortLUT = new Collection<string, number>([
        ...MtgHelper.numberSortLUT,
        ["r", 10],
        ["g", 11],
        ["w", 12],
        ["u", 13],
        ["b", 14],
    ]);
    private static bgurwSortLUT = new Collection<string, number>([
        ...MtgHelper.numberSortLUT,
        ["b", 10],
        ["g", 11],
        ["u", 12],
        ["r", 13],
        ["w", 14],
    ]);

    public static sortWubrg(text: string): string {
        let lut = this.standardSortLUT;

        if (this.isExactlyColor(text, "br")
            || this.isExactlyColor(text, "gw")
            || this.isExactlyColor(text, "rw")
            || this.isExactlyColor(text, "rgw")
            || this.isExactlyColor(text, "rgwu")
            || this.isExactlyColor(text, "brgw"))
            lut = this.brgwuSortLUT;

        if (this.isExactlyColor(text, "gu")
            || this.isExactlyColor(text, "wu")
            || this.isExactlyColor(text, "gwu")
            || this.isExactlyColor(text, "rwb")
            || this.isExactlyColor(text, "gwub"))
            lut = this.rgwubSortLUT;

        if (this.isExactlyColor(text, "bgu")
            || this.isExactlyColor(text, "gur")
            || this.isExactlyColor(text, "urw"))
            lut = this.bgurwSortLUT;

        return text.toLowerCase().split('').sort((a, b) => { return lut.get(a) - lut.get(b); }).join("");
    }

    public static isExactlyColor(text: string, color: string) {
        const i = StringHelper.regexIndexOf(text, new RegExp(`^[\d${color.toLowerCase() + color.toUpperCase()}]+$`));
        return i === 0;
    }

    public static getManacost(cmc: number, colorString: string): string {
        const manacost = this.getRandomManacostWithoutX(cmc, colorString);
        return "X" + MtgHelper.sortWubrg(manacost).split("").join("X");
    }

    public static getDominantColor(card: MtgCard, maxCount: number): string {

        // colorless can ignore dominant colors.
        if (MtgHelper.isExactlyColor(card.color, "c"))
            return card.color;

        let colorIdentities = card.color;
        card.oracle.keywords.forEach(k => colorIdentities += k.colorIdentity);
        card.oracle.abilities.forEach(k => colorIdentities += k.getColorIdentity());
        colorIdentities = colorIdentities.toLowerCase();

        let colorCount = [{ c: "w", count: 0 }, { c: "u", count: 0 }, { c: "b", count: 0 }, { c: "r", count: 0 }, { c: "g", count: 0 }];
        colorCount[0].count = colorIdentities.split("").filter(c => c === "w").length;
        colorCount[1].count = colorIdentities.split("").filter(c => c === "u").length;
        colorCount[2].count = colorIdentities.split("").filter(c => c === "b").length;
        colorCount[3].count = colorIdentities.split("").filter(c => c === "r").length;
        colorCount[4].count = colorIdentities.split("").filter(c => c === "g").length;

        // sort by count descending.
        colorCount = colorCount.filter(c => c.count > 0).sort((a, b) => b.count - a.count);

        const topColors = colorCount.slice(0, Math.min(maxCount, colorCount.length)).map(c => c.c).join("");
        return MtgHelper.sortWubrg(topColors);
    }

    private static getRandomManacostWithoutX(cmc: number, colorString: string): string {
        if (colorString.length === 0 || colorString.toLowerCase() === "c") {
            return `${Math.min(9, cmc)}`;
        }

        let manacost = "";
        let color = colorString.split("");

        // Mono color.
        if (color.length === 1) {
            if (cmc === 1) {
                manacost = `${color[0]}`;
            } else if (cmc === 2) {
                let twoSymbols = Random.flipCoin();
                if (twoSymbols) {
                    manacost = `${color[0]}${color[0]}`;
                }
                else {
                    manacost = `${Math.min(9, cmc - 1)}${color[0]}`;
                }
            } else if (cmc === 3) {
                let threeSymbols = Random.chance(0.25);
                if (threeSymbols) {
                    return `${color[0]}${color[0]}${color[0]}`;
                }

                let twoSymbols = Random.flipCoin();
                if (twoSymbols)
                    return `1${color[0]}${color[0]}`;

                return `2${color[0]}`;
            } else if (cmc > 3) {
                let twoSymbols = Random.flipCoin();
                if (twoSymbols)
                    return `${Math.min(9, cmc - 2)}${color[0]}${color[0]}`;

                let threeSymbols = Random.chance(0.25);
                if (threeSymbols && cmc > 2)
                    return `${Math.min(9, cmc - 3)}${color[0]}${color[0]}${color[0]}`;

                manacost = `${Math.min(9, cmc - 1)}${color[0]}`;
            }
        }

        // Two colors.
        if (color.length === 2) {
            if (cmc === 1) {
                manacost = `${color[0]}${color[1]}`; // TODO zweites  wegnehmen
            } else if (cmc === 2) {
                manacost = `${color[0]}${color[1]}`;
            } else if (cmc === 3) {
                let threeSymbols = Random.next(0, 2); // 0 = none, 1 = first symbol twice, 2 = second symbol twice.
                switch (threeSymbols) {
                    case 0:
                        manacost = `1${color[0]}${color[1]}`;
                        break;
                    case 1:
                        manacost = `${color[0]}${color[0]}${color[1]}`;
                        break;
                    case 2:
                        manacost = `${color[0]}${color[1]}${color[1]}`;
                        break;
                }
            } else if (cmc > 3) {
                let fourSymbols = Random.next(0, 3); // 0 = none, 1 = first symbol twice, 2 = second symbol twice, 3 = both symbol twice.
                switch (fourSymbols) {
                    case 0:
                        manacost = `${Math.min(9, cmc - 2)}${color[0]}${color[1]}`;
                        break;
                    case 1:
                        manacost = `${Math.min(9, cmc - 3)}${color[0]}${color[0]}${color[1]}`;
                        break;
                    case 2:
                        manacost = `${Math.min(9, cmc - 3)}${color[0]}${color[1]}${color[1]}`;
                        break;
                    case 3:
                        manacost = `${color[0]}${color[0]}${color[1]}${color[1]}`;
                        if (cmc > 4) {
                            manacost = `${Math.min(9, cmc - 4)}${manacost}`;
                        }
                        break;
                }
            }
        }

        // Three colors.
        if (color.length === 3) {
            if (cmc === 1) {
                manacost = `${Random.nextFromList(color)}`;
            } else if (cmc === 2) {
                let rnd = Random.next(0, color.length - 2);
                manacost = `${color[rnd]}${color[rnd + 1]}`;
            } else if (cmc === 3) {
                manacost = `${color[0]}${color[1]}${color[2]}`;
            } else if (cmc > 3) {
                manacost = `${Math.min(9, cmc - 3)}${color[0]}${color[1]}${color[2]}`;
            }
        }

        // Four colors colors.
        if (color.length === 4) {
            if (cmc === 1) {
                manacost = `${Random.nextFromList(color)}`;
            } else if (cmc === 2) {
                let rnd = Random.next(0, 2);
                manacost = `${color[rnd]}${color[rnd + 1]}`;
            } else if (cmc === 3) {
                let rnd = Random.next(0, 1);
                manacost = `${color[rnd]}${color[rnd + 1]}${color[rnd + 2]}`;
            } else if (cmc === 4) {
                manacost = `${color[0]}${color[1]}${color[2]}${color[3]}`;
            } else if (cmc > 4) {
                manacost = `${Math.min(9, cmc - 4)}${color[0]}${color[1]}${color[2]}${color[3]}`;
            }
        }

        // Five colors colors.
        if (color.length === 5) {
            if (cmc === 1) {
                manacost = `${Random.nextFromList(color)}`;
            } else if (cmc === 2) {
                let rnd = Random.next(0, 3);
                manacost = `${color[rnd]}${color[rnd + 1]}`;
            } else if (cmc === 3) {
                let rnd = Random.next(0, 2);
                manacost = `${color[rnd]}${color[rnd + 1]}${color[rnd + 2]}`;
            } else if (cmc === 4) {
                let rnd = Random.next(0, 1);
                manacost = `${color[rnd]}${color[rnd + 1]}${color[rnd + 2]}${color[rnd + 3]}`;
            } else if (cmc === 5) {
                manacost = `${color[0]}${color[1]}${color[2]}${color[3]}${color[4]}`;
            } else if (cmc > 4) {
                manacost = `${Math.min(9, cmc - 5)}${color[0]}${color[1]}${color[2]}${color[3]}`;
            }
        }

        return manacost;
    }
}