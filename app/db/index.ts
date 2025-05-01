import { join, resolve } from 'path';
import { DataSource } from 'typeorm';

import config, { LogLevels } from '../config';
import Phrase from './Phrase';
import User from './User';

const appDataSource = new DataSource({
  type: 'sqlite',
  database: resolve(config.DB_PATH),
  entities: [User, Phrase],
  logging: config.LOG_LEVEL === LogLevels.debug,
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
});

export default appDataSource;
