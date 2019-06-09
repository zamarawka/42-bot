const sample = require('lodash/sample');
const random = require('lodash/random');
const template = require('lodash/template');
const readYaml = require('read-yaml');

const { dice } = readYaml.sync('./i18n/ru/game.yml');

const templateConfig = {
  interpolate: /\${([\s\S]+?)}/g,
};

module.exports.dice = async ({ reply, currentUser }) => {
  const game = Array.from({ length: 4 }).map(() => random(6));

  const total = game[0] + game[1] - game[2] - game[3];

  let str = template(sample(dice.play), templateConfig)({
    username: currentUser.viewName,
    user_dice_one: game[0],
    user_dice_two: game[1],
    bot_dice_one: game[2],
    bot_dice_two: game[3],
  });

  str += '\n...\n\n';

  let resTempl;

  if (total > 0) {
    resTempl = dice.win;
  } else if (total < 0) {
    resTempl = dice.lose;
  } else {
    resTempl = dice.draw;
  }

  str += template(sample(resTempl), templateConfig)({
    username: currentUser.viewName,
  });

  reply(str);
};
