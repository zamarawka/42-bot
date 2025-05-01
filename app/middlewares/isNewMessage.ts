import { Middleware } from 'telegraf';

import { BotContext } from '../Connectors/Telegram';

const FRESH_MESSAGE = 60; // seconds

const isNewMessage: Middleware<BotContext> = (ctx, next) => {
  if (!ctx.message) {
    return;
  }

  const { date } = ctx.message;

  if (Date.now() / 1000 > date + FRESH_MESSAGE) {
    return;
  }

  return next();
};

export default isNewMessage;
