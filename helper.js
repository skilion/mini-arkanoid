/// <reference path="pixi.js.d.ts"/>
var HitResult;
(function (HitResult) {
    HitResult[HitResult["none"] = 0] = "none";
    HitResult[HitResult["vertical"] = 1] = "vertical";
    HitResult[HitResult["horizontal"] = 2] = "horizontal";
})(HitResult || (HitResult = {}));
function hitTest(a, b) {
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
    if (xd1 < 0 && xd2 < 0) {
        var xd = Math.max(xd1, xd2);
        if (yd1 < 0 && yd2 < 0) {
            var yd = Math.max(yd1, yd2);
            if (xd > yd)
                return HitResult.horizontal;
            else
                return HitResult.vertical;
        }
    }
    return HitResult.none;
}
