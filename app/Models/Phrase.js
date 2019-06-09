const { Model, INTEGER, STRING } = require('sequelize');
const sequelize = require('./');
const User = require('./User');

class Phrase extends Model {}

Phrase.init({
  user_id: INTEGER,
  content: {
    type: STRING,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'phrase',
  underscored: true,
});

Phrase.belongsTo(User);

module.exports = Phrase;
