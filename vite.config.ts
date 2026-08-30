import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import { cleanTake, ffmpeg, processedName } from './tools/voice-clean';
import {
  ACTOR_DIR, EXT_BY_TYPE, KEY_RE, MANIFEST, OVERRIDES, TAKES_DIR, TAKE_ID_RE, TYPE_BY_EXT,
  actorClips, cleanNote, cleanTags, importLegacyClips, newTakeId, readOverrides, readTakes, syncActive, writeManifest, writeOverrides, writeTakes,
} from './tools/voice-store';

// ---------------------------------------------------------------------------
// Voice studio (dev server only). The recording page (record.html) talks to
// these endpoints to store a real person's takes (several per line, with
// tags and notes), to reword subtitle lines, and to keep the generated files
// in sync (see tools/voice-store.ts for the file layout). Every endpoint
// answers with the full { clips, texts, takes, cleaning } state.
//   GET  /__voice/list
//   POST /__voice/save?key&sec&tags=<json>&note   body = audio blob → new take, cleaned, made active
//   POST /__voice/activate?key&id
//   POST /__voice/deletetake?key&id
//   POST /__voice/meta?key&id                     body = {"note", "tags"}
//   POST /__voice/text?key                        body = {"text"}; empty text removes the override
//   GET  /__voice/take?key&id[&raw=1]             streams a take (cleaned, or the raw recording)
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

function parseJson(buf: Buffer): Record<string, unknown> {
  try {
    const v = JSON.parse(buf.toString('utf8') || '{}') as unknown;
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function voiceStudio(): Plugin {
  const generated = new Set([MANIFEST, OVERRIDES]);
  return {
    name: 'voice-studio',
    apply: 'serve',
    async configureServer(server) {
      fs.mkdirSync(ACTOR_DIR, { recursive: true });
      fs.mkdirSync(TAKES_DIR, { recursive: true });
      const db0 = readTakes();
      importLegacyClips(db0);
      writeTakes(db0);
      for (const key of Object.keys(db0)) syncActive(key, db0);
      writeManifest();
      if (!fs.existsSync(OVERRIDES)) writeOverrides({});
      const cleaning = Boolean(await ffmpeg());
      if (!cleaning) server.config.logger.warn('[voice-studio] ffmpeg-static not found — takes will be used without noise cleaning');

      server.middlewares.use('/__voice', async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const key = url.searchParams.get('key') ?? '';
        const id = url.searchParams.get('id') ?? '';
        const json = (status: number, body: unknown): void => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };
        const state = (): unknown => ({ clips: actorClips(), texts: readOverrides(), takes: readTakes(), cleaning });
        try {
          if (url.pathname === '/list') return json(200, state());
          if (!KEY_RE.test(key)) return json(400, { error: 'bad key' });

          if (url.pathname === '/take') {
            const take = TAKE_ID_RE.test(id) ? readTakes()[key]?.takes.find((t) => t.id === id) : undefined;
            const name = take ? (url.searchParams.get('raw') ? take.file : take.processed ?? take.file) : '';
            const file = take ? path.join(TAKES_DIR, key, name) : '';
            if (!take || !fs.existsSync(file)) return json(404, { error: 'no such take' });
            res.statusCode = 200;
            res.setHeader('Content-Type', TYPE_BY_EXT[name.split('.').pop() ?? ''] ?? 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-store');
            fs.createReadStream(file).pipe(res);
            return;
          }

          if (req.method !== 'POST') return json(405, { error: 'POST expected' });
          const db = readTakes();

          if (url.pathname === '/text') {
            const body = parseJson(await readBody(req));
            const text = cleanNote(body.text);
            const texts = readOverrides();
            if (text) texts[key] = text;
            else delete texts[key];
            writeOverrides(texts);
            return json(200, state());
          }

          const line = (db[key] ??= { active: null, takes: [] });
          if (url.pathname === '/save') {
            const type = String(req.headers['content-type'] ?? '').split(';')[0].trim();
            const ext = EXT_BY_TYPE[type];
            if (!ext) return json(415, { error: `unsupported audio type ${type}` });
            const buf = await readBody(req);
            if (buf.length < 500) return json(400, { error: 'empty recording' });
            const takeId = newTakeId();
            const dir = path.join(TAKES_DIR, key);
            fs.mkdirSync(dir, { recursive: true });
            const file = `${takeId}.source.${ext}`;
            fs.writeFileSync(path.join(dir, file), buf);
            const seconds = Number(url.searchParams.get('sec'));
            let tags: unknown = [];
            try {
              tags = JSON.parse(url.searchParams.get('tags') ?? '[]');
            } catch {
              tags = [];
            }
            const take = {
              id: takeId,
              file,
              at: new Date().toISOString(),
              ...(seconds > 0 ? { seconds: Math.round(seconds * 10) / 10 } : {}),
              tags: cleanTags(tags),
              note: cleanNote(url.searchParams.get('note')),
            };
            if (cleaning) {
              try {
                await cleanTake(path.join(dir, file), path.join(dir, processedName(file)));
                Object.assign(take, { processed: processedName(file) });
              } catch (e) {
                server.config.logger.warn(`[voice-studio] cleaning failed, raw take kept: ${String(e)}`);
              }
            }
            line.takes.push(take);
            line.active = takeId; // a freshly approved take is the one to hear in the game
          } else {
            const take = TAKE_ID_RE.test(id) ? line.takes.find((t) => t.id === id) : undefined;
            if (!take) return json(404, { error: 'no such take' });
            if (url.pathname === '/activate') {
              line.active = id;
            } else if (url.pathname === '/meta') {
              const body = parseJson(await readBody(req));
              if ('note' in body) take.note = cleanNote(body.note);
              if ('tags' in body) take.tags = cleanTags(body.tags);
            } else if (url.pathname === '/deletetake') {
              for (const f of [take.file, take.processed]) if (f) fs.rmSync(path.join(TAKES_DIR, key, f), { force: true });
              line.takes = line.takes.filter((t) => t.id !== id);
              if (line.active === id) line.active = line.takes.at(-1)?.id ?? null; // newest remaining, else the robot
              if (line.takes.length === 0) {
                delete db[key];
                fs.rmSync(path.join(TAKES_DIR, key), { recursive: true, force: true });
              }
            } else {
              return json(404, { error: 'unknown endpoint' });
            }
          }
          writeTakes(db);
          syncActive(key, db);
          return json(200, state());
        } catch (e) {
          return json(500, { error: String(e) });
        }
      });
    },
    // The generated files change on every approved take / reworded line; do
    // not full-reload the pages (the studio would lose its place). The game
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
