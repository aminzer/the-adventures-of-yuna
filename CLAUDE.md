# The Adventures of Yuna / «Приключения Юны»

A gentle browser platformer the author builds for their 5-year-old daughter — her
first computer game. Player speaks Russian; every in-game text and voice line is
Russian. Chapter 1, «Потерянная радуга» (The Lost Rainbow): a storm stole the
valley's colours; Yuna (Юна) the unicorn brings one rainbow colour back per level by
helping a sad animal friend. Theme: kindness. More chapters are planned — the
rainbow is one story, not the game.

## Intent and locked design decisions (author's calls — do not relitigate)

- **Zero pressure.** No enemies, no dying, no timers, no fail states, no score
  penalties. Falling = friendly cloud rescue back to safe ground. Idling forever
  is always safe; the world waits. When an idea implies fear or failure, invert
  it (the "wolf" became a puppy playing tag — being caught IS the happy win).
- **Keyboard only, two concepts:** ←/→ walk, Space/↑ jump. No interaction key —
  pickup/give/wake/hug happen automatically on proximity.
- **Pictures carry the gameplay, text is narration on top.** Thought bubbles
  show what a friend needs. Russian subtitles + voice-over tell the story; a
  child who cannot read must still be able to play.
- **Hero is Юна** (renamed from Луна; code identifiers stay `luna`). Friend
  mama is a bigger unicorn (tutorial level).
- **Stars are celebratory**, never a requirement; the finale shows exactly the
  collected count in the night sky (a child once counted the baby-star as one —
  never draw a star-like thing in the sky that isn't a collected star).
- **Meditative music**, one mood per level, silent switch at the black frame
  with audible fade-out before / fade-in after.
- **Kid-legible levels.** ASCII maps; gaps ≤ 3 tiles, platform rises ≤ 3, never
  a platform overhanging a gap's jump runway (head-bonk trap). `check:levels`
  enforces these — keep it green, extend it when adding rules.
- **Practice level earns no rainbow stripe**; first "real" level starts grey.
- **Secret level select** for the parent: hold Shift+L, then a number-row key
  (1…9, 0, -, =). Not discoverable by the child by accident.
- **Voice:** real recording by a family member > Edge neural TTS clip
  (ru-RU-SvetlanaNeural) > browser speech. Author found Windows SAPI voices
  "awful" — never make them the primary path. One microphone, one take per
  line (a multi-mic/multi-take feature was built and deliberately removed).
- The author decides when to commit: **commit only when asked** ("commit").

## Tech

Vite 7 + TypeScript 5 (strict), Canvas 2D, zero runtime dependencies; all art
and SFX are procedural. `base: './'` so `dist/` runs from a file share.

- **One function per file.** `src/game/*` = update/render functions receiving
  the `GameCtx` state object (`context.ts`); `startGame.ts` assembles and
  returns `GameDebug` for headless tests. `src/art/*` = pure draw functions.
  `config.ts` = every tunable constant. `levels.ts` = `LevelDef[]` + ASCII maps.
- **Text:** `src/texts.ts` (captions, RU grammar helpers), `src/textOverrides.json`
  (actor's rewordings keyed by the ORIGINAL line's key, applied in
  `showCaption` via `captionText()`). `spokenText()`/`voiceKey()` in
  `src/voiceText.ts` define a line's identity — changing a caption's wording in
  code changes its key and orphans its recording; prefer an override.
- **Voice:** `src/voice.ts` (fallback chain, music ducking), `src/voiceClips.ts`
  and `src/voiceActor.ts` are GENERATED manifests — never edit by hand.
  Clips: `public/voice/` (TTS), `public/voice-actor/` (cleaned recordings),
  `voice-takes/` (raw recordings, dev only).
- **Rendering:** background muted by colour mixing, world layer drawn to an
  offscreen buffer with a `saturation` veil + bloom clip, rainbow is part of
  the landscape (behind hills), night finale with star flight.
- **Dev-only Vite plugin** in `vite.config.ts` serves the recording studio
  endpoints (`/__voice/*`); shared file logic in `tools/voice-store.ts`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | play (press a key to start audio) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:levels` | gentleness rules for every map |
| `npm run test:smoke` | headless bot plays all levels (~4 min) — must PASS |
| `npm run shots` | PNG frames of key moments → `tools/shots/` |
| `npm run build` | typecheck + Vite build to `dist/` |
| `npm run voice [-- <edge voice> --force]` | regenerate TTS clips + manifest |
| `npm run studio` | recording studio (`record.html`) for real voice |
| `npm run voice:clean [-- --force]` | re-run noise cleaning on recordings |

After any level/physics/text change run: `typecheck` → `check:levels` →
`test:smoke` → `build`. After changing caption texts also run `npm run voice`
(regenerates clips, deletes stale ones).

## Working conventions

- Bot findings are design feedback: when the smoke-test bot gets stuck, first
  ask whether a 5-year-old would too, and fix the level/physics, not only the bot.
- Temporary probes go in `tools/probe.ts` and are deleted afterwards.
- Keep the file-per-function layout; avoid long files; comments explain *why*.
- Russian UI/caption strings must be natural spoken Russian (they are voiced).
- Don't add runtime dependencies; dev dependencies are fine (`msedge-tts`,
  `ffmpeg-static`, `canvas`, `tsx`).
