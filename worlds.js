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
      , ['Little Billy', "I like trucks! Vroom..."]
      , ['Little Suzie', "Ha ha, you're such a n00b!"]
      , ['Spot', "*Arf*... Spot wants a BONE!"]
      ]
    ]
    ['Church',
      [ ['Pastor Bob', "Come and listen to the WORD!"]
      ]
    ]
  , ['Gamers',
      [ ['Astro', 'Astro SMASH!']
      , ['3ntr0py', "n00b!"]
      ]
    ]
  , ['Fetish Club',
      [ ['Daddy', "I've got a BONEr for you!"]
        ['The Gimp', "What's the safety WORD?"]
      ]
    ]
];

// Who may be connected to whom, and what they (first listed) say.
var worldConnections = [
    ['Little Suzie', '3ntr0py', "OMG, could you BE any more n00bish?!"]
  , ['Spot', 'Daddy', "Hey great! You have a bone! Can I have it?"]
  , ['Pastor Bob', 'The Gimp', 'I heard you wanted me to share the WORD?']
];

// These don't connect worlds, but they produce a saying.
var worldDisconnections = [
    // Person -> World
    ['Little Suzie', 'Fetish Club', "Ew... EW! Get AWAY!"]

    // Person -> Person
  , ['Papa', 'Daddy', "Oh, no... I don't want to be THAT kind of Daddy!"]
  , ['Mama', 'Daddy', "Oh MY! This Daddy's sexier than your Papa, isn't he?"]
];

world0pathForm = new CirclePathForm(200,200,75);

var w0speed = 0.25;
var worldPaths = [
    // world 0
    [ new Wpath(world0pathForm, 0.0, w0speed)
    //, new Wpath(world0pathForm, 1/6.0, w0speed)
    //, new Wpath(world0pathForm, 2/6.0, w0speed)
    , new Wpath(world0pathForm, 3/6.0, w0speed)
    //, new Wpath(world0pathForm, 4/6.0, w0speed)
    //, new Wpath(world0pathForm, 5/6.0, w0speed)
    ]
];
