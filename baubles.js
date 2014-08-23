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

var stage;
var shooter;

function init(ev) {
    var screen = document.getElementById("screen");
    stage = new createjs.Stage(screen);
    shooter = new Shooter();

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

    var shtr= this;
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
