export class StringHelper {

    private static ignores = "the";

    public static toCamelCase(input: string): string {
        const words = input.split(" ");
        words.forEach((w, i) => {
            if (this.ignores.indexOf(w) === -1) {
                words[i] = this.capitalizeFirstChar(w);
            }
        });
        return words.join(" ");
    }

    public static startsWith(text: string, find: string): boolean {
        return text.indexOf(find) === 0;
    }

    public static isEqualIgnoreCase(s1: string, s2: string): boolean {
        return s1.toLowerCase() === s2.toLowerCase();
    }

    public static regexIndexOf(text: string, regex: RegExp, startpos = 0) {
        var indexOf = text.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    public static removeDuplicateChars(text: string) {
        return text.replace(/(.)(?=.*\1)/g, "");
    }

    public static capitalizeFirstChar(word: string) {
        return word.substr(0, 1).toUpperCase() + word.substr(1);
    }

    public static lowercaseFirstChar(word: string) {
        return word.substr(0, 1).toLowerCase() + word.substr(1);
    }

}