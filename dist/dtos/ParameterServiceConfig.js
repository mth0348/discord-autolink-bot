"use strict";
exports.__esModule = true;
exports.ParameterServiceConfig = void 0;
var ParameterServiceConfig = (function () {
    function ParameterServiceConfig(parameterName, alternativeName, validValues) {
        if (validValues === void 0) { validValues = null; }
        this.parameterName = parameterName;
        this.alternativeName = alternativeName;
        this.validParameterValues = validValues;
    }
    return ParameterServiceConfig;
}());
exports.ParameterServiceConfig = ParameterServiceConfig;
//# sourceMappingURL=ParameterServiceConfig.js.map