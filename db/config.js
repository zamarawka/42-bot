const path = require('path');

if (!process.env.DB_PATH) {
  // eslint-disable-next-line global-require
  require('../app/config');
}

const { DB_PATH } = process.env;

module.exports = {
  dialect: 'sqlite',
  storage: path.resolve(DB_PATH),
};
