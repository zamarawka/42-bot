const sample = require('lodash/sample');
const readYaml = require('read-yaml');

const { angryBot } = readYaml.sync('./i18n/ru/request.yml');

const preveledgeMention = /^уважаемый/i;

module.exports = ({ currentUser, reply, message }, next) => {
  if (currentUser.isAnnoy && !preveledgeMention.test(message.text)) {
    return reply(sample(angryBot));
  }

  return next();
};
