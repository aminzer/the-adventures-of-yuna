import { C } from '../config';
import { CHAPTERS, chapterIndexOfLevel, chapterOfLevel } from '../levels';
import { captionText } from '../textOverrides';
import type { GameCtx } from './context';

// The black "book page" between chapters: a chapter number of little stars
// and the title, gently fading in.
export function renderChapterCard(gc: GameCtx): void {
  const ctx = gc.ctx;
  const alpha = Math.min(1, gc.stateT / 0.6) * Math.min(1, (C.CHAPTER_CARD_TIME - gc.stateT) / 0.5);
  const chapter = chapterOfLevel(gc.levelIndex);
  const nth = chapterIndexOfLevel(gc.levelIndex);

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // one twinkling star per chapter, the current one glowing brightest
  for (let i = 0; i < CHAPTERS.length; i++) {
    ctx.save();
    ctx.translate(C.VIEW_W / 2 + (i - (CHAPTERS.length - 1) / 2) * 44, C.VIEW_H / 2 - 64);
    ctx.globalAlpha = Math.max(0, alpha) * (i === nth ? 1 : 0.3);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = '26px "Segoe UI", sans-serif';
    ctx.fillText('✦', 0, 0);
    ctx.restore();
  }

  const title = captionText(chapter.title).shown;
  let fontSize = 40;
  ctx.font = `600 ${fontSize}px "Segoe UI", "Comic Sans MS", sans-serif`;
  if (ctx.measureText(title).width > C.VIEW_W - 120) {
    fontSize = Math.floor((fontSize * (C.VIEW_W - 120)) / ctx.measureText(title).width);
    ctx.font = `600 ${fontSize}px "Segoe UI", "Comic Sans MS", sans-serif`;
  }
  ctx.fillStyle = '#f6ecd9';
  ctx.fillText(title, C.VIEW_W / 2, C.VIEW_H / 2 + 8);
  ctx.restore();
}
