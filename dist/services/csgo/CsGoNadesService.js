"use strict";
exports.__esModule = true;
exports.MtgCardService = void 0;
var csgoList = require('./../data/csgo.json');
var Fuse = require('fuse.js');
var MtgCardService = (function () {
    function MtgCardService(csGoDataRepository) {
        this.csGoDataRepository = csGoDataRepository;
        this.mapOptions = { keys: ['map'], threshold: 0.4 };
        this.typeOptions = { keys: ['type'], threshold: 0.4 };
        this.sideOptions = { keys: ['side'], threshold: 0 };
        this.locationOptions = { keys: ['location'], threshold: 0.4, includeScore: true, distance: 25, minMatchCharLength: 0 };
    }
    return MtgCardService;
}());
exports.MtgCardService = MtgCardService;
//# sourceMappingURL=CsGoNadesService.js.map