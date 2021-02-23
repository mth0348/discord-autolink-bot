"use strict";
exports.__esModule = true;
exports.MtgPermanentEvent = void 0;
var MtgPermanentEvent = (function () {
    function MtgPermanentEvent(data) {
        this.text = data.text;
        this.score = data.score;
        this.colorIdentity = data.colorIdentity;
        this.restrictedTypes = data.restrictedTypes;
        this.noFollowUp = data.noFollowUp;
    }
    return MtgPermanentEvent;
}());
exports.MtgPermanentEvent = MtgPermanentEvent;
//# sourceMappingURL=MtgPermanentEvent.js.map