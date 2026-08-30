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
  bloom: 'Цвета возвращаются! 🌈',
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
  introJump: 'Здорово! Теперь прыгни: ПРОБЕЛ или стрелка ↑!',
  introGo: 'Ты всё умеешь! Собери звёздочки и отнеси маме цветочек.',
  finale: 'Ура! Все цвета вернулись! Спасибо, Юна!',
  // one generic line (no numbers) so a real voice can record it once
  finaleStars: 'Посмотри, как много в небе сияет звёздочек — все, что ты собрала!',
} as const;

// What to say the moment a friend becomes happy.
export function satisfiedText(level: LevelDef, friend: FriendKind): string {
  if (friend === 'mama') return 'Мама так рада! Теперь Юна готова к приключениям.';
  if (level.deed === 'fetch' && level.item) return TEXTS.given(level.item, friend);
  switch (friend) {
    case 'owl': return 'Совушка проснулась! Доброе утро!';
    case 'fox': return 'Лисёнок больше не одинок! ❤';
    case 'lark': return 'Песенка вернулась! Жаворонок поёт!';
    case 'puppy': return 'Щенок догнал Юну! Ура, как весело!';
    default: return 'Какая ты добрая, Юна!';
  }
}
