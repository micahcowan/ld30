/*
     pathform.js

   Friendly Baubles
   
   This file describes paths that friends in a world can travel.


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

function CirclePathForm(x, y, r) {
    this.centerX = x;
    this.centerY = y;
    this.radius = r;
}
CirclePathForm.prototype = {
    getX: function(pct) {
        return this.centerX + Math.sin(pct * 2.0 * Math.PI) * this.radius;
    }
  , getY: function(pct) {
        return this.centerY + Math.cos(pct * 2.0 * Math.PI) * -this.radius;
    }
};

function Wpath(form, pct, spd) {
    this.form = form;
    this.percent = pct;
    this.speed = spd;
    this.x = form.getX(pct);
    this.y = form.getY(pct);
}
Wpath.prototype = {
    advance: function(delta) {
        var p = this.percent = (this.percent + this.speed * delta/1000.0) % 100.0;
        this.x = this.form.getX(p);
        this.y = this.form.getY(p);
    }
};
