import { Middleware } from 'telegraf';

import { BotContext } from '../Connectors/Telegram';

const loggerMiddleware: Middleware<BotContext> = (ctx, next) => {
  ctx.logger.info(ctx.message);

  next();
};

export default loggerMiddleware;
