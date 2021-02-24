"use strict";
exports.__esModule = true;
exports.CsGoDataRepository = void 0;
var CsGoVideo_1 = require("../entities/csgo/CsGoVideo");
var database = require("../../assets/data/csgo.json");
var CsGoDataRepository = (function () {
    function CsGoDataRepository() {
    }
    CsGoDataRepository.prototype.getAll = function () {
        return database.map(function (x) { return new CsGoVideo_1.CsGoVideo(x); });
    };
    return CsGoDataRepository;
}());
exports.CsGoDataRepository = CsGoDataRepository;
//# sourceMappingURL=CsGoDataRepository.js.map