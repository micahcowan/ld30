/*
     baubles.js

   Friendly Baubles
   
   This is the main entry point for the game Friendly Baubles, an entry
   for the 30th Ludum Dare 48-hour game programming challenge, whose
   theme was "Connected Worlds".


   This file and all its contents are
   Copyright 2014 Micah J Cowan.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, version 3.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   See <http://www.gnu.org/licenses/> for details of the GNU GPL version 3.
*/

var gameScreen;
var stage;
var shooter;
var shot;
var world;

var music;

var tContainer;
var tContent;

function init(ev) {
    gameScreen = document.getElementById("screen");
    stage = new createjs.Stage(gameScreen);
    shooter = new Shooter();
    shot = new Shot();
    world = new World(0);

    STAGE_RIGHT  = gameScreen.width;
    STAGE_BOTTOM = gameScreen.height;

    window.addEventListener("keydown",
        function(ev) { shooter.handleKeyDown(ev); }, false);
    window.addEventListener("keyup",
        function(ev) { shooter.handleKeyUp(ev); }, false);

    createjs.Ticker.maxDelta = 200;

    tContainer = document.getElementById("tContainer");
    tContainer.style.left = gameScreen.offsetLeft + 'px';
    tContainer.style.top = gameScreen.offsetTop + 'px';
    tContainer.style.height = gameScreen.offsetHeight + 'px';
    tContainer.style.width = gameScreen.offsetWidth + 'px';
    tContent = document.getElementById("tContent");

    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.addEventListener("fileload", playMusic);
    createjs.Sound.registerSound("friendly-ditty.mp3", "music");
    createjs.Sound.registerSound("shoot.mp3", "shoot");

    startGame();
}

function playMusic(event) {
    if (event.id == "music" && music === undefined) {
        music = createjs.Sound.play("music", {loop: -1});
        music.volume = 0.5;
    }
}

function startGame() {
    stage.update();
    createjs.Ticker.addEventListener("tick", stage);
}

// Finds the right property to look up key names.
function getKProp(ev) {
    var k = ev.key;
    if (k === undefined) {
        k = ev.keyIdentifier;
    }
    return k;
}

// idx: Index into which actor in this world should say something
function saySomething(idx) {
    var thing = worlds[world.whichWorld][1][idx];
    createjs.Ticker.setPaused(true);
    var t = tContent;
    t.innerHTML = '<b>' + thing[0] + ':</b> ' + thing[1];
    tContainer.style.visibility = 'visible';
}

window.addEventListener("load", init);

// Class defs

function Shooter() {
    this.graphics   = new createjs.Graphics();
    this.shape      = new createjs.Shape(this.graphics);
    var g = this.graphics;

    // Base graphic draws shooter pointing to left, uses rotation to
    // adjust direction.
    g.setStrokeStyle(5);
    g.beginStroke("silver").moveTo(0,0).lineTo(-Shooter.LENGTH,0);
    g.beginStroke("black").moveTo(0,0).lineTo(-Shooter.LENGTH * 0.75,0);
    g.closePath();

    this.shape.x = Shooter.X_POS;
    this.shape.y = Shooter.Y_POS;
    this.shape.rotation = 90; // straight "up"

    stage.addChild(this.shape);

    this.movement = 0;

    this.handleKeyDown = function (ev) {
        var k = getKProp(ev);
        if (createjs.Ticker.getPaused()) {
            createjs.Ticker.setPaused(false);
            tContainer.style.visibility = 'hidden';
            shot.unfire();
        }

        if (Shooter.LT_KEYS.indexOf(k) != -1) {
            this.movement = -1;
            ev.preventDefault = true;
        } else if (Shooter.RT_KEYS.indexOf(k) != -1) {
            this.movement = 1;
            ev.preventDefault = true;
        } else if (Shooter.FIRE_KEYS.indexOf(k) != -1) {
            shot.fire();
        }
    }
    this.handleKeyUp   = function (ev) {
        var k = getKProp(ev);
        if ((this.movement < 0 && Shooter.LT_KEYS.indexOf(k) != -1) ||
            (this.movement > 0 && Shooter.RT_KEYS.indexOf(k) != -1)) {

            this.movement = 0;
            ev.preventDefault = true;
        }
        else if (Shooter.MUSIC_KEYS.indexOf(k) != -1 && music !== undefined) {
            music.pause() || music.resume();
        }
    }
    this.handleTick    = function (ev) {
        if (ev.paused) return;
        var s = this.shape;
        s.rotation += this.movement * (ev.delta / 1000.0) * Shooter.MOVE_RATE;
        if (s.rotation < Shooter.ROT_MIN) {
            s.rotation = Shooter.ROT_MIN;
            //this.movement = -this.movement;
        }
        else if (s.rotation > Shooter.ROT_MAX) {
            s.rotation = Shooter.ROT_MAX;
            //this.movement = -this.movement;
        }
    }

    var shtr = this;
    createjs.Ticker.addEventListener("tick",
        function(ev) { shtr.handleTick(ev); });
}
// Positions relative to screen size
Shooter.X_POS = 200;
Shooter.Y_POS = 550;
Shooter.LENGTH = 100;
Shooter.ROT_MIN = 35;
Shooter.ROT_MAX = 145;
// How far shooter can rotate by keypress in one second:
Shooter.MOVE_RATE = Shooter.ROT_MAX - Shooter.ROT_MIN;
Shooter.LT_KEYS = ['a', 'A', 'ArrowLeft', 'Left', 'U+0041'];
Shooter.RT_KEYS = ['d', 'D', 'ArrowRight', 'Right', 'U+0044'];
Shooter.FIRE_KEYS = [' ', 'Space', 'Enter', 'Return', 'U+0020', 'W', 'w', 'U+0057', 'Up', 'ArrowUp'];
Shooter.MUSIC_KEYS = ['M', 'm', 'U+004D'];

function Shot() {
    var sht = this;
    var s = sht.shape = new createjs.Shape;
    var g = s.graphics;
    g.beginStroke("black").beginFill("#ffddaa").drawCircle(0,0,SHOT_RADIUS)
        .endStroke();

    sht.fired = false;

    // Called as function: don't use "this".
    this.handleTick = function(ev) {
        if (ev.paused) return;
        s.x += sht.h * ev.delta / 1000.0;
        s.y += sht.v * ev.delta / 1000.0;

        if (s.y < STAGE_TOP || s.y > STAGE_BOTTOM) {
            // Destruction
            sht.unfire();
            return;
        }

        if (s.x < STAGE_LEFT) {
            s.x  = STAGE_LEFT;
            sht.h = -sht.h;
        }
        else if (s.x > STAGE_RIGHT) {
            s.x = STAGE_RIGHT;
            sht.h = -sht.h;
        }

        var idx = world.checkCollides(s.x, s.y, SHOT_RADIUS);
        if (idx !== undefined) {
            saySomething(idx);
        }
    }
    this.fire = function(ev) {
        if (sht.fired) return;

        s.x = Shooter.X_POS;
        s.y = Shooter.Y_POS;
        // Horiz and vertical speeds.
        sht.h = Shot.SPEED
            * Math.cos((180.0 - shooter.shape.rotation) * Math.PI / 180);
        sht.v = Shot.SPEED
            * Math.sin(-shooter.shape.rotation * Math.PI / 180);
        stage.addChild(s);
        sht.fired = true;

        createjs.Ticker.addEventListener("tick", this.handleTick);
        var shoot = createjs.Sound.play("shoot");
        shoot.volume = 0.5;
    }
    this.unfire = function() {
            createjs.Ticker.removeEventListener("tick", this.handleTick);
            stage.removeChild(s);
            sht.fired = false;
    }
}
Shot.SPEED = 500;

function World(n) {
    var w = this;
    var c = w.container = new createjs.Container();
    var spriteSheet = new createjs.SpriteSheet({
        images: ["sprites.svg"],
        frames: {
            width: 64,
            height: 64,
            regX: 32,
            regY: 32,
        }
    });
    var shapes = [];
    for (var i=0; i < worldPaths[n].length; ++i) {
        var s = new createjs.Sprite(spriteSheet);
        s.gotoAndStop(i);
        /* s.graphics.beginFill("#668").beginStroke("black")
            .drawCircle(0,0,SHOT_RADIUS); */
        shapes[i] = s;
        //c.addChild(s);
        stage.addChild(s);
    }
    stage.addChild(c);

    this.checkCollides = function(x, y, radius) {
        for (var i=0; i < worldPaths[n].length; ++i) {
            // Pythagorean theorem to find distance between points.
            var distX = x - worldPaths[n][i].x;
            var distY = y - worldPaths[n][i].y;
            var dist = Math.sqrt(distX * distX + distY * distY);
            if (dist < radius + SHOT_RADIUS) {
                return i;
            }
        }
        return undefined;
    }

    this.handleTick = function(ev) {
        if (ev.paused) return;
        for (var i=0; i < worldPaths[n].length; ++i) {
            worldPaths[n][i].advance(ev.delta);
            shapes[i].x = worldPaths[n][i].x;
            shapes[i].y = worldPaths[n][i].y;
        }
    }
    createjs.Ticker.addEventListener("tick", this.handleTick);

    this.whichWorld = n;
}

var STAGE_LEFT = 0;
var STAGE_TOP = 0;
var STAGE_RIGHT;
var STAGE_BOTTOM;

var SHOT_RADIUS = 15;
