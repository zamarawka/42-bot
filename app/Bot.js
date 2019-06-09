const db = require('./Models');
const logger = require('./logger');
const { mergeRegexp } = require('./utils');
const mind = require('./mind');
const isAngryBot = require('./middlewares/isAngryBot');
const currentUserMiddleware = require('./middlewares/currentUser');
const loggerMiddleware = require('./middlewares/logger');

const { NODE_ENV } = process.env;

class Bot {
  constructor() {
    this.connectors = [];
    this.botMentionName = /^(бот|жзяцля|тугосеря|уважаемый\sбот),?\s+/i;
  }

  async alive() {
    if (this.connectors.length < 1) {
      throw new Error('Empty connectors for bot');
    }

    await db.authenticate();

    logger.info('DB connected');

    if (NODE_ENV === 'development') {
      this.use(loggerMiddleware);
    }

    this.use(currentUserMiddleware);

    mind(this);

    return Promise.all(
      this.connectors.map(connector => connector.launch()),
    );
  }

  addConnector(connector) {
    this.connectors.push(connector);

    return this;
  }

  hears(regexp, ...args) {
    const phrase = mergeRegexp(this.botMentionName, regexp);

    this.connectors.forEach(connector => connector.hears(phrase, isAngryBot, ...args));
  }

  on(...args) {
    this.connectors.forEach(connector => connector.on(...args));
  }

  use(...args) {
    this.connectors.forEach(connector => connector.use(...args));
  }
}

module.exports = Bot;
