const Telegraf = require('telegraf');

const logger = require('../logger');

const { APP_TELEGRAM_BOT_TOKEN } = process.env;

class Telegram {
  constructor() {
    this.bot = new Telegraf(APP_TELEGRAM_BOT_TOKEN);

    this.bot.context.logger = logger.child({ connector: 'Telegram' });

    this.bot.catch((err) => {
      logger.error(err);
    });
  }

  hears(...args) {
    return this.bot.hears(...args);
  }

  on(...args) {
    return this.bot.on(...args);
  }

  use(...args) {
    return this.bot.use(...args);
  }

  launch() {
    return this.bot.launch();
  }
}

module.exports = Telegram;
