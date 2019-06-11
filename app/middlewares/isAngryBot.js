const sample = require('lodash/sample');
const readYaml = require('read-yaml');

const { isAngry } = require('../utils');

const { angryBot } = readYaml.sync('./i18n/ru/request.yml');

const { BOT_DAMN_RATE } = process.env;

const preveledgeMention = /^уважаемый/i;

module.exports = ({ currentUser, reply, message }, next) => {
  if (currentUser.isAnnoy && isAngry(BOT_DAMN_RATE) && !preveledgeMention.test(message.text)) {
    return reply(sample(angryBot));
  }

  return next();
};
