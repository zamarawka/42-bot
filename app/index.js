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

const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
signals.forEach((signal) => {
  process.once(signal, () => {
    bot.kill();

    logger.info('Bot is dead');

    process.kill(process.pid, signal);
  });
});
