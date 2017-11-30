'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
        queryInterface.changeColumn('boards', 'identifier', {
            type: Sequelize.UUID,
            allowNull: false
        }),
        queryInterface.changeColumn('boards', 'name', {
            type: Sequelize.STRING,
            allowNull: true
        }),
        queryInterface.addColumn('boards', 'createdAt', {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }),
        queryInterface.addColumn('boards', 'updatedAt', {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        })
    ];
  },
  down: (queryInterface, Sequelize) => {
    return [
        queryInterface.changeColumn('boards', 'identifier', {
            type: Sequelize.UUID,
            allowNull: true
        }),
        queryInterface.changeColumn('boards', 'name', {
            type: Sequelize.STRING,
            default: ''
        }),
        queryInterface.removeColumn('boards', 'createdAt'),
        queryInterface.removeColumn('boards', 'updatedAt')
    ];
  }
};
