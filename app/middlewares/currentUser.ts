import { Middleware } from 'telegraf';

import { type BotContext } from '../Connectors/Telegram';
import User from '../db/User';

const currentUserMiddleware: Middleware<BotContext> = async (ctx, next) => {
  const { from } = ctx;

  if (!from) {
    return;
  }

  const user = await User.findOrCreate(from.id, {
    name: from.username,
    firstName: from.first_name,
    lastName: from.last_name,
    role: 'new',
  });

  ctx.currentUser = user;

  next();
};

export default currentUserMiddleware;
