/*
     worlds.js

   Friendly Baubles
   
   This file describes the different "worlds" of relationships in which
   the player swims, and the potential connections to be made between
   them.


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

// The worlds, in order of appearance, their members, and their
// catchphrases.
var worlds = [
    ['Family',
      [ ['Mama', "Did Papa forget our anniversary again? Oh dear..."]
      , ['Papa', "I'm going to need another cup of coffee."]
      , ['Spot', "*Arf*... Spot wants a BONE!"]
      , ['Little Billy', "I like trucks! Vroom..."]
      , ['Little Suzie', "Ha ha, you're such a n00b!"]
      ]
    ]
  , ['Gamers',
      [ ['Astro', 'Astro SMASH!']
      , ['3ntr0py', "w00t!! Pwnd ur ass, n00b!"]
      , ['Bull3t', "I'm gonna kick your ass in Trog."]
      , ['L0nelyGuy69', "Whatever happened to Pac Man?"]
      , ['L0udM0uth', "I'm a gaming GOD!"]
      ]
    ]
  , ['Church',
      [ ['Pastor Bob', "Come and listen to the WORD!"]
      , ['Linda', "I'm giving an organ concert on Friday."]
      , ['Mark', "Listen to the voice of GOD!"]
      ]
    ]
  , ['Fetish Club',
      [ ['Daddy', "I've got a BONEr for you!"]
      , ['The Gimp', "What's the safety WORD?"]
      , ['Beatrix', "Oh god my ass smarts!"]
      , ['Barry', "Yes! Yes! Give me MORE!"]
      ]
    ]
  , ['Coffee Shop',
      [ ['Barista', 'Would you like a cup of coffee?']
      , ['Larry', "Ooh! Too much coffee! ...Well, maybe just one MORE."]
      ]
    ]
];

// Who may be connected to whom, and what they (first listed) say.
var worldConnections = [
    ['Little Suzie', '3ntr0py', "OMG, could you BE any more n00bish?!"]
  , ['Spot', 'Daddy', "Hey great! You have a bone! Can I have it?"]
  , ['Pastor Bob', 'The Gimp', 'I heard you wanted me to share the WORD?']
  , ['Mark', 'L0udM0uth', "Your voice is pretty loud, isn't it."]
  , ['Barry', 'Larry', "Say, maybe a coffee enema's the ticket..."]
  , ['Papa', 'Barista', "One coffee to go, please!"]
];

// These don't connect worlds, but they produce a saying.
var worldDisconnections = [
    // Person -> World
    ['Little Billy', 'Gamers', "Yay, video games!"]
  , ['Little Suzie', 'Fetish Club', "Ew... EW! Get AWAY!"]
  , ['Linda', 'Fetish Club', 'What kind of organ IS that?!']

    // Person -> Person
  , ['Papa', 'Daddy', "Oh, no... I don't want to be THAT kind of Daddy!"]
  , ['Mama', 'Daddy', "Oh MY! <em>This</em> &ldquo;Daddy&rdquo; is sexier than your Papa, isn't he?"]
];

// World, WorldChanger classes
function World(n) {
    var w = this;
    var sprites = [];
    this.whichWorld = n;

    // Load the world's actors (they can get swapped later)
    var actors = this.actors = [];
    for (var i=0; i < worlds[n][1].length; ++i) {
        actors[i] = new Actor(n, i);
        actors[i].graphics.x = worldPaths[n][i][0].val;
        actors[i].graphics.y = worldPaths[n][i][1].val;
    }

    var c = w.container = new createjs.Container();
    this.registerActor = function(actor) {
        if (actor.worldNum == this.whichWorld) {
            var aNum = actor.actorNum;
            if (sprites[aNum] !== undefined)
                c.removeChild(sprites[aNum]);
            this.actors[aNum] = actor;
            sprites[aNum] = actor.graphics;
            c.addChild(actor.graphics);
        }
    };

    // Load this world's sprites
    for (var i=0; i < worlds[n][1].length; ++i) {
        this.registerActor(actors[i]);
    }

    this.handleTick = function(ev) {
        if (ev.paused) return;
        for (var i=0; i < worldPaths[n].length; ++i) {
            worldPaths[n][i][0].advance(ev.delta);
            worldPaths[n][i][1].advance(ev.delta);
            if (actors[i] !== undefined) { // could be grabbed
                actors[i].graphics.x = worldPaths[n][i][0].val;
                actors[i].graphics.y = worldPaths[n][i][1].val;
            }
        }
    };
}
World.prototype = new (function(){
    this.checkCollides = function(x, y, radius) {
        var ret = undefined;
        var n = this.whichWorld;
        for (var i=0; i < worldPaths[n].length; ++i) {
            // Pythagorean theorem to find distance between points.
            var distX = x - worldPaths[n][i][0].val;
            var distY = y - worldPaths[n][i][1].val;
            var dist = Math.sqrt(distX * distX + distY * distY);
            if (dist < radius + SHOT_RADIUS) {
                ret = i;
                break;
            }
        }
        if (ret !== undefined && this.actors[ret] !== undefined) {
            if (shot.shotType == Shot.TYPE_TALK) {
                //var thing = worlds[this.whichWorld][1][i];
                var phrase = this.actors[i].phrase();
                saySomething('<b>' + this.actors[i].name + ':</b> ' + phrase);
                // unfire is handled after saySomething is turned off.
            }
            else if (shot.shotType == Shot.TYPE_GRAB) {
                if (grabbed != undefined) {
                    grabbed.goHome();
                }
                grabbed = this.actors[i];
                this.actors[i].graphics.visible = false;
                this.actors[i] = undefined;
                shot.unfire();
                //shot.shotType = Shot.TYPE_CONNECT;
            }
            else if (shot.shotType == Shot.TYPE_CONNECT) {
                if (!grabbed.connect(this.actors[i])
                    && !grabbed.remark(this.actors[i])) {

                    // Actually, we'll never reach here.
                    shot.unfire();
                }
            }
        }
    };

    this.activate = function(){
        stage.addChild(this.container);
        createjs.Ticker.addEventListener("tick", this.handleTick);
    };

    this.deactivate = function() {
        stage.removeChild(this.container);
        createjs.Ticker.removeEventListener("tick", this.handleTick);
    };
})();

function WorldChanger() {
    var wc = this;
    var ws = wc.worlds = [ new World(0), new World(1) ];
    wc.curWorldNum = 0;

    function activate(n) {
        if (ws[n] !== undefined) {
            ws[wc.curWorldNum].deactivate();
            wc.curWorldNum = n;
            ws[wc.curWorldNum].activate();
        }
    }
    activate(wc.curWorldNum);
    worldLabel.innerHTML = worlds[0][0];

    this.change = function(n) {
        if (n === undefined) {
            n = this.curWorldNum + 1;
            if (n >= ws.length)
                n = 0;
        }
        activate(n);
        worldLabel.innerHTML = worlds[n][0];
    }

    this.checkCollides = function(x, y, radius) {
        ws[wc.curWorldNum].checkCollides(x, y, radius);
    }

    this.openWorld = function() {
        var wl = ws.length;
        if (wl < worlds.length) {
            ws.push(new World(wl));
            this.change(wl);
        }
    }
}

function Actor(wNum, aNum) {
                //var thing = worlds[this.whichWorld][1][i];
    var entry = worlds[wNum][1][aNum];
    this.actorNum = aNum;
    this.worldNum = wNum;
    this.connected = false;

    this.name = entry[0];
    this.phrase = function() {
        return entry[1];
    }
    this.goHome = function() {
        var homeWorld = worldChanger.worlds[this.worldNum];
        if (homeWorld.actors[this.actorNum] !== undefined)
            throw ("Hey! actor " + this.name + " wants to go home to "
                   + this.worldNum + ":" + this.actorNum + ", but not empty.");
        homeWorld.actors[this.actorNum] = this;
        this.graphics.visible= true;
    }

    this.spriteNum = aNum; //FIXME
    this.graphics = new createjs.Sprite(spriteSheet);
    this.graphics.gotoAndStop(this.spriteNum);

    this.connect = function(other) {
        if (this.connected || other.connected)
            return false;

        var on = other.name;
        // XXX
        for (var i=0; i < worldConnections.length; ++i) {
            var item = worldConnections[i];
            if ((item[0] == this.name && item[1] == other.name)
                || (item[1] == this.name && item[0] == other.name)) {

                saySomething('<b>' + item[0] + ':</b> ' + item[2]);
                
                // Swap their places
                grabbed.goHome();
                grabbed = undefined;

                oldANum = this.actorNum;
                oldWNum = this.worldNum;
                this.actorNum = other.actorNum;
                this.worldNum = other.worldNum;
                other.actorNum = oldANum;
                other.worldNum = oldWNum;
                this.connected = true;
                other.connected = true;
                worldChanger.worlds[this.worldNum].registerActor(this);
                worldChanger.worlds[other.worldNum].registerActor(other);

                worldConnections.splice(i,1);
                setNumCons();

                // Should a new world be opened?
                var w = (this.worldNum > other.worldNum)
                            ? this.worldNum : other.worldNum;
                if (w == worldChanger.worlds.length - 1) {
                    worldChanger.openWorld();
                }
                return true;
            }
        }
        return false;
    }

    this.remark = function(other) {
        var on = other.name;

        var remarker = other.name;
        var remark = other.phrase();
        // XXX
        for (var i=0; i < worldDisconnections.length; ++i) {
            var item = worldDisconnections[i];
            if ((item[0] == this.name && item[1] == other.name)
                || (item[1] == this.name && item[0] == other.name)) {

                found = true;
                remarker = item[0];
                remark = item[2];
                break;
            }
            else if (item[0] == this.name && item[1]
                     == worlds[worldChanger.curWorldNum][0]) {
                remarker = item[0];
                remark = item[2];
            }
        }
        saySomething('<b>' + remarker + ':</b> ' + remark);
        return true;
    }
}

var w0speed = 0.25;
var w0speed1 = -0.50;

world0paths = circlePaths(200,200,140,{speed: w0speed});
world0paths1 = circlePaths(200,200,50,{speed: w0speed1});

w1varRad = new PathVar([[120],[160]],{speed: 2.15});
world1paths = circlePaths(200,200,w1varRad,{speed: w0speed});

var worldPaths = [
    // world 0
    [ world0paths
    , adjustedPaths(world0paths, {pos: 1/3.0})
    , adjustedPaths(world0paths, {pos: 2/3.0})
    , adjustedPaths(world0paths1, {pos: 1/4.0})
    , adjustedPaths(world0paths1, {pos: 3/4.0})
    ]
    // world 1
  , [ world1paths
    , adjustedPaths(world1paths, {pos: 1/5.0})
    , adjustedPaths(world1paths, {pos: 2/5.0})
    , adjustedPaths(world1paths, {pos: 3/5.0})
    , adjustedPaths(world1paths, {pos: 4/5.0})
    ]
    // world 1
  , [ world1paths
    , adjustedPaths(world1paths, {pos: 1/5.0})
    , adjustedPaths(world1paths, {pos: 2/5.0})
    , adjustedPaths(world1paths, {pos: 3/5.0})
    , adjustedPaths(world1paths, {pos: 4/5.0})
    ]
    // world 1
  , [ world1paths
    , adjustedPaths(world1paths, {pos: 1/5.0})
    , adjustedPaths(world1paths, {pos: 2/5.0})
    , adjustedPaths(world1paths, {pos: 3/5.0})
    , adjustedPaths(world1paths, {pos: 4/5.0})
    ]
    // world 1
  , [ world1paths
    , adjustedPaths(world1paths, {pos: 1/5.0})
    , adjustedPaths(world1paths, {pos: 2/5.0})
    , adjustedPaths(world1paths, {pos: 3/5.0})
    , adjustedPaths(world1paths, {pos: 4/5.0})
    ]
];
