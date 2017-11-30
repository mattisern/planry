'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return [
        queryInterface.changeColumn('widgets', 'type', {
            type: Sequelize.INTEGER,
            allowNull: false
        }),

        queryInterface.changeColumn('widgets', 'state', {
            type: Sequelize.JSON,
            default: {},
            allowNull: false
        }),

        queryInterface.sequelize.query('ALTER TABLE widgets RENAME COLUMN board_id TO "boardId"'),

        queryInterface.addColumn('widgets', 'createdAt', {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }),

        queryInterface.addColumn('widgets', 'updatedAt', {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        })
    ];
  },
  down: (queryInterface, Sequelize) => {
    return [
        queryInterface.changeColumn('widgets', 'type', {
            type: Sequelize.INTEGER,
            allowNull: true
        }),

        queryInterface.changeColumn('widgets', 'state', {
            type: Sequelize.JSON,
            default: '',
            allowNull: true
        }),

        queryInterface.sequelize.query('ALTER TABLE widgets RENAME COLUMN "boardId" TO board_id'),
        queryInterface.removeColumn('widgets', 'createdAt'),
        queryInterface.removeColumn('widgets', 'updatedAt')
    ];
  }
};
