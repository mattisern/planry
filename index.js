const isProduction = process.env.NODE_ENV === "production";

const sslRedirect = require('heroku-ssl-redirect');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const http = require('http');
const fs = require('fs');

let envPath = './.env';
if (!isProduction) {
  envPath = "./.env.local";

  if (!fs.existsSync(envPath)) {
    envPath = "./.env.development";
  }
}

const dotenv = require('dotenv').config({path: envPath});

const models  = require('./app/db/models');
const setupApi = require("./app/api");
const setupSocket = require("./app/socket");

const app = express();
const server = http.Server(app);
const io = require('socket.io').listen(server);

//config/setup
app.use(sslRedirect());
app.use(express.static(path.join(__dirname, 'build')))

if (!isProduction) {
  app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
}

//routes TODO:extract
app.use('/', express.static(path.join(__dirname+'/build/')))
app.get('/board*', (req, res) => res.sendFile(path.join(__dirname+'/build/index.html')))

setupApi(app);
setupSocket(io);

models.sequelize.sync().then(()=> {
  server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
});

module.exports = {
  app,
  server,
  io
}
