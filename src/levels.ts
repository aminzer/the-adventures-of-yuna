// The Adventures of Yuna — level maps. Chapter 1: «Потерянная радуга» (The Lost Rainbow).
//
// Each character is one 48 px tile. You can draw new levels right here in a
// text editor. Legend:
//   .  empty sky
//   #  solid ground block (grass on top)
//   =  floating platform (solid)
//   P  Luna's start position
//   F  a sad friend (which animal comes from the level's `friend` field;
//      levels may have several — e.g. the squirrel siblings)
//   I  the item the friend wishes for (fetch levels only; one per friend)
//   *  sparkle star (optional collectible, purely for joy)
//   W  magic wings pickup — Luna can fly for the rest of the level
//      (hold jump to flutter up, release to float gently down)
//   B  bell-flower (song levels) — jump on it to play its note
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
//
// Kindness design rules (keep levels gentle):
//   - gaps in the ground are at most 3 tiles wide
//   - platforms are at most 3 tiles above whatever you jump from
//   - platforms never overhang a gap's jump runway (head-bonk trap)
//   - falling into a gap is always safe: the friendly cloud carries Luna back
//   - chase levels have no gaps at all (the pup only knows how to run)
// `npm run check:levels` verifies all of this.

import type { MoodName } from './audio';

export type FriendKind =
  | 'bunny' | 'bird' | 'turtle' | 'flowerbed' | 'squirrel' | 'owl' | 'fox' | 'babystar'
  | 'lark' | 'octopus' | 'puppy' | 'mama';
export type ItemKind = 'carrot' | 'berry' | 'flower' | 'wateringcan' | 'acorn' | 'glow' | 'pearl';
export type BubbleIcon = ItemKind | 'heart' | 'note' | 'ball';

export interface LevelDef {
  name: string;
  color: string;
  friend: FriendKind;
  deed: 'fetch' | 'dwell' | 'song' | 'chase';
  item: ItemKind | null; // fetch levels only
  bubble?: 'heart' | 'note' | 'ball'; // non-fetch levels: the icon in the friend's wish
  sky?: boolean; // sky level: platforms are clouds, made for flying
  water?: number; // underwater level: everything below this row is water
  melody?: number[]; // song levels: bell indexes (left to right) to play
  practice?: boolean; // the tutorial: full color, no rainbow stripe earned
  music: MoodName; // this level's background-music mood (crossfades between levels)
  story: string; // shown as a subtitle when the level begins
  map: string[];
}

export const LEVELS: LevelDef[] = [
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
      '..P..*........I....f.F..',
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
    story: 'Буря спрятала все цвета… Зайка грустит: он потерял морковку!',
    map: [
      '........................................',
      '........c....................c..........',
      '........................................',
      '........................................',
      '.....................*..................',
      '....................===.................',
      '........*.................*.............',
      '.......===...............===............',
      '..P.T............I............f....F....',
      '#############...########################',
      '#############...########################',
      '#############...########################',
    ],
  },
  {
    name: 'orange',
    music: 'sunny',
    color: '#f29b38',
    friend: 'bird',
    deed: 'fetch',
    item: 'berry',
    story: 'Птичка мечтает о сладкой ягодке. Поможем ей!',
    map: [
      '........................................',
      '..............c..................c......',
      '........................................',
      '........................................',
      '...............*........................',
      '..............===..............*........',
      '..............................===.......',
      '..................I.....................',
      '..P.........T....===.............f..F...',
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
    story: 'Черепашка мечтает о красивом цветочке.',
    map: [
      '........................................',
      '..........c................c............',
      '........................................',
      '.........*...............*..............',
      '........===.............===.............',
      '........................................',
      '..*..........I..............*...........',
      '.===........===.............===.........',
      '....P................T...f.........F....',
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
    story: 'Цветочки совсем поникли. Им очень нужна водичка!',
    map: [
      '........................................',
      '.......c....................c...........',
      '........................................',
      '..........*...............*.............',
      '.........===.............===............',
      '........................................',
      '.....*.........I.............*..........',
      '....===.......===............===........',
      '..P.....T.........f...............F..T..',
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
    story: 'Бельчата хотят жёлуди. Каждому — по одному!',
    map: [
      '........................................',
      '....c...............c...............c...',
      '........................................',
      '.........*...............*..............',
      '........===.............===.............',
      '........................................',
      '...I............*............I..........',
      '..===..........===..........===.........',
      '.P...........F....T......f.........F....',
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
    deed: 'dwell',
    item: null,
    bubble: 'note',
    story: 'Совушка крепко заснула. Постой рядом с ней тихонько…',
    map: [
      '........................................',
      '......c...............c..........c......',
      '........................................',
      '....................*...................',
      '...................===..................',
      '........................................',
      '..*...........*..........*..............',
      '.===.........===........===.............',
      '....P......T....f.............F....T....',
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
    deed: 'dwell',
    item: null,
    bubble: 'heart',
    story: 'Лисёнку очень одиноко. Побудь с ним рядом — обними его!',
    map: [
      '........................................',
      '........c................c..............',
      '........................................',
      '...............*...........*............',
      '..............===.........===...........',
      '........................................',
      '...........*..........*...........*.....',
      '..........===........===.........===....',
      '..P..........T......f..........T.....F..',
      '#####...########...########...##########',
      '#####...########...########...##########',
      '#####...########...########...##########',
    ],
  },
  {
    // The bonus sky level: the storm also knocked a baby star out of the
    // sky. The little bird Luna once helped brings her magic wings, and
    // Luna flies up through the clouds to return the baby star's golden
    // glow. Kindness comes back.
    name: 'gold',
    music: 'sky',
    color: '#ffd94d',
    friend: 'babystar',
    deed: 'fetch',
    item: 'glow',
    sky: true,
    story: 'Звёздочка упала с неба и потеряла огонёк. Птичка дарит Юне крылья! Отдыхай на облачках.',
    map: [
      '........................................',
      '.............................F..........',
      '............................===.........',
      '........................................',
      '......*.............*.............*.....',
      '...........I............................',
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
    // the lark, all the bells and Luna are always visible together, so the
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
    // the bubbles over Luna's head run out. Running out is never scary —
    // a friendly bubble simply carries her to the surface.
    name: 'water',
    music: 'sea',
    color: '#3d9be9',
    friend: 'octopus',
    deed: 'fetch',
    item: 'pearl',
    water: 3,
    story: 'Осьминожка потерял жемчужину на дне моря. Не забывай выныривать, чтобы вдохнуть!',
    map: [
      '........................................',
      '..P.......c..............c..............',
      '####....................................',
      '####....................................',
      '####............*.......................',
      '####....................*...............',
      '####............................*.......',
      '####....................................',
      '####.....s...I....##...s...##....s..F...',
      '########################################',
      '########################################',
      '########################################',
    ],
  },
  {
    // Chase level: the puppy wants to play tag — and HE is "it"! He bounds
    // after Luna; being caught is the happy ending, so she can run for fun
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
