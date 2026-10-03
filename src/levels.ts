// The Adventures of Yuna — chapters and level maps.
//
// The game is a book: CHAPTERS, each with its levels and its own final scene.
//   0 «Обучение»            — the sunny tutorial; ends with mama on the meadow
//   1 «Потерянная радуга»   — one rainbow colour per level; ends with the
//                             day rainbow party
//   2 «Новые приключения»   — the adventures beyond the rainbow; ends with
//                             the night sky of collected stars (game finale)
//
// Each character is one 48 px tile. You can draw new levels right here in a
// text editor. Legend:
//   .  empty sky
//   #  solid ground block (grass on top)
//   =  floating platform (solid)
//   P  Yuna's start position
//   F  a sad friend (which animal comes from the level's `friend` field;
//      levels may have several — e.g. the squirrel siblings)
//   I  the item the friend wishes for (fetch levels only; one per friend)
//   *  sparkle star (optional collectible, purely for joy)
//   W  magic wings pickup — Yuna can fly for the rest of the level
//      (hold jump to flutter up, release to float gently down)
//   B  bell-flower (song levels) — jump on it to play its note
//   g  firefly (gather levels) — flies after Yuna once she comes close
//   H  hide-bush (play levels) — the fox hides behind these
//   T  tree (decoration)
//   f  flower patch (decoration)
//   c  background cloud (decoration)
//   b  the little bird friend, happy (decoration — she brings the wings)
//   s  seaweed (decoration, underwater levels)
//
// Deeds:
//   fetch — find the item and bring it to the friend
//   dwell — no item: stay close to the friend for a moment (wake the owl,
//           hug the lonely fox); `bubble` is the icon shown in their wish
//   song  — the friend sings a short melody; jump on the bell-flowers in
//           the same order (`melody` indexes the bells left to right)
//   chase — a playful friend keeps just out of reach; corner it and tag it
//   gather — little fireflies join Yuna one by one and follow her; bring
//           them all to the sleeping friend to light up its night
//   play  — hide-and-seek: the friend hides behind bushes (ears peeking!),
//           find it three times; the last time it runs to Yuna for a hug
//
// Kindness design rules (keep levels gentle):
//   - gaps in the ground are at most 3 tiles wide
//   - platforms are at most 3 tiles above whatever you jump from
//   - platforms never overhang a gap's jump runway (head-bonk trap)
//   - falling into a gap is always safe: the friendly cloud carries Yuna back
//   - chase levels have no gaps at all (the pup only knows how to run)
// `npm run check:levels` verifies all of this.

import type { MoodName } from './audio';

export type FriendKind =
  | 'bunny' | 'bird' | 'turtle' | 'flowerbed' | 'squirrel' | 'owl' | 'fox' | 'babystar'
  | 'lark' | 'octopus' | 'puppy' | 'mama';
export type ItemKind = 'carrot' | 'berry' | 'flower' | 'wateringcan' | 'acorn' | 'glow' | 'pearl';
export type BubbleIcon = ItemKind | 'heart' | 'note' | 'ball' | 'firefly';

export interface LevelDef {
  name: string;
  color: string;
  friend: FriendKind;
  deed: 'fetch' | 'dwell' | 'song' | 'chase' | 'gather' | 'play';
  item: ItemKind | null; // fetch levels only
  bubble?: 'heart' | 'note' | 'ball' | 'firefly'; // non-fetch levels: the icon in the friend's wish
  sky?: boolean; // sky level: platforms are clouds, made for flying
  water?: number; // underwater level: everything below this row is water
  melody?: number[]; // song levels: bell indexes (left to right) to play
  practice?: boolean; // the tutorial: full color, no rainbow stripe earned
  music: MoodName; // this level's background-music mood (crossfades between levels)
  story: string; // shown as a subtitle when the level begins
  map: string[];
}

const ALL_LEVELS: LevelDef[] = [
  {
    // The tutorial — Юна's sunny home meadow, before the storm's grey world.
    // It teaches walking, jumping, stars, one tiny gap, and the first kind
    // deed: bringing mama a flower. No rainbow stripe — just practice.
    name: 'intro',
    practice: true,
    music: 'meadow',
    color: '#f7b9c9',
    friend: 'mama',
    deed: 'fetch',
    item: 'flower',
    story: 'Это Юна! Жми стрелки ← и →, чтобы ходить.',
    map: [
      '........................',
      '....c............c......',
      '........................',
      '........................',
      '........................',
      '........................',
      '..........*.............',
      '.........===............',
      '..P..*........F....f.I..',
      '################..######',
      '################..######',
      '################..######',
    ],
  },
  {
    name: 'red',
    music: 'meadow',
    color: '#e0524e',
    friend: 'bunny',
    deed: 'fetch',
    item: 'carrot',
    story: 'Буря унесла все цвета… А впереди на полянке кто-то грустит. Подойди, Юна, узнай, что случилось!',
    map: [
      '..........................',
      '......c.............c.....',
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.....*..........*.........',
      '...............===........',
      '..P..T..F.............I.f.',
      '##########...#############',
      '##########...#############',
      '##########...#############',
    ],
  },
  {
    name: 'orange',
    music: 'sunny',
    color: '#f29b38',
    friend: 'bird',
    deed: 'fetch',
    item: 'berry',
    story: 'Слышишь? Кто-то тихонько чирикает где-то наверху… Давай подойдём и спросим, что случилось.',
    map: [
      '........................................',
      '..............c..................c......',
      '........................................',
      '........................................',
      '...............F........................',
      '..............===..............*........',
      '..............................===.......',
      '..................*.....................',
      '..P.........T....===.............f..I...',
      '########...#############...#############',
      '########...#############...#############',
      '########...#############...#############',
    ],
  },
  {
    name: 'yellow',
    music: 'brook',
    color: '#f7d94c',
    friend: 'turtle',
    deed: 'fetch',
    item: 'flower',
    story: 'Кто-то грустно вздыхает совсем рядом. Подойди, Юна, — вдруг нужна твоя помощь?',
    map: [
      '........................................',
      '..........c................c............',
      '........................................',
      '.........*...............*..............',
      '........===.............===.............',
      '........................................',
      '..*.........................*...........',
      '.===........===.............===.........',
      '....P.....F..........T...f.........I....',
      '######...#########...###################',
      '######...#########...###################',
      '######...#########...###################',
    ],
  },
  {
    name: 'green',
    music: 'garden',
    color: '#7cc860',
    friend: 'flowerbed',
    deed: 'fetch',
    item: 'wateringcan',
    story: 'Цветочки на клумбе поникли и о чём-то шепчут. Подойди к ним поближе и послушай.',
    map: [
      '........................................',
      '.......c....................c...........',
      '........................................',
      '..........*...............*.............',
      '.........===.............===............',
      '........................................',
      '.....*.......................*..........',
      '....===.......===............===........',
      '..P.....T...F.....f...............I..T..',
      '#########...##########...###############',
      '#########...##########...###############',
      '#########...##########...###############',
    ],
  },
  {
    name: 'blue',
    music: 'breeze',
    color: '#5aa8e8',
    friend: 'squirrel',
    deed: 'fetch',
    item: 'acorn',
    story: 'Слышишь, как шуршит в ветках? Это бельчата о чём-то спорят. Подойди, Юна, узнай, в чём дело!',
    map: [
      '........................................',
      '....c...............c...............c...',
      '........................................',
      '.........*...............*..............',
      '........===.............===.............',
      '........................................',
      '...I............*............I..........',
      '..===..........===..........===.........',
      '.P..........F.F...T......f..............',
      '#######...##########...#################',
      '#######...##########...#################',
      '#######...##########...#################',
    ],
  },
  {
    name: 'indigo',
    music: 'twilight',
    color: '#7a6fd8',
    friend: 'owl',
    deed: 'gather',
    item: null,
    bubble: 'firefly',
    story: 'Совушка уснула в темноте, а её светлячки-фонарики разлетелись. Собери их для совушки!',
    map: [
      '........................................',
      '......c...............c..........c......',
      '........................................',
      '....................*...................',
      '...................===..................',
      '........................................',
      '..*...........g*.........g*.............',
      '.===.........===........===.............',
      '....P.....g.T...f................F.T....',
      '######...#########...###################',
      '######...#########...###################',
      '######...#########...###################',
    ],
  },
  {
    name: 'violet',
    music: 'lullaby',
    color: '#b07ad8',
    friend: 'fox',
    deed: 'play',
    item: null,
    bubble: 'ball',
    story: 'Лисёнок грустит совсем один… А больше всего на свете он любит играть в прятки!',
    map: [
      '........................................',
      '........c................c..............',
      '........................................',
      '...............*...........*............',
      '..............===.........===...........',
      '........................................',
      '...........*..........*...........*.....',
      '..........===........===.........===....',
      '..P.......F..T.H....f....H......T....H..',
      '#####...########...########...##########',
      '#####...########...########...##########',
      '#####...########...########...##########',
    ],
  },
  {
    // The bonus sky level: the storm also knocked a baby star out of the
    // sky. The little bird Yuna once helped brings her magic wings, and
    // Yuna flies up through the clouds to return the baby star's golden
    // glow. Kindness comes back.
    name: 'gold',
    music: 'sky',
    color: '#ffd94d',
    friend: 'babystar',
    deed: 'fetch',
    item: 'glow',
    sky: true,
    story: 'Высоко в облаках кто-то мерцает и зовёт на помощь. Птичка дарит Юне крылья — лети туда и отдыхай на облачках!',
    map: [
      '........................................',
      '.............................I..........',
      '............................===.........',
      '........................................',
      '......*.............*.............*.....',
      '...........F............................',
      '..........===...........................',
      '........................................',
      '...........................*............',
      '..........................===...........',
      '........................................',
      '........*...............................',
      '.......===..............................',
      '........................................',
      '..................*.....................',
      '.................===....................',
      '........................................',
      '..P..b..W.....T..........f..............',
      '##############################...#######',
      '##############################...#######',
      '##############################...#######',
    ],
  },
  {
    // Music level: the lark forgot its song. It is a single-screen "stage" —
    // the lark, all the bells and Yuna are always visible together, so the
    // child can watch the notes fly from the bird's beak onto the bells,
    // then jump on them in the same order to give the song back.
    name: 'song',
    music: 'quiet',
    color: '#f7b32b',
    friend: 'lark',
    deed: 'song',
    item: null,
    bubble: 'note',
    melody: [0, 1, 3],
    story: 'Жаворонок забыл свою песенку. Попрыгай по колокольчикам в том же порядке!',
    map: [
      '....................',
      '...c..........c.....',
      '....................',
      '....................',
      '....................',
      '....................',
      '........*......*....',
      '....................',
      '.P..F..B..B..B..B.T.',
      '####################',
      '####################',
      '####################',
    ],
  },
  {
    // Underwater level: dive for the pearl, and swim up for air before
    // the bubbles over Yuna's head run out. Running out is never scary —
    // a friendly bubble simply carries her to the surface.
    name: 'water',
    music: 'sea',
    color: '#3d9be9',
    friend: 'octopus',
    deed: 'fetch',
    item: 'pearl',
    water: 3,
    story: 'Глубоко в море, среди водорослей, кто-то грустит. Нырни к нему, Юна, — только не забывай выныривать, чтобы вдохнуть!',
    map: [
      '........................................',
      '..P.......c..............c..............',
      '####....................................',
      '####....................................',
      '####............*.......................',
      '####....................*...............',
      '####............................*.......',
      '####....................................',
      '####.....s...F....##...s...##....s..I...',
      '########################################',
      '########################################',
      '########################################',
    ],
  },
  {
    // Chase level: the puppy wants to play tag — and HE is "it"! He bounds
    // after Yuna; being caught is the happy ending, so she can run for fun
    // as long as she likes and simply stop when she's ready.
    name: 'chase',
    music: 'playful',
    color: '#c98a5b',
    friend: 'puppy',
    deed: 'chase',
    item: null,
    bubble: 'ball',
    story: 'Щенок хочет поиграть в догонялки! Он водит — убегай, пока не устанешь!',
    map: [
      '........................................',
      '........c..................c............',
      '........................................',
      '........................................',
      '........................................',
      '........................................',
      '.........*..........*..........*........',
      '........===........===........===.......',
      '..P...T.....F.....f......f...........T..',
      '########################################',
      '########################################',
      '########################################',
    ],
  },
];

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------
export interface ChapterDef {
  name: string;
  title: string; // Russian; shown on the chapter card between chapters and voiced
  finale: 'meadow' | 'rainbowParty' | 'night'; // the chapter's final scene
  finaleMusic: MoodName;
  earnsStripe: boolean; // this chapter's levels each restore a rainbow stripe
  levels: LevelDef[];
}

const byName = (...names: string[]): LevelDef[] => names.map((n) => ALL_LEVELS.find((l) => l.name === n)!);

export const CHAPTERS: ChapterDef[] = [
  {
    name: 'intro',
    title: 'Обучение',
    finale: 'meadow',
    finaleMusic: 'meadow',
    earnsStripe: false,
    levels: byName('intro'),
  },
  {
    name: 'rainbow',
    title: 'Глава первая. Потерянная радуга',
    finale: 'rainbowParty',
    finaleMusic: 'sunny',
    earnsStripe: true, // exactly the seven stripes of C.RAINBOW
    levels: byName('red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'),
  },
  {
    name: 'beyond',
    title: 'Глава вторая. Новые приключения',
    finale: 'night',
    finaleMusic: 'night',
    earnsStripe: false, // the rainbow is whole; these levels reward with friends and stars
    levels: byName('gold', 'song', 'water', 'chase'),
  },
];

// The flat play order the rest of the game works with.
export const LEVELS: LevelDef[] = CHAPTERS.flatMap((c) => c.levels);

export function chapterIndexOfLevel(levelIndex: number): number {
  let n = 0;
  for (let c = 0; c < CHAPTERS.length; c++) {
    n += CHAPTERS[c].levels.length;
    if (levelIndex < n) return c;
  }
  return CHAPTERS.length - 1;
}

export const chapterOfLevel = (levelIndex: number): ChapterDef => CHAPTERS[chapterIndexOfLevel(levelIndex)];

// Last level of its chapter → the chapter's final scene comes next.
export const isChapterEnd = (levelIndex: number): boolean =>
  levelIndex + 1 >= LEVELS.length || chapterIndexOfLevel(levelIndex + 1) !== chapterIndexOfLevel(levelIndex);

// First level of its chapter → a chapter card is shown before it.
export const isChapterStart = (levelIndex: number): boolean =>
  levelIndex === 0 || chapterIndexOfLevel(levelIndex - 1) !== chapterIndexOfLevel(levelIndex);

// Index of a chapter's first level in the flat play order.
export const chapterStartLevel = (chapter: number): number =>
  CHAPTERS.slice(0, chapter).reduce((n, c) => n + c.levels.length, 0);

// How many rainbow stripes are already earned when a level begins.
export const stripesBeforeLevel = (levelIndex: number): number =>
  LEVELS.slice(0, levelIndex).filter((_, i) => chapterOfLevel(i).earnsStripe).length;

