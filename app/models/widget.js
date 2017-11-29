"use strict";

module.exports = function(sequelize, DataTypes) {

    var Widget = sequelize.define("widget", {
        type : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        state : {
            type: DataTypes.JSON,
            allowNull: false
        }
    });

    return Widget;
};