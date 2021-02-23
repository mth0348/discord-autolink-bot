"use strict";
exports.__esModule = true;
exports.ParameterService = void 0;
var Parameter_1 = require("../dtos/Parameter");
var StringHelper_1 = require("../helpers/StringHelper");
var ParameterService = (function () {
    function ParameterService() {
    }
    ParameterService.prototype.extractParameters = function (text, configs) {
        var _this = this;
        var params = text.split(" ").slice(1);
        var result = [];
        params.forEach(function (param) {
            var paramParts = param.trim().split(":");
            if (paramParts.length <= 1)
                paramParts = param.trim().split("=");
            if (paramParts.length === 2) {
                var paramName_1 = paramParts[0].trim();
                var paramValue_1 = paramParts[1].trim();
                configs.forEach(function (config) {
                    var isNameMatch = _this.isNameMatch(config, paramName_1);
                    var isValueAllowed = _this.isValueAllowed(config, paramValue_1);
                    if (isNameMatch && isValueAllowed) {
                        if (!result.some(function (r) { return r.name === config.parameterName; })) {
                            result.push(new Parameter_1.Parameter(config.parameterName, paramValue_1));
                        }
                    }
                });
            }
            else if (paramParts.length === 1 && StringHelper_1.StringHelper.isEqualIgnoreCase(paramParts[0].trim(), "help")) {
                result.push(new Parameter_1.Parameter("help", "help"));
            }
        });
        return result;
    };
    ParameterService.prototype.tryGetParameterValue = function (parameterName, parameters) {
        var foundParameter;
        parameters.forEach(function (p) {
            if (StringHelper_1.StringHelper.isEqualIgnoreCase(p.name, parameterName)) {
                foundParameter = p;
            }
        });
        return foundParameter === null || foundParameter === void 0 ? void 0 : foundParameter.value;
    };
    ParameterService.prototype.isNameMatch = function (config, paramName) {
        return StringHelper_1.StringHelper.isEqualIgnoreCase(config.parameterName, paramName)
            || StringHelper_1.StringHelper.isEqualIgnoreCase(config.alternativeName, paramName);
    };
    ParameterService.prototype.isValueAllowed = function (config, paramValue) {
        if (config.validParameterValues === null)
            return true;
        return config.validParameterValues.some(function (c) { return StringHelper_1.StringHelper.isEqualIgnoreCase(c, paramValue); });
    };
    return ParameterService;
}());
exports.ParameterService = ParameterService;
//# sourceMappingURL=ParameterService.js.map