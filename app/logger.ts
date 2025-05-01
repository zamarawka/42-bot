import pino from 'pino';

import config from './config';

const logger = pino({
  enabled: config.LOG_ENABLED,
  level: config.LOG_LEVEL,
});

export default logger;
