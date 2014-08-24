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

// Wrapper around plain numbers, so they act like PathVars.
// Can be called around non-numbers, in which case just returns arg.
function num(n) {
    if (typeof(n) == "number") {
        return new ConstPath(n);
    }
    else {
        return n;
    }
}
DEFAULT_SPEED = num(1.0);

function ConstPath(n) {
    Object.defineProperty(this, 'val', {
        enumerable: true
      , get: function() {
            return n;
        }
    });
    this.clone = function (props) {
        return new ConstPath(n);
    };
}
ConstPath.prototype = {
    advance: function(delta) { return this.val; }
}

var pathBaseProto = {
    cloneFill: ['speed', 'pos']
  , speed: DEFAULT_SPEED
  , pos: 0.0
  , copyProps: function(props) {
        if (props === undefined)
            props = {}
        var pkeys = Object.keys(props);
        for (var i=0; i < pkeys.length; ++i) {
            var k = pkeys[i];
            if (pkeys[i] == 'pos') {
                this[k] = props[k];
            }
            else {
                this[k] = num(props[k])
            }
        }
    }
  , advance: function(delta) {
        this.pos = (this.pos + this.speed.val * delta/1000.0) % 100.0;
    }
  , clone: function(props) {
        pnams = this.cloneFill;
        var nProps = {};
        var pkeys = Object.keys(props);
        for (var i=0; i < pkeys.length; ++i) {
            nProps[pkeys[i]] = props[pkeys[i]];
        }
        for (var i=0; i < pnams.length; ++i) {
            if (Object.keys(nProps).indexOf(pnams[i]) == -1) {
                var v = this[pnams[i]];
                if (typeof(v) != "number"
                    && Object.keys(v).indexOf("clone") != -1) {
                    nProps[pnams[i]] = v.clone();
                }
                else {
                    nProps[pnams[i]] = v;
                }
            }
        }
        return this.protClone(nProps);
    }
};

function PathVar(seq, props) {
    this.seq = seq;
    this.copyProps(props);

    // Ensure seq is normalized.
    var total = 0;
    for (var i=0; i < seq.length; ++i) {
        var s = seq[i];
        if (s[1] == undefined)
            s[1] = 1;
        total += s[1];
    }
    for (var i=0; i < seq.length; ++i) {
        var s = seq[i];
        s[1] = s[1]/total;
    }
}
var pathVarProto = Object.create(pathBaseProto);
Object.defineProperty(pathVarProto, 'val', {
    enumerable: true
  , get: function() {
        var p = this.pos;
        var s;
        var sn;
        var seq = this.seq
        var acc = 0; // What percent the current transition starts at

        // We're finding where in the sequence of transitions we should be,
        // based on our position (0.0 -> 1.0)

        // FIXME, should cache where we are within seq to improve performance
        for (var i=0; i < seq.length; ++i) {
            if (i > 0)
                acc += seq[i-1][1];
            if (acc <= p)
                s = seq[i];
            else {
                sn = seq[i];
                break;
            }
        }
        if (sn == undefined)
            sn = seq[0];

        // How far into this transition we are (0.0 -> 1.0)
        var lp = (p - acc) / s[1];

        return s[0] + (s[1] * lp);
    }
});
PathVar.prototype = pathVarProto;

function CirclePath(x, r, props) {
    this.centerX = num(x);
    this.radius = num(r);

    this.copyProps(props);
}
var circlePathProto = Object.create(pathBaseProto, {
    val: {
        enumerable: true
      , get: function() {
            return this.centerX.val + this.fn(this.pos * 2.0 * Math.PI) * this.radius.val;
        }
    }
});
circlePathProto.cloneFill = ['speed', 'pos', 'fn'];
circlePathProto.fn = Math.sin
circlePathProto.protClone = function(props) {
    return new CirclePath(
        this.centerX
      , this.radius
      , props
    );
};
//circlePathProto = Object.create(pathBaseProto, circlePathProto);
CirclePath.prototype = circlePathProto;

// Provides both the x and the y for circle paths, as an array.
function circlePaths(x, y, r, props) {
    var one = new CirclePath(x, r, props);
    props.fn = revCos;
    var two = new CirclePath(y, r, props);
    return [ one, two ];
}

// returns the negative of the cosine
function revCos(n) {
    return -Math.cos(n);
}

// returns the clones of paths, adjusted by props
function adjustedPaths(paths, props) {
    var ret = [];
    for (var i = 0; i < paths.length; ++i) {
        ret[i] = paths[i].clone(props);
    }
    return ret;
}
