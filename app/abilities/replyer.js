const get = require('lodash/get');
const sample = require('lodash/sample');
const readYaml = require('read-yaml');

const db = require('../Models');
const Phrase = require('../Models/Phrase');
const User = require('../Models/User');
const { isAngry } = require('../utils');

const replies = readYaml.sync('./i18n/ru/replies.yml');
const { help } = readYaml.sync('./i18n/ru/request.yml');

module.exports.reply = async ({
  reply,
  message,
  currentUser,
  replyWithChatAction,
}) => {
  if (message.text) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in replies) {
      const reg = new RegExp(key, 'i');

      if (message.text.match(reg)) {
        const repl = replies[key];

        if (Array.isArray(repl)) {
          return reply(sample(repl));
        }

        if (isAngry(repl.rate)) {
          return reply(sample(repl.answers));
        }
      }
    }
  }

  if (currentUser.isAnnoy) {
    replyWithChatAction('typing');

    const phrase = await Phrase.findOne({ order: db.random() });

    return reply(`${currentUser.viewName}, ты ${phrase.content}`);
  }

  return null;
};

module.exports.replyYou = async ({
  reply,
  currentUser,
  replyWithChatAction,
  match,
}) => {
  await replyWithChatAction('typing');

  const newPhrase = get(match, 'groups.text', '').trim();

  if (newPhrase) {
    Phrase.create({
      user_id: currentUser.id,
      content: newPhrase,
    });
  }

  const phrase = await Phrase.findOne({ order: db.random() });

  return reply(`${currentUser.viewName}, а ты ${phrase.content}`);
};

module.exports.top = async ({ replyWithChatAction, reply }) => {
  replyWithChatAction('typing');

  const top = await Phrase.findAll({
    include: [User],
    attributes: {
      include: [[db.fn('COUNT', db.col('content')), 'praseCount']],
    },
    group: ['user_id'],
    order: db.literal('praseCount DESC'),
    limit: 15,
  });

  const table = top.map(({ user, dataValues }) => `${dataValues.praseCount} - ${user.viewName}`).join('\n');

  return reply(`${table}\nВсего: ${top.length}`);
};

module.exports.help = ({ reply }) => reply(help.join('\n'));
