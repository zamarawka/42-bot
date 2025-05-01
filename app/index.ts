// sort-imports-ignore
import 'reflect-metadata';

import './config';

import logger from './logger';
import Bot from './Bot';
import Telegram from './Connectors/Telegram';

logger.info('Bot startup');

const bot = new Bot();

bot.addConnector(new Telegram());

bot.alive().then(() => {
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

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Bot is suck');

  bot.kill();

  process.exit(1);
});
