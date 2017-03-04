// Mini Arkanoid JS
// Demo to test PixiJS
// Written in TypeScript

/// <reference path="pixi.js.d.ts"/>
/// <reference path="load.ts"/>
/// <reference path="helper.ts"/>

let screenWidth = 1280;
let screenHeight = 720;

let TextureCache = PIXI.utils.TextureCache;
let renderer = new PIXI.WebGLRenderer(screenWidth, screenHeight, {roundPixels: true});

document.body.appendChild(renderer.view);

loadAssets(setup);

// stages
let stage, bricksArea: PIXI.Container;

// sprites
let ball, bar, bg, gameArea: PIXI.Sprite;
let bricks: PIXI.Sprite[] = [];

// keys indicators
let leftKey, rightKey: boolean;

// game config
const barSpeed = 800;
const ballInitSpeed = 250;
const ballBarSpeedMod = 200;

function setup() {
	// containers
	stage = new PIXI.Container();
	bricksArea = new PIXI.Container();

	// sprites
	ball = new PIXI.Sprite(TextureCache[assets[Assets.ball]]);
	bar = new PIXI.Sprite(TextureCache[assets[Assets.bar]]);
	bg = new PIXI.Sprite(TextureCache[assets[Assets.bg]]);
	gameArea = new PIXI.Sprite(TextureCache[assets[Assets.gameArea]]);

	// initial positions
	gameArea.x = gameArea.y = 10;
	bar.x = (gameArea.width - bar.width) / 2;
	bar.y = 650;
	ball.x = bar.x + (bar.width + ball.width) / 2;
	ball.y = bar.y - ball.height;
	ball.vx = (Math.random() < 0.5 ? 1 : -1) * ballInitSpeed;
	ball.vy = -ballInitSpeed;

	// create view tree
	stage.addChild(bg);
	stage.addChild(gameArea);
	gameArea.addChild(bricksArea);
	gameArea.addChild(bar);
	gameArea.addChild(ball);

	loadLevel(level1);

	//Capture the keyboard arrow keys
	window.addEventListener("keydown", function(event: KeyboardEvent) {
		if (event.key == "ArrowLeft") leftKey = true;
		if (event.key == "ArrowRight") rightKey = true;
	}, false);
	window.addEventListener("keyup", function(event: KeyboardEvent) {
		if (event.key == "ArrowLeft") leftKey = false;
		if (event.key == "ArrowRight") rightKey = false;
	}, false);

	// Start the game loop
	requestAnimationFrame(gameLoop);
}

let prevTimestamp: number;
function gameLoop(timestamp: number) {
	// time management
	if (!prevTimestamp) prevTimestamp = timestamp;
	let deltatime = (timestamp - prevTimestamp) / 1000;
	if (deltatime > 1 / 60.0) deltatime = 1 / 60.0;
	prevTimestamp = timestamp;

	// set bar speed
	if (leftKey) bar.vx -= barSpeed;
	if (rightKey) bar.vx += barSpeed;
	if (leftKey == rightKey) bar.vx = 0;

	// move player bar
	if (leftKey) bar.x -= barSpeed * deltatime;
	if (rightKey) bar.x += barSpeed * deltatime;
	if (bar.x < 0) bar.x = 0;
	if (bar.x > (gameArea.width - bar.width)) bar.x = gameArea.width - bar.width;

	// move ball
	let oldBallX = ball.x;
	let oldBallY = ball.y;
	ball.x += ball.vx * deltatime;
	ball.y += ball.vy * deltatime;

	// ball collision handling
	let hitResult: HitResult;
	// ball-gameArea collision
	if (ball.x < 0 || ball.x > (gameArea.width - ball.width)) hitResult = HitResult.horizontal;
	if (ball.y < 0 || ball.y > (gameArea.height - ball.height)) hitResult = HitResult.vertical;
	// ball-bar collision
	let barBallHitResult = hitTest(ball, bar);
	if (barBallHitResult != HitResult.none) {
		hitResult = barBallHitResult;
		// modify ball speed according to bar movement
		let speedModifier = ballBarSpeedMod * (0.25 * Math.random() + 0.25);
		if (bar.vx > 0) ball.vx += ballBarSpeedMod;
		else ball.vx -= ballBarSpeedMod;
	}
	// ball-brick collision
	for (let brick of bricks) {
		let brickBallHitResult = hitTest(ball, brick);
		if (brickBallHitResult != HitResult.none) {
			hitResult = brickBallHitResult;
			brick.visible = false;
		}
	}
	// handle collision
	switch (hitResult) {
	case HitResult.horizontal:
		ball.x = oldBallX;
		ball.vx = -ball.vx;
		break;
	case HitResult.vertical:
		ball.y = oldBallY;
		ball.vy = -ball.vy;
		break;
	}

	renderer.render(stage);
	requestAnimationFrame(gameLoop);
}

function loadLevel(level: number[]) {
	for (let i = 0; i < bricks.length; i++) {
		bricks[i].destroy();
		bricksArea.removeChild(bricks[i]);
	}
	bricks = [];
	for (let i = 0; i < 144; i++) {
		let id = level[i];
		if (id != 0) {
			let texture = assets[Assets.brick1 + id - 1];
			let brick = new PIXI.Sprite(TextureCache[texture]);
			brick.x = (i % 12) * 105;
			brick.y = Math.floor(i / 12) * 50;
			bricksArea.addChild(brick);
			bricks.push(brick);
		}
	}
}