import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import { cleanTake, ffmpeg } from './tools/voice-clean';
import {
  ACTOR_DIR, EXT_BY_TYPE, KEY_RE, MANIFEST, OVERRIDES, RAW_DIR, TYPE_BY_EXT,
  actorClips, importLegacyClips, rawClips, readOverrides, removeClip, writeManifest, writeOverrides,
} from './tools/voice-store';

// ---------------------------------------------------------------------------
// Voice studio (dev server only). The recording page (record.html) talks to
// these endpoints to store a real person's recordings, to reword subtitle
// lines, and to keep the generated files in sync (see tools/voice-store.ts
// for the file layout). Endpoints (all answer with the full { clips, texts,
// cleaning } state):
//   GET  /__voice/list
//   POST /__voice/save?key=<hex8>    body = audio blob → raw kept, cleaned copy becomes the game clip
//   POST /__voice/delete?key=<hex8>
//   POST /__voice/text?key=<hex8>    body = {"text": "..."}; empty text removes the override
//   GET  /__voice/raw?key=<hex8>     streams the recording as it came from the microphone
// Nothing here is part of the built game.
// ---------------------------------------------------------------------------
function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function voiceStudio(): Plugin {
  const generated = new Set([MANIFEST, OVERRIDES]);
  return {
    name: 'voice-studio',
    apply: 'serve',
    async configureServer(server) {
      fs.mkdirSync(ACTOR_DIR, { recursive: true });
      fs.mkdirSync(RAW_DIR, { recursive: true });
      importLegacyClips();
      writeManifest();
      if (!fs.existsSync(OVERRIDES)) writeOverrides({});
      const cleaning = Boolean(await ffmpeg());
      if (!cleaning) server.config.logger.warn('[voice-studio] ffmpeg-static not found — recordings will be used without noise cleaning');

      server.middlewares.use('/__voice', async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const key = url.searchParams.get('key') ?? '';
        const json = (status: number, body: unknown): void => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };
        const state = (): unknown => ({ clips: actorClips(), texts: readOverrides(), cleaning });
        try {
          if (url.pathname === '/list') return json(200, state());
          if (!KEY_RE.test(key)) return json(400, { error: 'bad key' });

          if (url.pathname === '/raw') {
            const file = rawClips()[key];
            if (!file) return json(404, { error: 'no recording' });
            res.statusCode = 200;
            res.setHeader('Content-Type', TYPE_BY_EXT[file.split('.').pop() ?? ''] ?? 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-store');
            fs.createReadStream(path.join(RAW_DIR, file)).pipe(res);
            return;
          }

          if (req.method !== 'POST') return json(405, { error: 'POST expected' });
          if (url.pathname === '/save') {
            const type = String(req.headers['content-type'] ?? '').split(';')[0].trim();
            const ext = EXT_BY_TYPE[type];
            if (!ext) return json(415, { error: `unsupported audio type ${type}` });
            const buf = await readBody(req);
            if (buf.length < 500) return json(400, { error: 'empty recording' });
            removeClip(RAW_DIR, key);
            removeClip(ACTOR_DIR, key);
            const raw = path.join(RAW_DIR, `${key}.${ext}`);
            fs.writeFileSync(raw, buf);
            let cleaned = false;
            if (cleaning) {
              try {
                await cleanTake(raw, path.join(ACTOR_DIR, `${key}.webm`));
                cleaned = true;
              } catch (e) {
                server.config.logger.warn(`[voice-studio] cleaning failed, raw recording used: ${String(e)}`);
              }
            }
            if (!cleaned) fs.copyFileSync(raw, path.join(ACTOR_DIR, `${key}.${ext}`));
          } else if (url.pathname === '/delete') {
            removeClip(RAW_DIR, key);
            removeClip(ACTOR_DIR, key);
          } else if (url.pathname === '/text') {
            const body = JSON.parse((await readBody(req)).toString('utf8') || '{}') as { text?: unknown };
            const text = typeof body.text === 'string' ? body.text.replace(/\s+/g, ' ').trim() : '';
            const texts = readOverrides();
            if (text) texts[key] = text;
            else delete texts[key];
            writeOverrides(texts);
            return json(200, state());
          } else {
            return json(404, { error: 'unknown endpoint' });
          }
          writeManifest();
          return json(200, state());
        } catch (e) {
          return json(500, { error: String(e) });
        }
      });
    },
    // The generated files change on every approved recording / reworded line;
    // do not full-reload the pages (the studio would lose its place). The game
    // picks changes up on its next reload.
    handleHotUpdate(ctx) {
      if (generated.has(path.resolve(ctx.file))) return [];
      return undefined;
    },
  };
}

export default defineConfig({
  // relative base so the built game in dist/ still runs when opened directly
  base: './',
  plugins: [voiceStudio()],
});
