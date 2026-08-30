// The recording studio: walk through every narrator line, record it with a
// real voice, listen, approve or discard. A line keeps every approved take
// (with the tags set at recording time and a free-text note) so versions can
// be compared; the one marked «в игре» is copied to public/voice-actor/ and
// is what the game plays. The text itself can be reworded; the game shows and
// speaks the new wording. Lines without a take keep using the TTS clip.
import { allSpokenGroups } from '../voiceLines';
import { spokenText, voiceKey } from '../voiceText';
import { api, type StudioState, type Take as SavedTake } from './api';
import { Recorder, type Take } from './recorder';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const el = {
  count: $('count'), barFill: $('barFill'), onlyMissing: $<HTMLInputElement>('onlyMissing'),
  pos: $('pos'), badge: $('badge'), line: $<HTMLTextAreaElement>('line'), textRow: $('textRow'), orig: $('orig'),
  tagChips: $('tagChips'), tagInput: $<HTMLInputElement>('tagInput'),
  meter: $('meter'), take: $('take'), takeLen: $('takeLen'), takeTags: $('takeTags'), takeNote: $<HTMLInputElement>('takeNote'),
  takes: $('takes'), takesTitle: $('takesTitle'), takeRows: $('takeRows'), status: $('status'), list: $('list'),
  btnSaveText: $<HTMLButtonElement>('btnSaveText'), btnResetText: $<HTMLButtonElement>('btnResetText'),
  btnRec: $<HTMLButtonElement>('btnRec'), btnRef: $<HTMLButtonElement>('btnRef'),
  btnPlay: $<HTMLButtonElement>('btnPlay'), btnApprove: $<HTMLButtonElement>('btnApprove'), btnRetry: $<HTMLButtonElement>('btnRetry'),
  btnPrev: $<HTMLButtonElement>('btnPrev'), btnNext: $<HTMLButtonElement>('btnNext'),
};

const groups = allSpokenGroups();
const lines = groups.flatMap((g) => g.lines);
const where = groups.flatMap((g) => g.lines.map(() => g.title)); // level title per line
let state: StudioState = { clips: {}, texts: {}, takes: {}, cleaning: false };
let index = Math.min(Number(localStorage.getItem('studio.index') ?? 0) || 0, lines.length - 1);
let take: Take | null = null;
let player: HTMLAudioElement | null = null;
let tags: string[] = [];
try {
  tags = (JSON.parse(localStorage.getItem('studio.tags') ?? '[]') as unknown[]).map(String).slice(0, 12);
} catch {
  tags = [];
}

const recorder = new Recorder((level) => {
  el.meter.style.width = `${Math.min(100, level * 140).toFixed(1)}%`;
});

const key = (): string => lines[index].key;
// The wording currently in the game for a line (actor's version or the original).
const currentText = (i: number): string => state.texts[lines[i].key] ?? lines[i].original;
const textEdited = (): boolean => el.line.value.trim() !== currentText(index);
const takesOf = (i: number): SavedTake[] => state.takes[lines[i].key]?.takes ?? [];
const hasActive = (i: number): boolean => Boolean(state.clips[lines[i].key]);

function say(msg: string, err = false): void {
  el.status.textContent = msg;
  el.status.classList.toggle('err', err);
}

function play(url: string, onFail?: () => void): void {
  player?.pause();
  const a = new Audio(url);
  player = a;
  const fail = onFail ?? (() => say('Не удалось воспроизвести', true));
  a.onerror = fail;
  a.play().catch(fail);
}

function dropTake(): void {
  if (take) URL.revokeObjectURL(take.url);
  take = null;
  el.take.classList.remove('show');
  el.takeNote.value = '';
}

// ---- tag editor ------------------------------------------------------------------
function chip(text: string, onRemove?: () => void): HTMLElement {
  const s = document.createElement('span');
  s.className = 'tag';
  s.textContent = text;
  if (onRemove) {
    const x = document.createElement('b');
    x.textContent = '×';
    x.title = 'Убрать тег';
    x.onclick = onRemove;
    s.append(x);
  }
  return s;
}

function renderTags(): void {
  localStorage.setItem('studio.tags', JSON.stringify(tags));
  el.tagChips.replaceChildren(...tags.map((t) => chip(t, () => {
    tags = tags.filter((x) => x !== t);
    renderTags();
  })));
  el.takeTags.replaceChildren(...tags.map((t) => chip(t)));
}

function addTagsFromInput(): void {
  for (const raw of el.tagInput.value.split(',')) {
    const t = raw.replace(/\s+/g, ' ').trim().slice(0, 30);
    if (t && !tags.includes(t) && tags.length < 12) tags.push(t);
  }
  el.tagInput.value = '';
  renderTags();
}

// ---- rendering ---------------------------------------------------------------------
function renderTextRow(): void {
  const overridden = Boolean(state.texts[key()]);
  el.textRow.classList.toggle('show', overridden || textEdited());
  el.orig.textContent = lines[index].original;
  el.btnSaveText.disabled = !textEdited();
  el.btnResetText.disabled = !overridden && !textEdited();
}

function showText(): void {
  el.line.value = currentText(index);
  renderTextRow();
}

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

function renderTakes(): void {
  const line = state.takes[key()];
  const list = takesOf(index);
  el.takes.classList.toggle('show', list.length > 0);
  el.takesTitle.textContent = `Записи этой реплики — ${list.length}`;
  el.takeRows.replaceChildren(
    ...list.map((t, i) => {
      const active = line?.active === t.id;
      const row = document.createElement('div');
      row.className = `takerow ${active ? 'active' : ''}`;

      const info = document.createElement('div');
      info.className = 'info';
      const n = document.createElement('span');
      n.className = 'n';
      n.textContent = `Дубль ${i + 1}`;
      const when = document.createElement('span');
      when.className = 'when';
      when.textContent = `${fmtWhen(t.at)}${t.seconds ? ` · ${t.seconds.toFixed(1)} с` : ''}${t.processed ? ' · ✨' : ''}${active ? ' · в игре' : ''}`;
      info.append(n, when, ...t.tags.map((tag) => chip(tag, () => act(() => api.setMeta(key(), t.id, { tags: t.tags.filter((x) => x !== tag) }), `Тег «${tag}» убран`))));

      const btns = document.createElement('div');
      btns.className = 'btns';
      const bPlay = document.createElement('button');
      bPlay.textContent = t.processed ? '▶ обработанный' : '▶';
      bPlay.title = t.processed ? 'Прослушать после обработки (шумодав и т.д.) — так звучит в игре' : 'Прослушать';
      bPlay.onclick = () => play(api.takeUrl(key(), t.id));
      const bRaw = document.createElement('button');
      bRaw.textContent = '▶ оригинал';
      bRaw.title = 'Запись как есть с микрофона, до обработки';
      bRaw.hidden = !t.processed;
      bRaw.onclick = () => play(api.takeUrl(key(), t.id, true));
      const bUse = document.createElement('button');
      bUse.textContent = active ? '● в игре' : 'В игру';
      bUse.className = active ? 'inuse' : '';
      bUse.disabled = active;
      bUse.title = 'Именно этот дубль будет звучать в игре';
      bUse.onclick = () => act(() => api.activate(key(), t.id), `Теперь в игре звучит дубль ${i + 1}`);
      const bDel = document.createElement('button');
      bDel.textContent = '🗑';
      bDel.title = 'Удалить этот дубль';
      bDel.onclick = () => {
        if (confirm(`Удалить дубль ${i + 1}${t.note ? ` («${t.note}»)` : ''}?`)) act(() => api.deleteTake(key(), t.id), `Дубль ${i + 1} удалён`);
      };
      btns.append(bPlay, bRaw, bUse, bDel);

      const note = document.createElement('input');
      note.className = 'note';
      note.value = t.note;
      note.maxLength = 300;
      note.placeholder = 'комментарий: например «голос ниже», «лучший вариант»…';
      note.title = 'Комментарий к дублю — сохраняется при выходе из поля';
      const saveNote = (): void => {
        if (note.value.trim() !== t.note) void act(() => api.setMeta(key(), t.id, { note: note.value }), 'Комментарий сохранён');
      };
      note.onblur = saveNote;
      note.onkeydown = (e) => {
        if (e.key === 'Enter') note.blur();
      };

      row.append(info, btns, note);
      return row;
    }),
  );
}

function render(): void {
  const has = hasActive(index);
  const done = lines.filter((_, i) => hasActive(i)).length;
  const n = takesOf(index).length;
  el.count.textContent = `записано ${done} из ${lines.length}`;
  el.barFill.style.width = `${(100 * done) / lines.length}%`;
  el.pos.textContent = `${where[index]} · строка ${index + 1} / ${lines.length} · ${key()}`;
  el.badge.textContent = has ? `🎙 ${n === 1 ? '1 запись' : `${n} записи`}${n > 1 ? ' · выберите лучшую' : ''}` : '🤖 пока робот';
  el.badge.className = `badge ${has ? 'actor' : 'robot'}`;
  el.btnRec.textContent = recorder.recording ? '⏹ Стоп' : n > 0 ? '⏺ Записать ещё' : '⏺ Записать';
  el.btnRec.classList.toggle('on', recorder.recording);
  el.btnPrev.disabled = index === 0;
  el.btnNext.disabled = index === lines.length - 1;
  localStorage.setItem('studio.index', String(index));
  renderTextRow();
  renderTakes();

  el.list.replaceChildren(
    ...lines.flatMap((l, i) => {
      const nodes: HTMLElement[] = [];
      if (i === 0 || where[i] !== where[i - 1]) {
        const h = document.createElement('h3');
        h.textContent = where[i];
        nodes.push(h);
      }
      const a = document.createElement('a');
      a.href = '#';
      const k = takesOf(i).length;
      a.textContent = `${i + 1}. ${currentText(i)}${state.texts[l.key] ? ' ✎' : ''}${k > 1 ? ` ×${k}` : ''}`;
      a.className = `${hasActive(i) ? 'done' : ''} ${i === index ? 'cur' : ''}`;
      a.onclick = (e) => {
        e.preventDefault();
        go(i);
      };
      nodes.push(a);
      return nodes;
    }),
  );
}

// Run a server call, show the outcome, re-render.
async function act(fn: () => Promise<StudioState>, okMsg: string): Promise<void> {
  try {
    state = await fn();
    say(okMsg);
    render();
  } catch (e) {
    say(`Не получилось: ${(e as Error).message}`, true);
  }
}

function go(i: number): void {
  if (i < 0 || i >= lines.length || recorder.recording) return;
  player?.pause();
  dropTake();
  index = i;
  say('');
  showText();
  render();
}

// Next line — skipping already-recorded ones when the filter is on.
function next(dir: 1 | -1): void {
  let i = index + dir;
  if (el.onlyMissing.checked) while (i >= 0 && i < lines.length && hasActive(i)) i += dir;
  if (i >= 0 && i < lines.length) go(i);
}

async function toggleRecord(): Promise<void> {
  try {
    if (!recorder.recording) {
      player?.pause();
      dropTake();
      await recorder.start();
      say(`Идёт запись${tags.length ? ` (теги: ${tags.join(', ')})` : ''}… говорите, затем нажмите Стоп (R)`);
    } else {
      take = await recorder.stop();
      el.takeLen.textContent = `· ${take.seconds.toFixed(1)} с`;
      renderTags();
      el.take.classList.add('show');
      say('Прослушайте дубль. Утвердить — Enter, отбросить — R. Утверждённый дубль добавится к записям этой реплики.');
    }
  } catch (e) {
    say(`Микрофон недоступен: ${(e as Error).message}`, true);
  }
  render();
}

// Store the reworded line (or drop the override when it equals the original).
async function saveText(): Promise<void> {
  const value = el.line.value.trim();
  const l = lines[index];
  state = await api.setText(l.key, spokenText(value) === l.original ? '' : value);
  showText();
}

async function approve(): Promise<void> {
  if (!take) return;
  try {
    el.btnApprove.disabled = true;
    if (textEdited()) await saveText(); // the recording matches the words on screen
    say(state.cleaning ? 'Сохраняю и очищаю от шумов…' : 'Сохраняю…');
    state = await api.save(key(), take.blob, take.seconds, tags, el.takeNote.value);
    dropTake();
    const n = takesOf(index).length;
    say(`Сохранено ✔ дубль ${n} теперь звучит в игре${n > 1 ? ' — сравните с предыдущими ниже и оставьте лучший' : ''} (перезагрузите вкладку игры)`);
    render();
  } catch (e) {
    say(`Не удалось сохранить: ${(e as Error).message}`, true);
  } finally {
    el.btnApprove.disabled = false;
  }
}

el.btnRec.onclick = toggleRecord;
el.btnPlay.onclick = () => take && play(take.url);
el.btnApprove.onclick = approve;
el.btnRetry.onclick = () => {
  dropTake(); // discard only — the actor starts the next take when ready
  say('Дубль отброшен. Нажмите «Записать», когда будете готовы');
};
el.btnRef.onclick = () => {
  // the robot clip for the wording on screen; edited lines get one after `npm run voice`
  play(`/voice/${voiceKey(spokenText(el.line.value))}.mp3`, () =>
    say('Робот ещё не озвучил этот текст — выполните npm run voice (в игре пока прозвучит ваша запись или встроенный синтезатор)', true),
  );
};
el.btnPrev.onclick = () => next(-1);
el.btnNext.onclick = () => next(1);
el.onlyMissing.onchange = render;
el.line.oninput = renderTextRow;
el.tagInput.onkeydown = (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTagsFromInput();
  } else if (e.key === 'Backspace' && !el.tagInput.value && tags.length) {
    tags.pop();
    renderTags();
  }
};
el.tagInput.onblur = addTagsFromInput;
el.btnSaveText.onclick = async () => {
  try {
    await saveText();
    say('Текст сохранён — в игре субтитр теперь такой (перезагрузите вкладку игры)');
    render();
  } catch (e) {
    say(`Не удалось сохранить текст: ${(e as Error).message}`, true);
  }
};
el.btnResetText.onclick = async () => {
  try {
    el.line.value = lines[index].original;
    await saveText();
    say('Исходный текст возвращён');
    render();
  } catch (e) {
    say(`Не удалось вернуть текст: ${(e as Error).message}`, true);
  }
};

document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && t.type !== 'checkbox')) {
    if (e.key === 'Escape') t.blur();
    return; // typing — no shortcuts
  }
  const k = e.key;
  if (k === 'r' || k === 'R' || k === 'к' || k === 'К') toggleRecord();
  else if (k === ' ') {
    e.preventDefault();
    if (take) play(take.url);
  } else if (k === 'Enter') approve();
  else if (k === 'ArrowRight') next(1);
  else if (k === 'ArrowLeft') next(-1);
  else if (k === 't' || k === 'T' || k === 'е' || k === 'Е') el.btnRef.click();
});

renderTags();
api
  .list()
  .then((s) => {
    state = s;
    showText();
    render();
    say(
      s.cleaning
        ? 'Задайте теги (по желанию), нажмите «Записать», прочитайте строку, «Стоп». У одной реплики может быть несколько дублей — сравните и выберите, какой звучит в игре.'
        : 'Нажмите «Записать», прочитайте строку, «Стоп». Очистка от шумов недоступна: выполните npm install (ffmpeg-static).',
    );
  })
  .catch((e) => {
    showText();
    render();
    say(`Студия работает только через «npm run studio» (dev-сервер): ${(e as Error).message}`, true);
  });
