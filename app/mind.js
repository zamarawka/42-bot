const replyer = require('./abilities/replyer');
const files = require('./abilities/files');
const soul = require('./abilities/soul');
const game = require('./abilities/game');
const rss = require('./abilities/rss');

const Translator = require('./services/Translator');

const translatorRegExp = new RegExp(`(?<lang>${Object.keys(Translator.aliases).join('|')})\\s+(?<text>.*)$`, 'm');

module.exports = (bot) => {
  bot.hears(/фото\s+(?<q>.*)$/, files.photo);
  bot.hears(/гиф\s+(?<q>.*)$/, files.gif);

  bot.hears(/(т|в)ы\s+(?<text>.*)/, replyer.replyYou);
  bot.hears(/(мудак|говно).*/, replyer.replyYou);
  bot.hears(/(топ|top)$/, replyer.top);

  bot.hears(/(вещай|гороскоп)$/, soul.predict);
  bot.hears(/(пиши|пейши)$/, soul.quote);
  bot.hears(translatorRegExp, soul.translate);

  bot.hears(/((ч(о|е|ё)\s+(там|нового)(?<q>.*))|(новости))$/, rss.news);
  bot.hears(/(баш|ебаш)$/, rss.bash);

  bot.hears(/кости$/, game.dice);

  bot.on('message', replyer.reply);
};
