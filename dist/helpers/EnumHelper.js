"use strict";
exports.__esModule = true;
exports.EnumHelper = void 0;
var CsGoParamType_1 = require("../dtos/csgo/CsGoParamType");
var MtgCardRarity_1 = require("../dtos/mtg/MtgCardRarity");
var MtgCardType_1 = require("../dtos/mtg/MtgCardType");
var StringHelper_1 = require("./StringHelper");
var EnumHelper = (function () {
    function EnumHelper() {
    }
    EnumHelper.toString = function (enumValue) {
        return enumValue.toString();
    };
    EnumHelper.toMtgCardRarity = function (enumString) {
        return MtgCardRarity_1.MtgCardRarity[StringHelper_1.StringHelper.toCamelCase(enumString)];
    };
    EnumHelper.toMtgCardType = function (enumString) {
        return MtgCardType_1.MtgCardType[StringHelper_1.StringHelper.toCamelCase(enumString)];
    };
    EnumHelper.toCsGoParamType = function (enumString) {
        return CsGoParamType_1.CsGoParamType[StringHelper_1.StringHelper.toCamelCase(enumString)];
    };
    return EnumHelper;
}());
exports.EnumHelper = EnumHelper;
//# sourceMappingURL=EnumHelper.js.map