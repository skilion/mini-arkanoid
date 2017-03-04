/// <reference path="pixi.js.d.ts"/>
/// <reference path="howler.d.ts"/>

enum Assets {
	ball = 0,
	bar,
	bg,
	brick1,
	brick2,
	brick3,
	gameArea
}

enum SoundAssets {
	barHit1,
	barHit2,
	hit1,
	hit2,
	hit3,
	hit4
}

const assets: string[] = [
	"sprites/ball.png",
	"sprites/bar.png",
	"sprites/bg.png",
	"sprites/brick1.png",
	"sprites/brick2.png",
	"sprites/brick3.png",
	"sprites/game_area.png"
]

const soundAssets: string[] = [
	"sounds/bar_hit1.wav",
	"sounds/bar_hit2.wav",
	"sounds/hit1.wav",
	"sounds/hit2.wav",
	"sounds/hit3.wav",
	"sounds/hit4.wav"
]

var sounds: Howler.Howl[] = [];

const gameLostMsg: string[] = [
	"Loser!",
	"Uff!",
	"Be faster!",
	"My grandma plays better!",
	"Maybe next time, loser!",
	"Let someone else play!"
]

function loadAssets(callback: any) {
	for (let soundFile of soundAssets) {
		let sound = new Howl({ src: [soundFile] });
		sounds.push(sound);
	}
	PIXI.loader
		.add(assets)
		.load(callback);
}

const emptyGame = [
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
]

const level1 = [
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
]