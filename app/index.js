require('./config');

const logger = require('./logger');
const Bot = require('./Bot');
const Telegram = require('./Connectors/Telegram');

logger.info('Bot startup');

const bot = new Bot();

bot.addConnector(
  new Telegram(),
);

bot.alive()
  .then(() => {
    logger.info('Bot alive');
  });
