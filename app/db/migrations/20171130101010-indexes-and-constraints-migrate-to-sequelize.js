'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
        queryInterface.sequelize.query('ALTER TABLE boards ADD PRIMARY KEY (id)'),
        queryInterface.sequelize.query('ALTER TABLE boards ADD CONSTRAINT boards_identifier_key UNIQUE (identifier);'),
        queryInterface.sequelize.query('ALTER TABLE widgets ADD PRIMARY KEY (id)'),
        queryInterface.sequelize.query('ALTER TABLE widgets ADD CONSTRAINT "widgets_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES boards(id) ON UPDATE CASCADE ON DELETE SET NULL')
    ];
  },
  down: (queryInterface, Sequelize) => {
    return [
        queryInterface.sequelize.query('ALTER TABLE boards DROP CONSTRAINT boards_pkey'),
        queryInterface.sequelize.query('ALTER TABLE boards DROP CONSTRAINT boards_identifier_key'),
        queryInterface.sequelize.query('ALTER TABLE widgets DROP CONSTRAINT widgets_pkey')
    ];
  }
};
