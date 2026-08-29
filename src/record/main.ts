// The recording studio: walk through every narrator line, record it with a
// real voice, listen, approve (→ the dev server keeps the raw take in
// voice-takes/ and puts a noise-cleaned copy in public/voice-actor/) or try
// again. The text itself can be reworded; the game shows and speaks the new
// wording. Lines without a recording keep using the TTS clip.
import { allSpokenGroups } from '../voiceLines';
import { spokenText, voiceKey } from '../voiceText';
import { api, type StudioState } from './api';
import { Recorder, type Take } from './recorder';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const el = {
  count: $('count'), barFill: $('barFill'), onlyMissing: $<HTMLInputElement>('onlyMissing'),
  pos: $('pos'), badge: $('badge'), line: $<HTMLTextAreaElement>('line'), textRow: $('textRow'), orig: $('orig'),
  meter: $('meter'), take: $('take'), takeLen: $('takeLen'), status: $('status'), list: $('list'),
  btnSaveText: $<HTMLButtonElement>('btnSaveText'), btnResetText: $<HTMLButtonElement>('btnResetText'),
  btnRec: $<HTMLButtonElement>('btnRec'), btnRef: $<HTMLButtonElement>('btnRef'), btnSaved: $<HTMLButtonElement>('btnSaved'),
  btnRaw: $<HTMLButtonElement>('btnRaw'), btnDelete: $<HTMLButtonElement>('btnDelete'), btnPlay: $<HTMLButtonElement>('btnPlay'),
  btnApprove: $<HTMLButtonElement>('btnApprove'), btnRetry: $<HTMLButtonElement>('btnRetry'),
  btnPrev: $<HTMLButtonElement>('btnPrev'), btnNext: $<HTMLButtonElement>('btnNext'),
};

const groups = allSpokenGroups();
const lines = groups.flatMap((g) => g.lines);
const where = groups.flatMap((g) => g.lines.map(() => g.title)); // level title per line
let state: StudioState = { clips: {}, texts: {}, cleaning: false };
let index = Math.min(Number(localStorage.getItem('studio.index') ?? 0) || 0, lines.length - 1);
let take: Take | null = null;
let player: HTMLAudioElement | null = null;

const recorder = new Recorder((level) => {
  el.meter.style.width = `${Math.min(100, level * 140).toFixed(1)}%`;
});

const key = (): string => lines[index].key;
// The wording currently in the game for a line (actor's version or the original).
const currentText = (i: number): string => state.texts[lines[i].key] ?? lines[i].original;
const textEdited = (): boolean => el.line.value.trim() !== currentText(index);

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
}

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

function render(): void {
  const has = Boolean(state.clips[key()]);
  const done = lines.filter((l) => state.clips[l.key]).length;
  el.count.textContent = `записано ${done} из ${lines.length}`;
  el.barFill.style.width = `${(100 * done) / lines.length}%`;
  el.pos.textContent = `${where[index]} · строка ${index + 1} / ${lines.length} · ${key()}`;
  el.badge.textContent = has ? (state.cleaning ? '🎙 есть запись · ✨ очищена' : '🎙 есть запись') : '🤖 пока робот';
  el.badge.className = `badge ${has ? 'actor' : 'robot'}`;
  el.btnSaved.disabled = !has;
  el.btnRaw.disabled = !has;
  el.btnRaw.hidden = !state.cleaning;
  el.btnDelete.disabled = !has;
  el.btnRec.textContent = recorder.recording ? '⏹ Стоп' : '⏺ Записать';
  el.btnRec.classList.toggle('on', recorder.recording);
  el.btnPrev.disabled = index === 0;
  el.btnNext.disabled = index === lines.length - 1;
  localStorage.setItem('studio.index', String(index));
  renderTextRow();

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
      a.textContent = `${i + 1}. ${currentText(i)}${state.texts[l.key] ? ' ✎' : ''}`;
      a.className = `${state.clips[l.key] ? 'done' : ''} ${i === index ? 'cur' : ''}`;
      a.onclick = (e) => {
        e.preventDefault();
        go(i);
      };
      nodes.push(a);
      return nodes;
    }),
  );
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
  if (el.onlyMissing.checked) while (i >= 0 && i < lines.length && state.clips[lines[i].key]) i += dir;
  if (i >= 0 && i < lines.length) go(i);
}

async function toggleRecord(): Promise<void> {
  try {
    if (!recorder.recording) {
      player?.pause();
      dropTake();
      await recorder.start();
      say('Идёт запись… говорите, затем нажмите Стоп (R)');
    } else {
      take = await recorder.stop();
      el.takeLen.textContent = `· ${take.seconds.toFixed(1)} с`;
      el.take.classList.add('show');
      say('Прослушайте дубль. Утвердить — Enter, отбросить — R');
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
    state = await api.save(key(), take.blob);
    dropTake();
    say(`Сохранено ✔${state.cleaning ? ' и очищено —' : ' —'} можно записывать дальше или проверить в игре (перезагрузите её вкладку; Shift+L и цифра — выбор уровня)`);
    render();
    setTimeout(() => next(1), 350); // move on; the filter decides where to
  } catch (e) {
    say(`Не удалось сохранить: ${(e as Error).message}`, true);
  } finally {
    el.btnApprove.disabled = false;
  }
}

async function remove(): Promise<void> {
  if (!state.clips[key()] || !confirm('Удалить запись этой строки?')) return;
  try {
    state = await api.remove(key());
    say('Запись удалена — строка снова читается роботом');
    render();
  } catch (e) {
    say(`Не удалось удалить: ${(e as Error).message}`, true);
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
el.btnSaved.onclick = () => play(`/voice-actor/${state.clips[key()]}?v=${Date.now()}`);
el.btnRaw.onclick = () => play(api.rawUrl(key()));
el.btnDelete.onclick = remove;
el.btnPrev.onclick = () => next(-1);
el.btnNext.onclick = () => next(1);
el.onlyMissing.onchange = render;
el.line.oninput = renderTextRow;
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
  if (e.target instanceof HTMLTextAreaElement) {
    if (e.key === 'Escape') el.line.blur();
    return; // typing the new wording — no shortcuts
  }
  if (e.target instanceof HTMLInputElement) return;
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

api
  .list()
  .then((s) => {
    state = s;
    showText();
    render();
    say(
      s.cleaning
        ? 'Нажмите «Записать», прочитайте строку, нажмите «Стоп». Утверждённая запись очищается от шумов автоматически. Текст можно править прямо в поле.'
        : 'Нажмите «Записать», прочитайте строку, нажмите «Стоп». Очистка от шумов недоступна: выполните npm install (ffmpeg-static).',
    );
  })
  .catch((e) => {
    showText();
    render();
    say(`Студия работает только через «npm run studio» (dev-сервер): ${(e as Error).message}`, true);
  });
