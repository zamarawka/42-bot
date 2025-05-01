import { Context, Middleware, Telegraf } from 'telegraf';
import { MatchedMiddleware } from 'telegraf/typings/composer';
import { MessageSubType, UpdateType } from 'telegraf/typings/telegram-types';

import config from '../config';
import type User from '../db/User';
import logger from '../logger';

export interface BotContext extends Context {
  logger: typeof logger;
  currentUser: User;
}

export type MessageTypes = UpdateType | MessageSubType | 'channel_post';

export type BotContextFor<T extends MessageTypes> = Parameters<
  // @ts-ignore
  MatchedMiddleware<BotContext, T>[0]
>[0];

export default class Telegram {
  private bot: Telegraf<BotContext>;

  constructor() {
    if (!config.APP_TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram connector: bot token empty!');
    }

    this.bot = new Telegraf<BotContext>(config.APP_TELEGRAM_BOT_TOKEN);

    this.bot.context.logger = logger.child({ connector: 'Telegram' });

    this.bot.catch((err) => {
      logger.error(err);

      throw err;
    });
  }

  hears(...args: Parameters<(typeof this.bot)['hears']>) {
    return this.bot.hears(...args);
  }

  help(...args: Parameters<(typeof this.bot)['help']>) {
    return this.bot.help(...args);
  }

  on(...args: Parameters<(typeof this.bot)['on']>) {
    return this.bot.on(...args);
  }

  use(...args: Middleware<BotContext>[]) {
    return this.bot.use(...args);
  }

  launch() {
    return this.bot.launch();
  }
}
