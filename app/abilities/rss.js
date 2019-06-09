const sample = require('lodash/sample');
const Parser = require('rss-parser');
const readYaml = require('read-yaml');
const he = require('he');

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
