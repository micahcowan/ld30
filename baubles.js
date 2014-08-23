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

function init(ev) {
    gameScreen = document.getElementById("screen");
    stage = new createjs.Stage(gameScreen);
    shooter = new Shooter();
    shot = new Shot();

    STAGE_RIGHT  = gameScreen.width;
    STAGE_BOTTOM = gameScreen.bottom;

    window.addEventListener("keydown",
        function(ev) { shooter.handleKeyDown(ev); });
    window.addEventListener("keyup",
        function(ev) { shooter.handleKeyUp(ev); });

    startGame();
}

function startGame() {
    stage.update();
    createjs.Ticker.addEventListener("tick", stage);
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
    this.shape.rotation = 90;

    stage.addChild(this.shape);

    this.movement = 0;

    this.handleKeyDown = function (ev) {
        if (Shooter.LT_KEYS.indexOf(ev.key) != -1) {
            this.movement = -1;
            ev.preventDefault = true;
        } else if (Shooter.RT_KEYS.indexOf(ev.key) != -1) {
            this.movement = 1;
            ev.preventDefault = true;
        } else if (Shooter.FIRE_KEYS.indexOf(ev.key) != -1) {
            shot.fire();
        }
    }
    this.handleKeyUp   = function (ev) {
        if ((this.movement < 0 && Shooter.LT_KEYS.indexOf(ev.key) != -1) ||
            (this.movement > 0 && Shooter.RT_KEYS.indexOf(ev.key) != -1)) {

            this.movement = 0;
            ev.preventDefault = true;
        }
    }
    this.handleTick    = function (ev) {
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
Shooter.X_POS = 200;
Shooter.Y_POS = 550;
Shooter.LENGTH = 100;
Shooter.ROT_MIN = 45;
Shooter.ROT_MAX = 135;
// How far shooter can rotate by keypress in one second:
Shooter.MOVE_RATE = Shooter.ROT_MAX - Shooter.ROT_MIN;
Shooter.LT_KEYS = ['a', 'A', 'ArrowLeft', 'Left'];
Shooter.RT_KEYS = ['d', 'D', 'ArrowRight', 'Right'];
Shooter.FIRE_KEYS = [' ', 'Space', 'Enter', 'Return'];

function Shot() {
    var sht = this;
    var s = sht.shape = new createjs.Shape;
    var g = s.graphics;
    g.beginStroke("black").beginFill("#ffccaa").drawCircle(0,0,15).endStroke();
    s.visible = false;
    stage.addChild(s);

    sht.fired = false;

    // Called as function: don't use "this".
    this.handleTick = function(ev) {
        s.x += sht.h * ev.delta / 1000.0;
        s.y += sht.v * ev.delta / 1000.0;

        if (s.y < STAGE_TOP || s.y > STAGE_BOTTOM) {
            // Destruction
            createjs.Ticker.removeEventListener("tick", this.handleTick);
            s.visible = false;
            sht.fired = false;
        }
        if (s.x < STAGE_LEFT) {
            s.x  = STAGE_LEFT;
            sht.h = -sht.h;
        }
        else if (s.x > STAGE_RIGHT) {
            s.x = STAGE_RIGHT;
            sht.h = -sht.h;
        }
    }
    this.fire = function(ev) {
        if (sht.fired) return;

        s.x = Shooter.X_POS;
        s.y = Shooter.Y_POS;
        // Horiz and vertical speeds.
        sht.h = Shot.SPEED * Math.cos((180.0 - shooter.shape.rotation) * Math.PI / 180);
        sht.v = Shot.SPEED * Math.sin(-shooter.shape.rotation * Math.PI / 180);
        s.visible = true;
        sht.fired = true;

        createjs.Ticker.addEventListener("tick", this.handleTick);
    }
}
Shot.SPEED = 500;

var STAGE_LEFT = 0;
var STAGE_TOP = 0;
var STAGE_RIGHT;
var STAGE_BOTTOM;
