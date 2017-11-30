"use strict";

module.exports = function(sequelize, DataTypes) {

    var Board = sequelize.define("board", {
        identifier : {
            type: DataTypes.UUID,
            allowNull: false
        },
        name : {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Board;
};