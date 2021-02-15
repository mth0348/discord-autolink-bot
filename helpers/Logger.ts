export class Logger {
    public static enabled: boolean;

    public static log(text: string) {
        if (this.enabled) {
            console.log(text);
        }
    }
}