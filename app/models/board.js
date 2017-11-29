"use strict";

module.exports = function(sequelize, DataTypes) {

    var Board = sequelize.define("board", {
        identifier : {
            type: DataTypes.UUID,
            allowNull: false
        },
        name : {
            type: DataTypes.STRING,
            defaultValue: 'Your project name',
            allowNull: true
        }
    });

    return Board;
};