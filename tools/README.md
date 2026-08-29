# Dev tools (not part of the game)

Run the game with `npm run dev`, build it with `npm run build`.

These scripts help while developing new levels and stages:

- `npm run check:levels` — checks every level map against the gentleness
  rules: row lengths, exactly one P/F/I, gaps ≤ 3 tiles, platforms reachable,
  no low platform overhanging a gap's jump runway (head-bonk trap).
- `npm run test:smoke` — loads the real game code headlessly and lets a very
  simple "bot child" (walk toward the goal, hop now and then) try to finish
  every level. If the dumb bot can finish, a 5-year-old has a fair chance.
- `npm run shots` — renders real game frames to `tools/shots/*.png` at the key
  story moments (grey world, carrying, giving, blooming, celebration, finale).
  Uses the `canvas` package (installed as a dev dependency).

- `npm run voice` — generates the Russian voice-over clips for every subtitle
  line (`public/voice/*.mp3`) with Microsoft Edge's free neural voices via
  `msedge-tts`, and writes the manifest `src/voiceClips.ts`. Incremental:
  only new/changed lines are rendered; stale clips are deleted. Pick another
  voice with `npm run voice -- ru-RU-DariyaNeural --force`.
- `npm run studio` — opens the **recording studio** (`record.html`) in the
  browser: every narrator line one by one, big text, record / listen /
  approve / retry, plus the robot version for reference. Approved takes are
  stored by the dev server (voice-studio plugin in `vite.config.ts`): the raw
  recording goes to `voice-takes/<key>.webm`, a **cleaned** copy to
  `public/voice-actor/<key>.webm` (what the game plays), and the manifest
  `src/voiceActor.ts` is regenerated. Cleaning uses ffmpeg (`ffmpeg-static`
  dev dependency; chain in `tools/voice-clean.ts`): high/low-pass, `adeclick`
  for mouth clicks, `afftdn` denoiser, `deesser` for harsh sibilants, loudness
  normalisation, a gentle gate and silence trimming. The studio plays both
  («🎧 Утверждённая» = cleaned, «🎧 Оригинал» = raw). Deleting a recording
  reverts that line to the robot.
- `npm run voice:clean` — (re)cleans every raw recording in `voice-takes/`
  into `public/voice-actor/`; `-- --force` after tuning the filter chain,
  incremental otherwise. The text can be
  reworded right in the studio (💾 Сохранить текст, or just approve a take —
  the words on screen are saved with it): overrides go to
  `src/textOverrides.json` keyed by the ORIGINAL line, and the game shows and
  speaks the new wording (`captionText()` in `src/textOverrides.ts`). Run
  `npm run voice` afterwards so the robot fallback learns the new words too.

Voice priority in the game (`src/voice.ts`): a real recording, then the neural
clip, then the browser's built-in speech synthesis. Every fallback is per line,
so a half-recorded set already works: record a few lines, open the game from
the studio's «Проверить в игре» button (same dev server) and reload that tab
after new takes. Shift+L + a number-row key jumps to a level.
