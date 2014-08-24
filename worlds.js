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
    ['Little Suzie', 'Fetish Club', "Ew... EW! Get AWAY!"]
  , ['Linda', 'What kind of organ IS that?!']

    // Person -> Person
  , ['Papa', 'Daddy', "Oh, no... I don't want to be THAT kind of Daddy!"]
  , ['Mama', 'Daddy', "Oh MY! <em>This</em> &ldquo;Daddy&rdquo; is sexier than your Papa, isn't he?"]
];
var w0speed = 0.25;
var w0speed1 = -0.50;

world0paths = circlePaths(200,200,140,{speed: w0speed});
world0paths1 = circlePaths(200,200,50,{speed: w0speed1});

w1varRad = new PathVar([[120],[160]],{speed: 2.5});
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
];
