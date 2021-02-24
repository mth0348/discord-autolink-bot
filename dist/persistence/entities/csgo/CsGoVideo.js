"use strict";
exports.__esModule = true;
exports.CsGoVideo = void 0;
var CsGoVideo = (function () {
    function CsGoVideo(data) {
        this.description = data.description;
        this.map = data.map;
        this.side = data.side;
        this.type = data.type;
        this.location = data.location;
        this.source = data.source;
    }
    CsGoVideo.prototype.toString = function () {
        return this.map + " " + this.type + " " + this.side + " - " + this.location;
    };
    return CsGoVideo;
}());
exports.CsGoVideo = CsGoVideo;
//# sourceMappingURL=CsGoVideo.js.map