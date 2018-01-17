"use strict";

const uuid = require('uuid/v4');


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

    Widget.getAllowedTypes = () => {
        return [
            1, //text widget
            2 //todo widget
        ];
    }

    Widget.prototype.getDefaultState = function () {
        let defaultState;

        switch (this.type) {
            case 1 :
                defaultState = {name: "", text: "", richText: {entityMap: {}, blocks: []}};
                break;
            case 2 :
                defaultState = {name: "", tasks: [{ id: uuid(), description: '', completed: false, ordinal: 99999999}]};
        }

        return defaultState;
    }

    return Widget;
};