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

    Widget.prototype.getTemplateUrl = function () {
        let templateUrl;

        switch (this.type) {
            case 1 :
                templateUrl = 'views/partials/text-widget.ejs';
                break;
            case 2 :
                templateUrl = 'views/partials/checklist-widget.ejs';
        }

        return templateUrl;
    }

    Widget.prototype.getDefaultState = function () {
        let defaultState;

        switch (this.type) {
            case 1 :
                defaultState = {name: "", text: ""};
                break;
            case 2 :
                defaultState = {name: "", tasks: [{ id: uuid(), description: '', completed: false}]};
        }

        return defaultState;
    }

    return Widget;
};