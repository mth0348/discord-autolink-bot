import { Collection } from 'discord.js';
import { Random } from '../Random';
export class MtgHelper {
    private static wubrgLUT = new Collection<string, number>([
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
        ["w", 0],
        ["u", 1],
        ["b", 2],
        ["r", 3],
        ["g", 4],
    ]);

    public static sortWubrg(text: string): string {
        return text.split('').sort((a, b) => { return this.wubrgLUT.get(a) - this.wubrgLUT.get(b); }).join("");
    }

    

    public static getRandomManacost(cmc: number, colorString: string): string {
        const manacost = this.getRandomManacostWithoutX(cmc, colorString);
        return "X" + MtgHelper.sortWubrg(manacost).split("").join("X");
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

        // More than two colors.
        if (color.length >= 3) {
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

        return manacost;
    }
}