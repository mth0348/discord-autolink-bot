"use strict";
exports.__esModule = true;
exports.Logger = void 0;
var LogType_1 = require("../dtos/LogType");
var Logger = (function () {
    function Logger() {
    }
    Logger.log = function (text, type, args) {
        if (type === void 0) { type = LogType_1.LogType.Verbose; }
        if (args === void 0) { args = undefined; }
        if (this.enabledTypes.some(function (t) { return t === type; })) {
            if (args) {
                console.log(type + " " + text, args);
            }
            else {
                console.log(type + " " + text);
            }
        }
        this.logStack.push(type + " " + text);
        if (args)
            this.logStack.push(args);
    };
    Logger.getStack = function () {
        return this.logStack;
    };
    Logger.clearStack = function () {
        this.logStack = [];
    };
    Logger.logStack = [];
    Logger.enabledTypes = [LogType_1.LogType.Verbose, LogType_1.LogType.Warning];
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map