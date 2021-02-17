import { GuildAuditLogsEntry } from "discord.js";
import { LogType } from "../dtos/LogType";

export class Logger {

    private static logStack: any[] = [];

    public static enabledTypes: LogType[] = [LogType.Verbose, LogType.CostEstimation];

    public static log(text: string, type: LogType = LogType.Verbose, args: any = undefined) {
        if (this.enabledTypes.some(t => t === type)) {
            if (args) {
                console.log(text, args);
                this.logStack.push(text);
                this.logStack.push(args);
            } else {
                console.log(text);
                this.logStack.push(text);
            }
        }
    }

    public static getStack(): any[] {
        return this.logStack;
    }

    public static clearStack(): void {
        this.logStack = [];
    }
}