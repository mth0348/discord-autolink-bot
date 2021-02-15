export class StringHelper {
    
    private static ignores = "the";

    public static toCamelCase(input: string) : string {
        const words = input.split(" ");
        words.forEach((w, i) => {
            if (this.ignores.indexOf(w) === -1)
                {
                    words[i] = this.camelCaseWord(w);
                }
            });
        return words.join(" ");
    }

    public static startsWith(text: string, find: string) : boolean {
        return text.indexOf(find) === 0;
    }

    private static camelCaseWord(word: string) {
        return word.substr(0, 1).toUpperCase() + word.substr(1);
    }
}