// The Adventures of Yuna — all tunable constants live here.
// This is the file to tweak after playtesting with the child.

export const C = {
  // World / view
  TILE: 48,
  VIEW_W: 960,
  VIEW_H: 540,

  // Movement — gentle stroll, eased so there is no twitchiness
  MOVE_SPEED: 200, // px/s target walk speed
  MOVE_EASE: 0.25, // how quickly vx approaches target each step

  // Jump — floaty on the way up, quicker on the way down, never scary
  GRAVITY_UP: 760, // gravity while rising and holding jump
  GRAVITY_DOWN: 1500, // gravity otherwise
  JUMP_VEL: 520, // held jump reaches ~3.5 tiles, a tap ~1.9 tiles
  MAX_FALL: 500, // capped fall speed

  // Forgiveness
  COYOTE: 0.15, // can still jump 0.15 s after walking off an edge
  JUMP_BUFFER: 0.18, // pressing jump slightly early still works on landing

  // Magic wings (sky levels) — hold jump to flutter up, release to float down
  FLY_RISE: 175, // capped upward speed while holding jump
  FLY_ACCEL: 900, // how quickly the flutter reaches that speed
  MAX_FALL_WINGS: 150, // with wings Yuna never falls fast — she floats
  FLY_STAMINA: 3.5, // seconds of fluttering before the wings need a rest
  FLY_RECHARGE: 1.5, // seconds standing still to fully re-shimmer the wings

  // Swimming (underwater levels) — hold jump to swim up, otherwise sink slowly
  SWIM_UP: 165, // capped upward swim speed
  SWIM_ACCEL: 520,
  SINK: 220, // gentle gravity under water
  SINK_MAX: 95, // capped sink speed — drifting down is never scary
  WATER_WALK_MULT: 0.8, // walking on the seabed is a little slower
  WATER_JUMP_MULT: 0.55, // seabed hops are soft and floaty
  AIR_TIME: 9, // seconds of breath under water
  AIR_REFILL: 1.5, // seconds at the surface to refill it
  BUBBLE_LIFT_SPEED: 300, // the friendly bubble carries Yuna up this fast

  // Song levels — jump on bell-flowers to replay the friend's melody
  BELL_RADIUS: 40, // landing this close to a bell plays it
  DEMO_NOTE_GAP: 0.7, // each demo note flies from the singer to its bell this long
  DEMO_REPEAT: 9, // re-sing the demo after this long without success

  // Chase levels — the playful pup is "it" and runs after Yuna
  CHASE_START: 280, // the game of tag begins when Yuna comes this close
  PUP_SPEED: 185, // slightly slower than Yuna — she can keep the game going,
  CATCH_RADIUS: 52, // …but any rest and she is happily caught (that's the win!)
  PUP_GRAVITY: 1400,
  PUP_JUMP: 620, // enough to follow Yuna up the 2-tile platforms
  PUP_BOUNCE: 170, // the happy little bounds of its running gait
  PUP_ACCEL: 480, // momentum: it overshoots and skids, like a real puppy
  PUP_AIM_WOBBLE: 190, // it aims NEAR Yuna, not exactly at her (re-guessed ~1/s)
  PUP_DISTRACT_CHANCE: 0.3, // sometimes it stops to sniff — an escape window
  PUP_CLIMB_TIME: 4, // seconds Yuna can rest on a platform before it works out the climb

  // Interaction radii — everything is generous, auto pickup / auto give
  PICKUP_RADIUS: 56,
  GIVE_RADIUS: 84,
  STAR_RADIUS: 54,

  // Sequence timings (seconds)
  DWELL_TIME: 1.3, // staying close this long completes a dwell deed (wake/hug)
  GIVE_TIME: 0.95, // item arcs from Yuna to the friend
  BLOOM_TIME: 2.6, // color circle grows from the friend
  LEVEL_DONE_TIME: 2.8, // free celebration before fading to the next level
  FADE_TIME: 0.7,
  RESCUE_TIME: 2.2, // cloud ride back to safe ground

  // Yuna hitbox (visuals are drawn slightly larger — forgiving on purpose)
  PLAYER_W: 40,
  PLAYER_H: 44,

  // Desaturation of the storm-greyed world (leave a hint of color: wistful, not bleak)
  DESAT_ALPHA: 0.85,

  // The seven rainbow colors, in restore order
  RAINBOW: ['#e0524e', '#f29b38', '#f7d94c', '#7cc860', '#5aa8e8', '#7a6fd8', '#b07ad8'],
} as const;
