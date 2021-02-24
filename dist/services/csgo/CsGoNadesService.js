"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.CsGoNadesService = void 0;
var Parameter_1 = require("../../dtos/Parameter");
var CsGoParamType_1 = require("../../dtos/csgo/CsGoParamType");
var EnumHelper_1 = require("../../helpers/EnumHelper");
var fuse_js_1 = __importDefault(require("fuse.js"));
var CsGoNadesService = (function () {
    function CsGoNadesService(csGoDataRepository) {
        this.csGoDataRepository = csGoDataRepository;
        this.masterList = this.csGoDataRepository.getAll();
        this.sideOptions = { keys: ["side"], threshold: 0 };
        this.typeOptions = { keys: ["type"], threshold: 0.4 };
        this.mapOptions = { keys: ["map"], threshold: 0.3, minMatchCharLength: 4 };
        this.locationOptions = { keys: ["location"], threshold: 0.5 };
        this.fuseSide = new fuse_js_1["default"](this.masterList, this.sideOptions);
        this.fuseType = new fuse_js_1["default"](this.masterList, this.typeOptions);
        this.fuseMap = new fuse_js_1["default"](this.masterList, this.mapOptions);
    }
    CsGoNadesService.prototype.getForQuery = function (queryString) {
        var _this = this;
        var extractedParams = [];
        var queryParts = queryString.split(" ");
        for (var i = queryParts.length - 1; i >= 0; i--) {
            var part = queryParts[i];
            var paramType = this.decideSearchParamType(part);
            if (paramType !== CsGoParamType_1.CsGoParamType.None) {
                extractedParams.push(new Parameter_1.Parameter(paramType, part));
                queryParts.splice(i, 1);
            }
        }
        ;
        if (queryParts.length > 0) {
            extractedParams.push(new Parameter_1.Parameter(CsGoParamType_1.CsGoParamType.Location, queryParts.join(" ")));
        }
        var results = this.masterList;
        extractedParams.forEach(function (param) {
            var tempFuse = null;
            var paramEnum = EnumHelper_1.EnumHelper.toCsGoParamType(param.name);
            switch (paramEnum) {
                case CsGoParamType_1.CsGoParamType.Side:
                    tempFuse = new fuse_js_1["default"](results, _this.sideOptions);
                    break;
                case CsGoParamType_1.CsGoParamType.Type:
                    tempFuse = new fuse_js_1["default"](results, _this.typeOptions);
                    break;
                case CsGoParamType_1.CsGoParamType.Map:
                    tempFuse = new fuse_js_1["default"](results, _this.mapOptions);
                    break;
                case CsGoParamType_1.CsGoParamType.Location:
                    tempFuse = new fuse_js_1["default"](results, _this.locationOptions);
                    break;
            }
            if (tempFuse !== null) {
                var tempSearched_1 = tempFuse.search(param.value);
                results = results.filter(function (r) { return tempSearched_1.some(function (t) { return t.item === r; }); });
            }
        });
        return results.sort(function (a, b) {
            if (a.map < b.map)
                return -1;
            else if (a.map > b.map)
                return 1;
            if (a.side < b.side)
                return -1;
            else if (a.side > b.side)
                return 1;
            if (a.type < b.type)
                return -1;
            else if (a.type > b.type)
                return 1;
            if (a.location < b.location)
                return -1;
            else if (a.location > b.location)
                return 1;
            return 0;
        });
    };
    CsGoNadesService.prototype.decideSearchParamType = function (part) {
        if (this.fuseSide.search(part).length > 0)
            return CsGoParamType_1.CsGoParamType.Side;
        if (this.fuseType.search(part).length > 0)
            return CsGoParamType_1.CsGoParamType.Type;
        if (this.fuseMap.search(part).length > 0)
            return CsGoParamType_1.CsGoParamType.Map;
        return CsGoParamType_1.CsGoParamType.None;
    };
    return CsGoNadesService;
}());
exports.CsGoNadesService = CsGoNadesService;
//# sourceMappingURL=CsGoNadesService.js.map