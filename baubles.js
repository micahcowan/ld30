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

"use strict";

var gameScreen;
var stage;
var spriteSheet;
var shooter;
var shot;
var world;
var worldChanger;
var grabbed;

var music;

var tContainer;
var tContent;
var numConsLabel

var backdrop;
var won = false;
var postSay = null;

function setNumCons() {
    if (worldConnections.length == 0) {
        won = true;
        createjs.Ticker.setPaused(true);
        window.alert("Congratulations, you've won!");
    }
    numConsLabel.innerHTML = worldConnections.length;
}

function init(ev) {
    gameScreen = document.getElementById("screen");
    stage = new createjs.Stage(gameScreen);

    numConsLabel = document.getElementById("numConsLabel");
    setNumCons();

    backdrop = new createjs.Shape();
    backdrop.graphics
        .beginRadialGradientFill(["#88a","#446"],[0,1],
                                 200, 200, 128,
                                 200, 300, 600)
        .drawRect(0,0,400,600);
    stage.addChild(backdrop);

    spriteSheet = new createjs.SpriteSheet({
        images: ["sprites.svg"],
        frames: {
            width: 64,
            height: 64,
            regX: 32,
            regY: 32,
        }
    });

    shooter = new Shooter();
    shot = new Shot();
    worldChanger = new WorldChanger();

    STAGE_RIGHT  = gameScreen.width;
    STAGE_BOTTOM = gameScreen.height;

    window.addEventListener("keydown",
        function(ev) { shooter.handleKeyDown(ev); }, false);
    window.addEventListener("keyup",
        function(ev) { shooter.handleKeyUp(ev); }, false);

    createjs.Ticker.maxDelta = 60;

    tContainer = document.getElementById("tContainer");
    tContent = document.getElementById("tContent");

    tContainer.style.left = gameScreen.offsetLeft + 'px';
    tContainer.style.top = gameScreen.offsetTop + 'px';
    tContainer.style.height = gameScreen.offsetHeight + 'px';
    tContainer.style.width = gameScreen.offsetWidth + 'px';

    worldLabel = document.getElementById("worldLabel");

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

function saySomething(phrase) {
    createjs.Ticker.setPaused(true);
    var t = tContent;
    t.innerHTML = phrase;
    tContent.style.visibility = 'visible';
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
        if (won) return;
        if (createjs.Ticker.getPaused()) {
            createjs.Ticker.setPaused(false);
            tContent.style.visibility = 'hidden';
            shot.unfire();
            if (postSay !== null) {
                var fn = postSay;
                postSay = null;
                fn();
            }
        }

        if (Shooter.LT_KEYS.indexOf(k) != -1) {
            this.movement = -1;
            ev.preventDefault();
        }
        else if (Shooter.RT_KEYS.indexOf(k) != -1) {
            this.movement = 1;
            ev.preventDefault();
        }
        else if (Shooter.FIRE_KEYS.indexOf(k) != -1) {
            shot.fire();
            ev.preventDefault();
        }
        else if (Shooter.TALK_KEYS.indexOf(k) != -1) {
            if (!shot.fired)
                shot.shotType = Shot.TYPE_TALK;
        }
        else if (Shooter.GRAB_KEYS.indexOf(k) != -1) {
            if (!shot.fired)
                shot.shotType = Shot.TYPE_GRAB;
        }
        else if (Shooter.CONNECT_KEYS.indexOf(k) != -1) {
            if (!shot.fired)
                shot.shotType = Shot.TYPE_CONNECT;
        }
    }
    this.handleKeyUp   = function (ev) {
        var k = getKProp(ev);
        if ((this.movement < 0 && Shooter.LT_KEYS.indexOf(k) != -1) ||
            (this.movement > 0 && Shooter.RT_KEYS.indexOf(k) != -1)) {

            this.movement = 0;
            ev.preventDefault();
        }
        else if (Shooter.MUSIC_KEYS.indexOf(k) != -1 && music !== undefined) {
            music.pause() || music.resume();
        }
        else if (Shooter.WORLD_KEYS.indexOf(k) != -1) {
            worldChanger.change();
            ev.preventDefault();
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
Shooter.TALK_KEYS = ['T', 't', 'U+0054'];
Shooter.GRAB_KEYS = ['G', 'g', 'U+0047'];
Shooter.CONNECT_KEYS = ['C', 'c', 'U+0043'];
Shooter.WORLD_KEYS = ['Q', 'q', 'U+0051'];

function Shot() {
    var sht = this;
    var s = sht.sprite = new createjs.Sprite(spriteSheet);
    /*
    var s = sht.shape = new createjs.Shape;
    var g = s.graphics;
    g.beginStroke("black").beginFill("#ffddaa").drawCircle(0,0,SHOT_RADIUS)
        .endStroke();

    sht.fired = false;
    */

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

        var idx = worldChanger.checkCollides(s.x, s.y, SHOT_RADIUS);
    }
    this.fire = function(ev) {
        if (sht.fired) return;

        if (!grabbed && sht.shotType == Shot.TYPE_CONNECT)
            sht.shotType = Shot.TYPE_TALK;

        if (sht.shotType == Shot.TYPE_CONNECT) {
            s.gotoAndStop(grabbed.spriteNum);
        }
        else
            s.gotoAndStop(sht.shotType);

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
    this.shotType = Shot.TYPE_TALK;
}
Shot.SPEED = 450;
Shot.TYPE_TALK = 5;
Shot.TYPE_GRAB = 6;
Shot.TYPE_CONNECT = 0;

var STAGE_LEFT = 0;
var STAGE_TOP = 0;
var STAGE_RIGHT;
var STAGE_BOTTOM;

var SHOT_RADIUS = 16;
