const axios = require('axios');
const sample = require('lodash/sample');
const transform = require('lodash/transform');
const parser = require('fast-xml-parser');
const readYaml = require('read-yaml');

const Translator = require('../services/Translator');

const { fails, translate } = readYaml.sync('./i18n/ru/horoscope.yml');
const { HOROSCORE_URL, QUOTE_URL } = process.env;

module.exports.predict = async ({
  reply,
  currentUser,
  replyWithChatAction,
}) => {
  replyWithChatAction('typing');

  try {
    const res = await axios.get(HOROSCORE_URL);

    const predicts = transform(
      parser.parse(res.data).horo,
      (acc, predict, key) => {
        if (key !== 'date') {
          acc.push(predict);
        }
      },
      [],
    );

    const predictInd = currentUser.todayNumber % predicts.length;

    return await reply(predicts[predictInd].today);
  } catch (e) {
    return reply(sample(fails));
  }
};

module.exports.quote = async ({ replyWithChatAction, reply, replyWithMarkdown }) => {
  replyWithChatAction('typing');

  try {
    const res = await axios.get(QUOTE_URL);
    const { quoteText, quoteAuthor } = res.data;
    let quote = `${quoteText}`;

    if (quoteAuthor) {
      quote += `\n\n_${quoteAuthor}_`;
    }

    return await replyWithMarkdown(quote);
  } catch (e) {
    return reply(sample(fails));
  }
};

module.exports.translate = async ({ replyWithChatAction, reply, match }) => {
  replyWithChatAction('typing');

  const { lang, text } = match.groups;

  try {
    const fromLang = Translator.resolveAlias(lang);

    const translatedText = await Translator.translate(text, 'ru', fromLang);

    return reply(translatedText);
  } catch (e) {
    return reply(sample(translate));
  }
};
