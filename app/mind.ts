import type Bot from './Bot';
import * as files from './abilities/files';
import * as game from './abilities/game';
import * as replyer from './abilities/replyer';
import * as rss from './abilities/rss';
import * as soul from './abilities/soul';
import Speech from './services/Speech';
import Translator from './services/Translator';

const translatorRegExp = new RegExp(
  `(?<lang>${Object.keys(Translator.aliases).join('|')})\\s+(?<text>.*)$`,
  'm',
);
const rapRegExp = new RegExp(
  `зачитай\\s+((?<track>${Object.keys(Speech.aliases).join('|')})\\s+)?(?<text>(.|\\n)*)$`,
  'm',
);
const rappingRegExp = new RegExp(
  `реп(ани)?\\s+((?<track>${Object.keys(Speech.aliases).join('|')})\\s+)?(?<about>(.|\\n)*)$`,
  'm',
);

export default (bot: Bot) => {
  bot.hears(/фото\s+(?<q>.*)$/, files.photo);
  bot.hears(/гиф\s+(?<q>.*)$/, files.gif);

  bot.hears(/помощь/, replyer.help);
  bot.help(replyer.help);

  bot.hears(/(т|в)ы\s+(?<text>.*)/, replyer.replyYou);
  bot.hears(/(мудак|говно).*/, replyer.replyYou);
  bot.hears(/(топ|top)$/, replyer.top);

  bot.hears(/(вещай|гороскоп)$/, soul.predict);
  bot.hears(/(пиши|пейши)$/, soul.quote);
  bot.hears(rapRegExp, soul.rap);
  bot.hears(rappingRegExp, soul.rapping);
  bot.hears(translatorRegExp, soul.translate);

  bot.hears(/(курс(ы?)|к(э|e)ш|мутк(и|а))$/, rss.currencies);
  bot.hears(/((ч(о|е|ё)\s+(там|нового)(?<q>.*))|(новости))$/, rss.news);
  bot.hears(/(баш|ебаш)$/, rss.bash);
  bot.hears(/(погода|((ч(о|е|ё)\s+за\s+окном)))$/, rss.weather);

  bot.hears(/кости$/, game.dice);

  // should be at the end cause it catch all mentions
  bot.hears(/(?<text>(.|\\n)*)$/, soul.quest);

  bot.on('message', replyer.reply);
};
