const sample = require('lodash/sample');
const first = require('lodash/first');
const capitalize = require('lodash/capitalize');
const Parser = require('rss-parser');
const readYaml = require('read-yaml');
const axios = require('axios');
const he = require('he');

const Currencies = require('../services/Currencies');

const { NEWS_URL, BASH_URL, WEATHER_URL } = process.env;

const parser = new Parser();

const { weather } = readYaml.sync('./i18n/ru/request.yml');
const { fails } = readYaml.sync('./i18n/ru/request.yml');

module.exports.news = async ({ reply, replyWithChatAction, replyWithMarkdown }) => {
  replyWithChatAction('typing');

  try {
    const feed = await parser.parseURL(NEWS_URL);
    const item = sample(feed.items);

    return replyWithMarkdown(`*${item.title}*\n\n${item.content.trim()}`);
  } catch (e) {
    return reply(sample(fails));
  }
};

module.exports.bash = async ({ reply, replyWithChatAction }) => {
  replyWithChatAction('typing');

  try {
    const feed = await parser.parseURL(BASH_URL);
    const item = sample(feed.items);

    return reply(`${he.decode(item.content.replace(/<br>/g, '\n'))}`);
  } catch (e) {
    return reply(sample(fails));
  }
};

module.exports.currencies = async ({
  reply,
  replyWithChatAction,
  replyWithMarkdown,
  logger,
}) => {
  replyWithChatAction('typing');

  try {
    const curr = await Currencies.load();
    const findUsd = tiker => tiker.name === 'usd';

    const replyText = Object.entries(curr)
      .sort(([, a], [, b]) => {
        if (!a && !b) {
          return 0;
        }

        if (!a) {
          return 1;
        }

        if (!b) {
          return -1;
        }

        const tikerA = a.find(findUsd);
        const tikerB = b.find(findUsd);

        return tikerB.buy - tikerA.buy;
      })
      .reduce((acc, [key, value]) => {
        acc += `_${capitalize(key)}_\n`;
        if (value) {
          acc += value.map(({ name, buy }) => `*${name.toUpperCase()}*: ${buy}`).join('\n');
        } else {
          acc += '💩';
        }
        acc += '\n\n';

        return acc;
      }, '');

    return replyWithMarkdown(replyText);
  } catch (err) {
    logger.error(err, 'Request for currencies failed');

    return reply(sample(fails));
  }
};

module.exports.weather = async ({
  reply,
  replyWithChatAction,
  replyWithMarkdown,
  logger,
}) => {
  replyWithChatAction('typing');

  try {
    const res = await axios(WEATHER_URL, {
      params: {
        callback: 's',
      },
    });
    const { data: [, data] } = JSON.parse(
      res.data.trim().replace(/^s\(/, '').replace(/\);$/, ''),
    );

    const forecastKey = first(Object.keys(data.weather));
    const forecast = data.weather[forecastKey];
    const today = first(forecast.days);
    const now = first(today.fa);
    const replyArr = [
      `*${forecast.name}* - ${today.date}\n`,
      `*${weather.now}*: ${now.weather.text} ${now.weather.icon.emoji}`,
      `*${weather.air.title}*: ${today.mi.air} ~ ${today.ma.air} ${weather.air.unit}`,
      `*${weather.pressure.title}*: ${today.mi.pressure} ~ ${today.ma.pressure} ${weather.pressure.unit}`,
      `*${weather.humidity.title}*: ${now.humidity} ${weather.humidity.unit}`,
      `*${weather.wind.title}*: ${now.wind.speed} ${weather.wind.unit}`,
    ];

    return replyWithMarkdown(replyArr.join('\n'));
  } catch (err) {
    logger.error(err, 'Request for weather failed');

    return reply(sample(fails));
  }
};
