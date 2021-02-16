import { LogType } from "../dtos/LogType";

export class Logger {

    public static enabledTypes: LogType[] = [LogType.Verbose, LogType.CostEstimation];

    public static log(text: string, type: LogType = LogType.Verbose) {
        if (this.enabledTypes.some(t => t === type)) {
            console.log(text);
        }
    }
}