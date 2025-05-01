import config, { AppEnv } from './config';
import db from './db';
import logger from './logger';
import currentUserMiddleware from './middlewares/currentUser';
import isAngryBot from './middlewares/isAngryBot';
import isNewMessage from './middlewares/isNewMessage';
import loggerMiddleware from './middlewares/logger';
import mind from './mind';
import Speech from './services/Speech';
import { mergeRegexp } from './utils';

interface Connector {
  hears: (...args: any[]) => {};
  on: (...args: any[]) => {};
  use: (...args: any[]) => {};
  help: (...args: any[]) => {};
  launch: () => {};
}

export default class Bot {
  connectors: Connector[];
  botMentionName: RegExp;

  constructor() {
    this.connectors = [];
    this.botMentionName = /^(бот|жзяцля|тугосеря|уважаемый\sбот),?\s+/i;
  }

  async alive() {
    if (this.connectors.length < 1) {
      throw new Error('Empty connectors for bot');
    }

    await db.initialize();

    logger.info('DB connected');

    this.use(isNewMessage);

    if (config.NODE_ENV === AppEnv.development) {
      this.use(loggerMiddleware);
    }

    this.use(currentUserMiddleware);

    mind(this);

    return Promise.all(this.connectors.map((connector) => connector.launch()));
  }

  kill() {
    Speech.kill();
    db.destroy();
  }

  addConnector(connector: Connector) {
    this.connectors.push(connector);

    return this;
  }

  hears(regexp: RegExp, ...args: Parameters<Connector['hears']>) {
    const phrase = mergeRegexp(this.botMentionName, regexp);

    this.connectors.forEach((connector) => connector.hears(phrase, isAngryBot, ...args));
  }

  help(...args: Parameters<Connector['hears']>) {
    this.connectors.forEach((connector) => connector.help(...args));
  }

  on(...args: any[]) {
    this.connectors.forEach((connector) => connector.on(...args));
  }

  use(...args: any[]) {
    this.connectors.forEach((connector) => connector.use(...args));
  }
}
