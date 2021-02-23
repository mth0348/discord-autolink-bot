"use strict";
exports.__esModule = true;
exports.Random = void 0;
var Random = (function () {
    function Random() {
    }
    Random.next = function (minInclusive, maxInclusive) {
        return minInclusive + Math.floor(Math.random() * ((maxInclusive - minInclusive) + 1));
    };
    Random.chance = function (number) {
        return Random.next(1, 100) <= number * 100;
    };
    Random.flipCoin = function () {
        return Random.next(0, 1) === 1;
    };
    Random.nextFromList = function (list) {
        return list[Random.next(0, list.length - 1)];
    };
    Random.complex = function (chances, fallback) {
        var found = false;
        var foundValue = fallback;
        chances.sort(function (a, b) { return b.chance - a.chance; }).forEach(function (chanceSet) {
            if (!found && Random.chance(chanceSet.chance)) {
                found = true;
                foundValue = chanceSet.value;
            }
        });
        return foundValue;
    };
    return Random;
}());
exports.Random = Random;
//# sourceMappingURL=Random.js.map