const pino = require('pino');

const { LOG_LEVEL, NODE_ENV, LOG_ENABLED } = process.env;

const logger = pino({
  enabled: LOG_ENABLED || (
    ['production', 'development'].includes(NODE_ENV)
  ),
  level: LOG_LEVEL || (
    NODE_ENV === 'production' ? 'info' : 'debug'
  ),
});

module.exports = logger;
