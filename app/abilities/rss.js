const sample = require('lodash/sample');
const capitalize = require('lodash/capitalize');
const Parser = require('rss-parser');
const readYaml = require('read-yaml');
const he = require('he');

const Currencies = require('../services/Currencies');

const { NEWS_URL, BASH_URL } = process.env;

const parser = new Parser();

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
    let replyText = '';

    Object.entries(curr).forEach(([key, value]) => {
      replyText += `_${capitalize(key)}_\n`;
      replyText += value.map(({ name, buy }) => `*${name.toUpperCase()}*: ${buy}`).join('\n');
      replyText += '\n\n';
    });

    return replyWithMarkdown(replyText);
  } catch (err) {
    logger.error('Request for currencies failed', err);

    return reply(sample(fails));
  }
};
