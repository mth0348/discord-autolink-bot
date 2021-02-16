import { Collection } from 'discord.js';
export class MtgColorPie {
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
}