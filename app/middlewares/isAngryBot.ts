import sample from 'lodash/sample';
import readYaml from 'read-yaml';
import { Middleware } from 'telegraf';
import { message as messageFilter } from 'telegraf/filters';

import { BotContext } from '../Connectors/Telegram';
import config from '../config';
import { isAngry } from '../utils';

const { angryBot } = readYaml.sync('./i18n/ru/request.yml');

const preveledgeMention = /^уважаемый/i;

const isAngryBot: Middleware<BotContext> = (ctx, next) => {
  if (!ctx.has(messageFilter('text'))) {
    return next();
  }

  if (
    ctx.currentUser.isAnnoy &&
    isAngry(config.BOT_DAMN_RATE) &&
    !preveledgeMention.test(ctx.message.text ?? '')
  ) {
    return ctx.reply(sample(angryBot));
  }

  return next();
};

export default isAngryBot;
