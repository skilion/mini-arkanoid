/// <reference path="pixi.js.d.ts"/>
/// <reference path="howler.d.ts"/>
/// <reference path="load.ts"/>
var HitResult;
(function (HitResult) {
    HitResult[HitResult["none"] = 0] = "none";
    HitResult[HitResult["vertical"] = 1] = "vertical";
    HitResult[HitResult["horizontal"] = 2] = "horizontal";
})(HitResult || (HitResult = {}));
// margin = nubmer of pixels to not take in consideration
function hitTest(a, b, margin) {
    if (margin === void 0) { margin = 0; }
    if (a.visible == false || b.visible == false)
        return HitResult.none;
    var axMax = a.x + a.width;
    var axMin = a.x;
    var bxMax = b.x + b.width;
    var bxMin = b.x;
    var ayMax = a.y + a.height;
    var ayMin = a.y;
    var byMax = b.y + b.height;
    var byMin = b.y;
    var xd1 = bxMin - axMax;
    var xd2 = axMin - bxMax;
    var yd1 = byMin - ayMax;
    var yd2 = ayMin - byMax;
    if (xd1 < 0 && xd2 < margin) {
        var xd = Math.max(xd1, xd2);
        if (yd1 < 0 && yd2 < margin) {
            var yd = Math.max(yd1, yd2);
            if (xd > yd)
                return HitResult.horizontal;
            else
                return HitResult.vertical;
        }
    }
    return HitResult.none;
}
var SoundType;
(function (SoundType) {
    SoundType[SoundType["brickHit"] = 0] = "brickHit";
    SoundType[SoundType["barHit"] = 1] = "barHit";
})(SoundType || (SoundType = {}));
function playSound(soundType) {
    switch (soundType) {
        case SoundType.barHit:
            sounds[randInt(SoundAssets.barHit1, SoundAssets.barHit2 + 1)].play();
            break;
        case SoundType.brickHit:
            sounds[randInt(SoundAssets.hit1, SoundAssets.hit4 + 1)].play();
            break;
    }
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
