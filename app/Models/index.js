const path = require('path');
const Sequelize = require('sequelize');

const { DB_PATH } = process.env;

const sequelize = new Sequelize(`sqlite:${path.resolve(DB_PATH)}`, {
  // eslint-disable-next-line no-console
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize;
