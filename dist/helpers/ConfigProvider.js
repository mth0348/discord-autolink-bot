"use strict";
exports.__esModule = true;
exports.ConfigProvider = void 0;
var config = require("../config.json");
var ConfigProvider = (function () {
    function ConfigProvider() {
    }
    ConfigProvider.current = function () {
        return config;
    };
    return ConfigProvider;
}());
exports.ConfigProvider = ConfigProvider;
//# sourceMappingURL=ConfigProvider.js.map