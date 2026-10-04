// Russian subtitles for the story and for game events.
// (The target player is a Russian-speaking girl — texts are warm and simple.)
import type { FriendKind, ItemKind, LevelDef } from './levels';

// item names in the accusative case: «Юна нашла …»
const ITEM_ACC: Record<ItemKind, string> = {
  carrot: 'морковку',
  berry: 'ягодку',
  flower: 'цветочек',
  wateringcan: 'леечку',
  acorn: 'жёлудь',
  glow: 'огонёк',
  pearl: 'жемчужину',
  dandelion: 'одуванчик',
};

// friend names in the dative case: «…подарила зайчику»
const FRIEND_DAT: Record<FriendKind, string> = {
  bunny: 'зайчику',
  bird: 'птичке',
  turtle: 'черепашке',
  flowerbed: 'цветочкам',
  squirrel: 'бельчонку',
  owl: 'совушке',
  fox: 'лисёнку',
  babystar: 'звёздочке',
  lark: 'жаворонку',
  octopus: 'осьминожке',
  puppy: 'щенку',
  mama: 'маме',
};

export const TEXTS = {
  pickup: (item: ItemKind): string => `Юна нашла ${ITEM_ACC[item]}!`,
  given: (item: ItemKind, friend: FriendKind): string => `Юна подарила ${ITEM_ACC[item]} ${FRIEND_DAT[friend]}! ❤`,
  bloom: 'Цвета радуги возвращаются! 🌈',
  star: 'Звёздочка! ✨',
  wings: 'У Юны выросли волшебные крылья! Держи прыжок, чтобы лететь.',
  wingsTired: 'Крылышки устали. Отдохни на облачке!',
  wingsReady: 'Крылышки снова готовы! ✨',
  rescue: 'Облачко спешит на помощь!',
  airLow: 'Воздух заканчивается — плыви наверх!',
  bubbleLift: 'Пора подышать! Пузырик поднимает Юну.',
  listen: 'Слушай песенку…',
  yourTurn: 'Теперь ты! Прыгай по колокольчикам в том же порядке!',
  wrongNote: 'Почти! Послушай ещё разок…',
  chaseOn: 'Догонялки начались! Щенок водит — убегай!',
  chaseSwap: 'Поймал! Теперь водит Юна — догони щенка!',
  introJump: 'Здорово! Теперь прыгни: ПРОБЕЛ или стрелка ↑!',
  introGo: 'Ты всё умеешь! Собери звёздочки и отнеси маме цветочек.',
  fireflyFollow: 'Светлячок полетел за Юной! Собери их всех.',
  fireflyHome: 'Светлячок сел рядом с совушкой!',
  hidePlea: 'Юна, давай поиграем в прятки! Попробуй меня найти!',
  hideFound: 'Нашла! Лисёнок хихикает — и прячется снова…',
  hideLast: 'Опять нашла! Лисёнок бежит обниматься!',
  pauseContinue: 'Продолжить',
  pauseToMenu: 'В главное меню',
  introDone: 'Юна всему научилась! Пора в путь — спасать радугу!',
  finale: 'Ура! Все цвета вернулись! Спасибо, Юна!',
  rainbowNext: 'Но приключения Юны только начинаются…',
  goodnight: 'Какое чудесное было приключение! А теперь — спокойной ночи, Юна!',
  // one generic line (no numbers) so a real voice can record it once
  finaleStars: 'Посмотри, как много в небе сияет звёздочек — все, что ты собрала!',
} as const;

// Each fetch friend's plea — spoken the first time Yuna comes close. Only
// after the plea does the wished-for item appear in the world.
export const ASK_HELP: Partial<Record<FriendKind, string>> = {
  mama: 'Юна, сорви для меня, пожалуйста, красивый цветочек!',
  bunny: 'Юна, помоги! Я потерял свою вкусную морковку…',
  bird: 'Юна, помоги! Мои птенчики проголодались, а я не могу оставить гнёздышко… Принеси нам, пожалуйста, сладкую ягодку!',
  turtle: 'Юна, на самой вершине холма растёт пушистый одуванчик… А я ползу так медленно — никак не доберусь! Принеси его мне, пожалуйста!',
  flowerbed: 'Мы совсем засыхаем… Принеси нам, пожалуйста, леечку!',
  squirrel: 'Юна, помоги! Мы с братиком потеряли наши жёлуди…',
  babystar: 'Юна, помоги! Я потеряла свой огонёк…',
  octopus: 'Юна, помоги! Моя жемчужина укатилась далеко на дно…',
};

// What to say the moment a friend becomes happy.
export function satisfiedText(level: LevelDef, friend: FriendKind): string {
  if (friend === 'mama') return 'Мама так рада! Теперь Юна готова к приключениям.';
  if (level.deed === 'fetch' && level.item) return TEXTS.given(level.item, friend);
  switch (friend) {
    case 'owl': return 'Светлячки светят совушке! Она проснулась — как уютно!';
    case 'fox': return 'Как весело было играть! Теперь Юна и лисёнок — лучшие друзья. ❤';
    case 'lark': return 'Песенка вернулась! Жаворонок поёт!';
    case 'puppy': return 'Юна догнала щенка! Ура, как весело было играть!';
    default: return 'Какая ты добрая, Юна!';
  }
}
