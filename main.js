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
var bar, bg, gameArea;
var bricks = [];
var ball; // the ball is a Graphic obj so the color can be changed dinamically
var trace = [];
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
var ready;
var barMoving;
var ballReactionTime; // time for which the ball change color and wobble
var levelNum = 0;
var ballSpeed;
var reverseTime;
// game config
var barSpeed = 800;
var ballInitSpeed = 250;
var ballMaxSpeed = 700;
var ballAcceleration = 10;
var ballBarSpeedMod = 200;
var alertTextDuration = 2;
var alertTextFadeDuration = 1;
var ballReactionTimeDuration = 0.3;
var traceLength = 10;
var traceDelay = 0.015;
var reverseTimeDuration = 7;
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
    for (var i = 0; i < traceLength; i++) {
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
    for (var i = traceLength - 1; i > 0; i--)
        gameArea.addChild(trace[i]);
    gameArea.addChild(ball);
    loadLevel(levelNum);
    //Capture the keyboard arrow keys
    window.addEventListener("keydown", function (event) {
        if (event.key == "ArrowLeft")
            leftKey = true;
        if (event.key == "ArrowRight")
            rightKey = true;
        if (event.key == "ArrowUp")
            ready = true;
    }, false);
    window.addEventListener("keyup", function (event) {
        if (event.key == "ArrowLeft")
            leftKey = false;
        if (event.key == "ArrowRight")
            rightKey = false;
    }, false);
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
    var oldBallX = ball.x;
    var oldBallY = ball.y;
    ball.x += ball.vx * ballSpeed * deltatime;
    ball.y += ball.vy * ballSpeed * deltatime;
    // ball collision handling
    var hitResult = HitResult.none;
    // ball-gameArea collision
    if (ball.x < 0 || ball.x > (gameArea.width - ball.width))
        hitResult = HitResult.horizontal;
    if (ball.y < 0)
        hitResult = HitResult.vertical;
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
    // acelerate ball
    ballSpeed += Math.min(ballAcceleration * deltatime, ballMaxSpeed);
    updateTrace(deltatime);
    // handle collision
    if (hitResult != HitResult.none) {
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
    checkBallBarHit();
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
    // game end handling
    var end = true;
    for (var _a = 0, bricks_2 = bricks; _a < bricks_2.length; _a++) {
        var brick = bricks_2[_a];
        if (brick.visible == true) {
            end = false;
            break;
        }
    }
    if (end) {
        levelNum++;
        if (levelNum == levels.length) {
            alert("You win!");
            return;
        }
        loadLevel(levelNum);
        resetBall();
    }
    updateBallAspect(deltatime);
    renderer.render(stage);
    requestAnimationFrame(gameLoop);
}
function loadLevel(num) {
    setAlertText("Level " + (num + 1));
    var level = levels[num];
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
    ready = false;
    bar.x = (gameArea.width - bar.width) / 2;
    bar.y = 650;
    ball.x = bar.x + (bar.width - ball.width) / 2;
    ball.y = bar.y - ball.height;
    var rad = Math.random() * Math.PI;
    ball.vx = Math.cos(rad);
    ball.vy = -Math.sin(rad);
    ballReactionTime = 0;
    ballSpeed = ballInitSpeed;
    resetTrace();
}
function updateBallAspect(deltatime) {
    if (ballReactionTime > 0) {
        var effect = 1 - (Math.cos(ballReactionTime * Math.PI * 8) * 0.5 + 0.5);
        //ball.scale.set(1 + (effect * 0.25));
        var g = 0x33 + Math.round(effect * (0xFF - 0x33));
        var b = Math.round(effect * 0xFF);
        ball.tint = 0xFF0000 | (g << 8) | b;
        ballReactionTime -= deltatime;
    }
}
function ballHitEffect() {
    ballReactionTime = ballReactionTimeDuration;
}
var traceTime = 0;
function updateTrace(deltatime) {
    traceTime -= deltatime;
    if (traceTime <= 0) {
        for (var i = traceLength - 1; i > 0; i--) {
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
    for (var _i = 0, trace_1 = trace; _i < trace_1.length; _i++) {
        var a = trace_1[_i];
        a.x = ball.x;
        a.y = ball.y;
    }
}
function checkBallBarHit() {
    var hit = hitTest(ball, bar);
    if (hit != HitResult.none) {
        playSound(SoundType.barHit);
        ballHitEffect();
        // modify ball speed according to bar movement
        if (barMoving) {
            var speedModifier = ballBarSpeedMod * (0.25 * Math.random() + 0.25);
            if (rightKey)
                ball.vx += ballBarSpeedMod;
            else
                ball.vx -= ballBarSpeedMod;
        }
        // modify ball direction according to hit positions
        if ((ball.x + ball.width < bar.x) || (ball.x > bar.x + bar.width)) {
            ball.vx = -ball.vx;
        }
        else {
            var x = (ball.x - bar.x + ball.width / 2) / bar.width * 2 - 1;
            x = Math.max(-1, Math.min(x, 1));
            var deg = Math.acos(x);
            var y = Math.sin(deg);
            ball.vx = x;
            ball.vy = -y;
        }
    }
}
function reverseScreen() {
    stage.scale.set(1, -1);
    stage.y = screenHeight;
    reverseTime = reverseTimeDuration;
}
