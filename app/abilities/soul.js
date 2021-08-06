const axios = require('axios');
const sample = require('lodash/sample');
const transform = require('lodash/transform');
const parser = require('fast-xml-parser');
const readYaml = require('read-yaml');

const Speech = require('../services/Speech');
const Translator = require('../services/Translator');

const { fails } = readYaml.sync('./i18n/ru/horoscope.yml');
const { angryBot, fails: reqFails, translate: i18nTranslate } = readYaml.sync('./i18n/ru/request.yml');
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

    return await reply(translatedText);
  } catch (e) {
    return reply(sample(i18nTranslate));
  }
};

module.exports.rap = async ({
  replyWithChatAction,
  reply,
  replyWithVoice,
  match,
  logger,
}) => {
  const { track = 'крово', text } = match.groups;

  if (!text || text.length > 2500) {
    return reply(sample(angryBot));
  }

  replyWithChatAction('record_voice');

  try {
    const trackFile = Speech.resolveAlias(track);

    const source = await Speech.rap(text, trackFile);

    source.on('error', (err) => {
      logger.error({ text, track, err }, 'Rap source error.');

      reply(sample(reqFails));
    });

    return await replyWithVoice({ source });
  } catch (err) {
    logger.error({ text, track, err }, 'Rap request failed');

    return reply(sample(reqFails));
  }
};
