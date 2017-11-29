"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
// var config    = require(path.join(__dirname, '..', 'config/config.js'));

// console.log(process.env.DATABASE_URL);

var sequelize = new Sequelize(process.env.DATABASE_URL);

var db        = {};

//autoload all models in the model folder
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

//setup db relations
db.board.hasMany(db.widget);
db.widget.belongsTo(db.board);

//allow access to sequelize through the exported object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;