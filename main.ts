// Mini Arkanoid JS
// Demo to test PixiJS
// Written in TypeScript

/// <reference path="pixi.js.d.ts"/>
/// <reference path="howler.d.ts"/>
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
let bar, bg, gameArea: PIXI.Sprite;
let bricks: PIXI.Sprite[] = [];
let ball: PIXI.Graphics; // the ball is a Graphic obj so the color can be changed dinamically
let trace: PIXI.Graphics[] = [];

// text messages
let textAlertStyle = new PIXI.TextStyle({
		align: "center",
		fontFamily: "Arial",
		fontSize: 40,
		fontStyle: 'italic',
		fontWeight: 'bold',
		fill: ['#F21111', '#F2A90A'], // gradient
		stroke: '#4a1850',
		strokeThickness: 0,
		dropShadow: true,
		dropShadowColor: "#000000",
		dropShadowBlur: 4,
		dropShadowAngle: Math.PI / 6,
		dropShadowDistance: 6
	});
let alertText: PIXI.Text;
let alertTextLifetime = 0;

// keys indicators
let leftKey, rightKey: boolean;

// game indicators
let ready: boolean;
let barMoving: boolean;
let ballReactionTime: number; // time for which the ball change color and wobble

// game config
const barSpeed = 800;
const ballInitSpeed = 250;
const ballSpeedAcceleration = 10;
const ballBarSpeedMod = 200;
const alertTextDuration = 2;
const alertTextFadeDuration = 1;
const ballReactionTimeDuration = 0.3;
const traceLength = 10;
const traceDelay = 0.015;

function setup() {
	// containers
	stage = new PIXI.Container();
	bricksArea = new PIXI.Container();

	// sprites
	bar = new PIXI.Sprite(TextureCache[assets[Assets.bar]]);
	bg = new PIXI.Sprite(TextureCache[assets[Assets.bg]]);
	gameArea = new PIXI.Sprite(TextureCache[assets[Assets.gameArea]]);

	// create the ball (a white rectangle)
	ball = new PIXI.Graphics();
	ball.beginFill(0xFFFFFF);
	ball.drawRect(0, 0, 25, 25);
	ball.endFill();
	ball.tint = 0xFF3300;
	for (let i = 0; i < traceLength; i++) {
		trace.push(ball.clone());
		ball.tint = 0xFF3300;
		trace[i].alpha = (traceLength - i) / traceLength;
	}

	// initial positions
	gameArea.x = gameArea.y = 10;
	resetBall();

	// create view tree
	stage.addChild(bg);
	stage.addChild(gameArea);
	gameArea.addChild(bricksArea);
	gameArea.addChild(bar);
	for (let i = traceLength - 1; i > 0; i--) gameArea.addChild(trace[i]);
	gameArea.addChild(ball);

	loadLevel(level1);

	//Capture the keyboard arrow keys
	window.addEventListener("keydown", function(event: KeyboardEvent) {
		if (event.key == "ArrowLeft") leftKey = true;
		if (event.key == "ArrowRight") rightKey = true;
		if (event.key == "ArrowUp") ready = true;
	}, false);
	window.addEventListener("keyup", function(event: KeyboardEvent) {
		if (event.key == "ArrowLeft") leftKey = false;
		if (event.key == "ArrowRight") rightKey = false;
	}, false);

	setAlertText("Mini Arkanoid");

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

	// wait till the player press up
	if (!ready) {
		renderer.render(stage);
		requestAnimationFrame(gameLoop);
		return;
	}

	// move player bar
	barMoving = false;
	if (leftKey) {
		bar.x -= barSpeed * deltatime;
		barMoving = true;
	}
	if (rightKey) {
		bar.x += barSpeed * deltatime;
		barMoving = true;
	}
	if (bar.x < 0) {
		bar.x = 0;
		barMoving = false;
	}
	if (bar.x > (gameArea.width - bar.width)) {
		bar.x = gameArea.width - bar.width;
		barMoving = false;
	}

	// move ball
	let oldBallX = ball.x;
	let oldBallY = ball.y;
	ball.x += ball.vx * deltatime;
	ball.y += ball.vy * deltatime;

	// ball collision handling
	let hitResult = HitResult.none;
	// ball-gameArea collision
	if (ball.x < 0 || ball.x > (gameArea.width - ball.width)) hitResult = HitResult.horizontal;
	if (ball.y < 0) hitResult = HitResult.vertical;
	// ball-bar collision
	let barBallHitResult = hitTest(ball, bar);
	if (barBallHitResult != HitResult.none) {
		hitResult = barBallHitResult;
		playSound(SoundType.barHit);
		// modify ball speed according to bar movement
		if (barMoving) {
			let speedModifier = ballBarSpeedMod * (0.25 * Math.random() + 0.25);
			if (rightKey) ball.vx += ballBarSpeedMod;
			else ball.vx -= ballBarSpeedMod;
		}
	}
	// ball-brick collision
	for (let brick of bricks) {
		let brickBallHitResult = hitTest(ball, brick, -3);
		if (brickBallHitResult != HitResult.none) {
			hitResult = brickBallHitResult;
			brick.visible = false;
			playSound(SoundType.brickHit);
		}
	}

	updateTrace(deltatime);

	// handle collision
	if (hitResult != HitResult.none)  {
		ballHitEffect();
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
	}

	// increase ball speed
	if (ball.vy > 0) ball.vy += ballSpeedAcceleration * deltatime;

	// alert text
	if (alertTextLifetime > 0) {
		if (alertTextLifetime <= alertTextFadeDuration) {
			alertText.alpha = alertTextLifetime / alertTextFadeDuration;
		}
		alertTextLifetime -= deltatime;
	}

	// game lost handling
	if (ball.y > gameArea.height) {
		resetBall();
		setAlertText(gameLostMsg[Math.floor(Math.random() * gameLostMsg.length)]);
	}

	updateBallAspect(deltatime);

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

function setAlertText(text: string) {
	if (alertText) {
		stage.removeChild(alertText);
		alertText.destroy();
	}
	alertText = new PIXI.Text(text, textAlertStyle);
	alertText.anchor.x = 0.5;
	alertText.x = 640;
	alertText.y = 30;
	alertTextLifetime = alertTextDuration + alertTextFadeDuration;
	stage.addChild(alertText);
}

function resetBall() {
	ready = false;
	bar.x = (gameArea.width - bar.width) / 2;
	bar.y = 650;
	ball.x = bar.x + (bar.width + ball.width) / 2
	ball.y = bar.y - ball.height;
	ball.vx = (Math.random() < 0.5 ? 1 : -1) * ballInitSpeed;
	ball.vy = -ballInitSpeed;
	ballReactionTime = 0;
	resetTrace();
}

function updateBallAspect(deltatime: number) {
	if (ballReactionTime > 0) {
		let effect = 1 - (Math.cos(ballReactionTime * Math.PI * 8) * 0.5 + 0.5);
		//ball.scale.set(1 + (effect * 0.25));
		let g = 0x33 + Math.round(effect * (0xFF - 0x33));
		let b = Math.round(effect * 0xFF);
		ball.tint = 0xFF0000 | (g << 8) | b;
		ballReactionTime -= deltatime;
	}
}

function ballHitEffect() {
	ballReactionTime = ballReactionTimeDuration;
}

let traceTime = 0;
function updateTrace(deltatime: number) {
	traceTime -= deltatime;
	if (traceTime <= 0) {
		for (let i = traceLength - 1; i > 0; i--) {
			trace[i].x = trace[i - 1].x;
			trace[i].y = trace[i - 1].y;
			trace[i].tint = trace[i - 1].tint;
		}
		trace[0].x = ball.x;
		trace[0].y = ball.y;
		trace[0].tint = ball.tint;
		traceTime = traceDelay;
	}
}

function resetTrace() {
	for (let a of trace) {
		a.x = ball.x;
		a.y = ball.y;
	}
}