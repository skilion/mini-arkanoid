/// <reference path="pixi.js.d.ts"/>
/// <reference path="howler.d.ts"/>
var Assets;
(function (Assets) {
    Assets[Assets["ball"] = 0] = "ball";
    Assets[Assets["bar"] = 1] = "bar";
    Assets[Assets["bg"] = 2] = "bg";
    Assets[Assets["brick1"] = 3] = "brick1";
    Assets[Assets["brick2"] = 4] = "brick2";
    Assets[Assets["brick3"] = 5] = "brick3";
    Assets[Assets["gameArea"] = 6] = "gameArea";
})(Assets || (Assets = {}));
var SoundAssets;
(function (SoundAssets) {
    SoundAssets[SoundAssets["barHit1"] = 0] = "barHit1";
    SoundAssets[SoundAssets["barHit2"] = 1] = "barHit2";
    SoundAssets[SoundAssets["hit1"] = 2] = "hit1";
    SoundAssets[SoundAssets["hit2"] = 3] = "hit2";
    SoundAssets[SoundAssets["hit3"] = 4] = "hit3";
    SoundAssets[SoundAssets["hit4"] = 5] = "hit4";
})(SoundAssets || (SoundAssets = {}));
var assets = [
    "sprites/ball.png",
    "sprites/bar.png",
    "sprites/bg.png",
    "sprites/brick1.png",
    "sprites/brick2.png",
    "sprites/brick3.png",
    "sprites/game_area.png"
];
var soundAssets = [
    "sounds/bar_hit1.wav",
    "sounds/bar_hit2.wav",
    "sounds/hit1.wav",
    "sounds/hit2.wav",
    "sounds/hit3.wav",
    "sounds/hit4.wav"
];
var sounds = [];
var gameLostMsg = [
    "Loser!",
    "Uff!",
    "Be faster!",
    "My grandma plays better!",
    "Maybe next time, loser!",
    "Let someone else play!"
];
function loadAssets(callback) {
    for (var _i = 0, soundAssets_1 = soundAssets; _i < soundAssets_1.length; _i++) {
        var soundFile = soundAssets_1[_i];
        var sound = new Howl({ src: [soundFile] });
        sounds.push(sound);
    }
    PIXI.loader
        .add(assets)
        .load(callback);
}
var emptyGame = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];
var level1 = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];
