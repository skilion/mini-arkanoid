/// <reference path="pixi.js.d.ts"/>

enum HitResult {
    none,
    vertical,
    horizontal
}

// margin = nubmer of pixels to not take in consideration
function hitTest(a: PIXI.Sprite, b: PIXI.Sprite, margin = 0): HitResult {
    if (a.visible == false || b.visible == false) return HitResult.none;

    let axMax = a.x + a.width;
    let axMin = a.x;
    let bxMax = b.x + b.width;
    let bxMin = b.x;

    let ayMax = a.y + a.height;
    let ayMin = a.y;
    let byMax = b.y + b.height;
    let byMin = b.y;

    let xd1 = bxMin - axMax;
    let xd2 = axMin - bxMax;
    let yd1 = byMin - ayMax;
    let yd2 = ayMin - byMax;

    if (xd1 < 0 && xd2 < margin) {
        let xd = Math.max(xd1, xd2);
        if (yd1 < 0 && yd2 < margin) {
            let yd = Math.max(yd1, yd2);
            if (xd > yd) return HitResult.horizontal;
            else return HitResult.vertical;
        }
    }

    return HitResult.none;
}