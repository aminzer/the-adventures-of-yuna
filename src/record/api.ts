// Talks to the dev-server endpoints provided by the voice-studio plugin in
// vite.config.ts. Every call returns the fresh studio state.
export interface Take {
  id: string;
  file: string; // source recording
  processed?: string; // noise-cleaned version — what the game plays when present
  at: string; // ISO time of approval
  seconds?: number;
  tags: string[];
  note: string;
}
export interface LineTakes {
  active: string | null; // id of the take the game plays
  takes: Take[]; // oldest first
}
export interface StudioState {
  clips: Record<string, string>; // slot key → active clip file in public/voice-actor/
  texts: Record<string, string>; // slot key → reworded caption
  takes: Record<string, LineTakes>; // slot key → all takes
  cleaning: boolean; // dev server has ffmpeg and cleans new takes
}

const q = (params: Record<string, string>): string => new URLSearchParams(params).toString();
const jsonInit = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

async function call(path: string, init?: RequestInit): Promise<StudioState> {
  const r = await fetch(`/__voice/${path}`, { cache: 'no-store', ...init });
  const body = (await r.json()) as StudioState & { error?: string };
  if (!r.ok) throw new Error(body.error ?? `HTTP ${r.status}`);
  return body;
}

export const api = {
  list: (): Promise<StudioState> => call('list'),
  save: (key: string, blob: Blob, seconds: number, tags: string[], note: string): Promise<StudioState> =>
    call(`save?${q({ key, sec: seconds.toFixed(1), tags: JSON.stringify(tags), note })}`, {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'audio/webm' },
      body: blob,
    }),
  activate: (key: string, id: string): Promise<StudioState> => call(`activate?${q({ key, id })}`, { method: 'POST' }),
  deleteTake: (key: string, id: string): Promise<StudioState> => call(`deletetake?${q({ key, id })}`, { method: 'POST' }),
  setMeta: (key: string, id: string, meta: { note?: string; tags?: string[] }): Promise<StudioState> => call(`meta?${q({ key, id })}`, jsonInit(meta)),
  // the processed take by default; raw = the source recording from the mic
  takeUrl: (key: string, id: string, raw = false): string => `/__voice/take?${q({ key, id, ...(raw ? { raw: '1' } : {}) })}&v=${Date.now()}`,
  // empty text removes the override (back to the original line)
  setText: (key: string, text: string): Promise<StudioState> => call(`text?${q({ key })}`, jsonInit({ text })),
};
