const { GIPHY_KEY } = process.env;
const sample = require('lodash/sample');
const giphy = require('giphy-api')(GIPHY_KEY);
const { google } = require('googleapis');
const readYaml = require('read-yaml');

const Translator = require('../services/Translator');

const { GOOGLE } = process.env;
const googleConfig = JSON.parse(GOOGLE);
const customSearch = google.customsearch('v1');
const { search, apiLimit, fails } = readYaml.sync('./i18n/ru/request.yml');

module.exports.photo = async ({
  reply,
  match,
  logger,
  replyWithPhoto,
  replyWithAnimation,
  replyWithChatAction,
}) => {
  try {
    const { q } = match.groups;

    replyWithChatAction('upload_photo');

    const config = sample(googleConfig);

    const results = await customSearch.cse.list({
      q,
      searchType: 'image',
      imgSize: 'large',
      num: 10,
      cx: config.cx_key,
      auth: config.api_key,
    });

    const { data } = results;

    if (data.searchInformation.totalResults < 1) {
      logger.info('Empty photo search results', {
        q,
        searchConfig: config,
      });

      return reply(sample(search));
    }

    const image = sample(data.items);

    return image.mime.search(/gif/i) > 0
      ? await replyWithAnimation(image.link)
      : await replyWithPhoto(image.link);
  } catch (err) {
    if (err.errors && err.errors[0].reason === 'dailyLimitExceeded') {
      logger.error('Daily limit for google search exceeded', err.config);

      return reply(sample(apiLimit));
    }

    logger.error('Unhandled search error', err);
    return reply(sample(fails));
  }
};

const checkRegexp = /\p{Script=Cyrillic}/u;

module.exports.gif = async ({
  replyWithChatAction,
  reply,
  replyWithAnimation,
  match,
}) => {
  replyWithChatAction('upload_document');

  try {
    let { q } = match.groups;

    if (checkRegexp.test(q)) {
      q = await Translator.translate(q.trim(), 'ru', 'en');
    }

    const { data } = await giphy.random(q);

    return await replyWithAnimation(data.images.fixed_height.url);
  } catch (e) {
    return reply(sample(search));
  }
};
