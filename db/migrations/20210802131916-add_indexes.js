'use strict';

module.exports = {
  async up(queryInterface) {
    const clearQuery = `DELETE FROM phrases WHERE id IN (
      SELECT T2.id FROM phrases T1, phrases T2
      WHERE T1.id < T2.id
      AND T1.content = T2.content
    )`;

    await queryInterface.sequelize.query(clearQuery);

    await queryInterface.addIndex(
      'Phrases',
      ['content'],
      {
        unique: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'Phrases',
      ['content'],
    );
  },
};
