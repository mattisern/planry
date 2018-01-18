const express = require('express');
const models  = require('./db/models');
const uuid = require('uuid/v4');
const welcomeWidget = require("./welcomeWidget");

module.exports = function setupApi (app) {
    const api = express();

    if (process.env.NODE_ENV !== "production") {
        api.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

            next();
        })
    }

    // Create board
    api.post('/boards', (req, res) => {
        let board;
        let newUuid = uuid();
         models.board.create({
            identifier: newUuid
        }).then((b) => {
            board = b;

            return models.widget.create({
                boardId: board.id,
                type: 1,
                state: welcomeWidget
            });
        }).then((widget) => {
            board.dataValues.widgets = [widget];
            return board;
        }).then((board) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(board);

            return true;
        });
    });

    // Find existing board
    api.get('/boards/:uuid', (req, res) => {
        models.board.findOne({
            include: [{model: models.widget}], 
            where: { identifier: req.params.uuid },
            order: [[models.widget, 'id', 'asc']] 
        }).then( board => {
            // Found a board, return that one
            if (board) {
                res.setHeader('Content-Type', 'application/json');
                res.send(board);
    
                return true;
            }
        });
    });

    app.use('/api', api);
}
