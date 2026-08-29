// Every line the narrator can say — the single source of truth for the TTS
// generator (npm run voice) and the recording studio (npm run studio).
// Ordered the way a player hears them: level by level, and within a level in
// the order the captions fire (story → mechanics → pickup → happy friend →
// bloom), then the finale. Lines shared by several levels (rescue, bloom…)
// appear once, where they are heard first.
import { LEVELS, type LevelDef } from './levels';
import { TEXTS, satisfiedText } from './texts';
import { TEXT_OVERRIDES } from './textOverrides';
import { spokenText, voiceKey } from './voiceText';

export interface SpokenLine {
  key: string; // the slot: voiceKey of the ORIGINAL spoken text; recordings attach here
  original: string; // spoken form of the line as written in the code
  text: string; // spoken form actually used in the game (actor's rewording, if any)
}

export interface SpokenGroup {
  title: string; // where the lines are heard, e.g. "Уровень 4 · yellow (Shift+L, 4)"
  lines: SpokenLine[];
}

function levelLines(L: LevelDef): string[] {
  const out: string[] = [L.story];
  if (L.practice) out.push(TEXTS.introWalk, TEXTS.introJump, TEXTS.introGo);
  if (L.sky) out.push(TEXTS.wings, TEXTS.wingsTired, TEXTS.wingsReady);
  if (L.water) out.push(TEXTS.airLow, TEXTS.bubbleLift);
  if (L.deed === 'song') out.push(TEXTS.listen, TEXTS.yourTurn, TEXTS.wrongNote);
  if (L.deed === 'chase') out.push(TEXTS.chaseOn);
  out.push(TEXTS.rescue); // a fall can happen on any level; heard first on the earliest
  if (L.deed === 'fetch' && L.item) out.push(TEXTS.pickup(L.item));
  out.push(satisfiedText(L, L.friend));
  if (!L.practice) out.push(TEXTS.bloom);
  return out;
}

export function allSpokenGroups(): SpokenGroup[] {
  const seen = new Set<string>();
  const group = (title: string, texts: string[]): SpokenGroup => {
    const lines: SpokenLine[] = [];
    for (const t of texts) {
      const original = spokenText(t);
      const key = voiceKey(original);
      if (seen.has(key)) continue;
      seen.add(key);
      const over = TEXT_OVERRIDES[key];
      lines.push({ key, original, text: over ? spokenText(over) : original });
    }
    return { title, lines };
  };
  return [
    // numbered like the secret level select: Shift+L then 1…9, 0, -, =
    ...LEVELS.map((L, i) => group(`Уровень ${i + 1} · ${L.name} (Shift+L, ${'1234567890-='[i]})`, levelLines(L))),
    group('Финал', [TEXTS.finaleStars, TEXTS.finale]),
  ];
}

// The spoken texts the game actually uses — what the TTS clips are made for.
export function allSpokenLines(): string[] {
  return allSpokenGroups().flatMap((g) => g.lines.map((l) => l.text));
}
