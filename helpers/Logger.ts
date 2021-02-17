import { LogType } from "../dtos/LogType";

export class Logger {

    public static enabledTypes: LogType[] = [LogType.Verbose, LogType.CostEstimation];

    public static log(text: string, type: LogType = LogType.Verbose, args: any = undefined) {
        if (this.enabledTypes.some(t => t === type)) {
            if (args) {
                console.log(text, args);
            } else {
                console.log(text);
            }
        }
    }
}