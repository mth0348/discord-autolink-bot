import { LogType } from "../dtos/LogType";

export class Logger {

    private static logStack: any[] = [];

    public static enabledTypes: LogType[] = [LogType.Verbose, LogType.CostEstimation, LogType.Warning];

    public static log(text: string, type: LogType = LogType.Verbose, args: any = undefined) {
        if (this.enabledTypes.some(t => t === type)) {
            if (args) {
                console.log(type + " " + text, args);
            } else {
                console.log(type + " " + text);
            }
        }

        // push to stack anyway.
        this.logStack.push(type + " " + text);
        if (args) this.logStack.push(args);
    }

    public static getStack(): any[] {
        return this.logStack;
    }

    public static clearStack(): void {
        this.logStack = [];
    }
}