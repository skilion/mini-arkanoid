// Mini Arkanoid JS
// Demo to test PixiJS
// Written in TypeScript
/// <reference path="pixi.js.d.ts"/>
/// <reference path="howler.d.ts"/>
/// <reference path="load.ts"/>
/// <reference path="helper.ts"/>
var screenWidth = 1280;
var screenHeight = 720;
var TextureCache = PIXI.utils.TextureCache;
var renderer = new PIXI.WebGLRenderer(screenWidth, screenHeight, { roundPixels: true });
document.body.appendChild(renderer.view);
loadAssets(setup);
// stages
var stage, bricksArea;
// sprites
var ball, bar, bg, gameArea;
var bricks = [];
// text messages
var textAlertStyle = new PIXI.TextStyle({
    align: "center",
    fontFamily: "Arial",
    fontSize: 40,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#F21111', '#F2A90A'],
    stroke: '#4a1850',
    strokeThickness: 0,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6
});
var alertText;
var alertTextLifetime = 0;
// keys indicators
var leftKey, rightKey;
// game indicators
var barMoving;
// game config
var barSpeed = 800;
var ballInitSpeed = 250;
var ballBarSpeedMod = 200;
var alertTextDuration = 2;
var alertTextFadeDuration = 1;
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
    resetBall();
    // create view tree
    stage.addChild(bg);
    stage.addChild(gameArea);
    gameArea.addChild(bricksArea);
    gameArea.addChild(bar);
    gameArea.addChild(ball);
    loadLevel(level1);
    //Capture the keyboard arrow keys
    window.addEventListener("keydown", function (event) {
        if (event.key == "ArrowLeft")
            leftKey = true;
        if (event.key == "ArrowRight")
            rightKey = true;
    }, false);
    window.addEventListener("keyup", function (event) {
        if (event.key == "ArrowLeft")
            leftKey = false;
        if (event.key == "ArrowRight")
            rightKey = false;
    }, false);
    setAlertText("Hello World");
    // Start the game loop
    requestAnimationFrame(gameLoop);
}
var prevTimestamp;
function gameLoop(timestamp) {
    // time management
    if (!prevTimestamp)
        prevTimestamp = timestamp;
    var deltatime = (timestamp - prevTimestamp) / 1000;
    if (deltatime > 1 / 60.0)
        deltatime = 1 / 60.0;
    prevTimestamp = timestamp;
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
    var oldBallX = ball.x;
    var oldBallY = ball.y;
    ball.x += ball.vx * deltatime;
    ball.y += ball.vy * deltatime;
    // ball collision handling
    var hitResult;
    // ball-gameArea collision
    if (ball.x < 0 || ball.x > (gameArea.width - ball.width))
        hitResult = HitResult.horizontal;
    if (ball.y < 0)
        hitResult = HitResult.vertical;
    // ball-bar collision
    var barBallHitResult = hitTest(ball, bar);
    if (barBallHitResult != HitResult.none) {
        hitResult = barBallHitResult;
        playSound(SoundType.barHit);
        // modify ball speed according to bar movement
        if (barMoving) {
            var speedModifier = ballBarSpeedMod * (0.25 * Math.random() + 0.25);
            if (rightKey)
                ball.vx += ballBarSpeedMod;
            else
                ball.vx -= ballBarSpeedMod;
        }
    }
    // ball-brick collision
    for (var _i = 0, bricks_1 = bricks; _i < bricks_1.length; _i++) {
        var brick = bricks_1[_i];
        var brickBallHitResult = hitTest(ball, brick, -3);
        if (brickBallHitResult != HitResult.none) {
            hitResult = brickBallHitResult;
            brick.visible = false;
            playSound(SoundType.brickHit);
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
    renderer.render(stage);
    requestAnimationFrame(gameLoop);
}
function loadLevel(level) {
    for (var i = 0; i < bricks.length; i++) {
        bricks[i].destroy();
        bricksArea.removeChild(bricks[i]);
    }
    bricks = [];
    for (var i = 0; i < 144; i++) {
        var id = level[i];
        if (id != 0) {
            var texture = assets[Assets.brick1 + id - 1];
            var brick = new PIXI.Sprite(TextureCache[texture]);
            brick.x = (i % 12) * 105;
            brick.y = Math.floor(i / 12) * 50;
            bricksArea.addChild(brick);
            bricks.push(brick);
        }
    }
}
function setAlertText(text) {
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
    bar.x = (gameArea.width - bar.width) / 2;
    bar.y = 650;
    ball.x = bar.x + (bar.width + ball.width) / 2;
    ball.y = bar.y - ball.height;
    ball.vx = (Math.random() < 0.5 ? 1 : -1) * ballInitSpeed;
    ball.vy = -ballInitSpeed;
}
