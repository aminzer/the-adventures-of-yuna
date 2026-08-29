// Talks to the dev-server endpoints provided by the voice-studio plugin in
// vite.config.ts. Every call returns the fresh studio state.
export interface StudioState {
  clips: Record<string, string>; // slot key → cleaned clip file in public/voice-actor/
  texts: Record<string, string>; // slot key → reworded caption
  cleaning: boolean; // dev server has ffmpeg and cleans new recordings
}

async function call(path: string, init?: RequestInit): Promise<StudioState> {
  const r = await fetch(`/__voice/${path}`, { cache: 'no-store', ...init });
  const body = (await r.json()) as StudioState & { error?: string };
  if (!r.ok) throw new Error(body.error ?? `HTTP ${r.status}`);
  return body;
}

export const api = {
  list: (): Promise<StudioState> => call('list'),
  save: (key: string, blob: Blob): Promise<StudioState> =>
    call(`save?key=${key}`, { method: 'POST', headers: { 'Content-Type': blob.type || 'audio/webm' }, body: blob }),
  remove: (key: string): Promise<StudioState> => call(`delete?key=${key}`, { method: 'POST' }),
  rawUrl: (key: string): string => `/__voice/raw?key=${key}&v=${Date.now()}`,
  // empty text removes the override (back to the original line)
  setText: (key: string, text: string): Promise<StudioState> =>
    call(`text?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }),
};
