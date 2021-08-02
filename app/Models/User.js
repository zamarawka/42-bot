const {
  Model,
  INTEGER,
  STRING,
} = require('sequelize');

const { BOT_DAMN_RATE } = process.env;
const sequelize = require('.');
const { isAngry } = require('../utils');

const notEmpty = str => (str || '');

class User extends Model {
  get todayNumber() {
    return this.uid + (new Date()).getDate();
  }

  get viewName() {
    return (this.name ? `@${this.name}` : `${notEmpty(this.first_name)} ${notEmpty(this.last_name)}`).trim();
  }

  get isAnnoy() {
    return isAngry(BOT_DAMN_RATE);
  }
}

User.init({
  uid: {
    type: INTEGER,
    unique: true,
  },
  name: STRING,
  role: {
    type: STRING,
    defaultValue: 'new',
  },
  first_name: STRING,
  last_name: STRING,
}, {
  sequelize,
  modelName: 'user',
  underscored: true,
});

module.exports = User;
