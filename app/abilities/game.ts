import random from 'lodash/random';
import sample from 'lodash/sample';
import template from 'lodash/template';
import readYaml from 'read-yaml';

import { BotContext } from '../Connectors/Telegram';

const { dice: locale } = readYaml.sync('./i18n/ru/game.yml');

const templateConfig = {
  interpolate: /\${([\s\S]+?)}/g,
};

export async function dice(ctx: BotContext) {
  const game = Array.from({ length: 4 }).map(() => random(6));

  const total = game[0] + game[1] - game[2] - game[3];

  let str = template(
    sample(locale.play),
    templateConfig,
  )({
    username: ctx.currentUser.viewName,
    user_dice_one: game[0],
    user_dice_two: game[1],
    bot_dice_one: game[2],
    bot_dice_two: game[3],
  });

  str += '\n...\n\n';

  let resTempl;

  if (total > 0) {
    resTempl = locale.win;
  } else if (total < 0) {
    resTempl = locale.lose;
  } else {
    resTempl = locale.draw;
  }

  str += template(
    sample(resTempl),
    templateConfig,
  )({
    username: ctx.currentUser.viewName,
  });

  ctx.reply(str);
}
