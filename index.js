const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const uuid = require('uuid/v4');
const pg = require('pg');
const http = require('http');
const url = require('url');
const ejs = require('ejs');
const fs = require('fs');

let app = express();
let server = http.Server(app);
let io = require('socket.io').listen(server);


//config/setup
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//routes TODO:extract
app.get('/', (req, res) => res.redirect('boards'))

app.get('/boards', (req, res) => {
	let newUuid = uuid();
	res.redirect('boards/' + newUuid)
});

app.get('/boards/:uuid', (req, res) => {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {

    client.query('SELECT * FROM boards WHERE identifier = \'' + req.params.uuid + '\'', function(err, result) {
      done();

      if (err) {
        console.error(err); res.send("Error " + err);
      } else if (result.rows.length > 0) {
        //we have a board to retrieve, get it
        let board = result.rows[0];

        //get associatied widgets
        let query = 'SELECT * FROM widgets where board_id = ' + board.id;

        client.query(query, function(err, result) {
          done();

          if (err) {
            console.error(err); res.send("Error " + err);
          } else if (result.rows.length > 0 ) {
            board.widgets = result.rows;
          }
          res.render('pages/boards', {board: board});
        })

      } else {
        let query = 'INSERT INTO boards (identifier) values (\'{' + req.params.uuid + '}\') returning *';
        client.query(query, function(err, result) {
          done();
          if (err) {
            console.error(err); res.send("Error " + err);
          } else {
            res.render('pages/boards', {board: result.rows[0]});
          }
        });
      }

    });

  });
});


//start our listener
server.listen(PORT, () => console.log(`Listening on ${ PORT }`))

//event handling with socket io
io.on('connection', function (socket) {

  let room = socket.handshake.query.room;

  socket.join(room);

  socket.on('titleUpdated', function (data) {

    if (data.board.name !== data.title) {

      pg.connect(process.env.DATABASE_URL, function(err, client, done) {

        client.query("UPDATE boards set name = '" + data.title + "' WHERE identifier = '" + data.board.identifier + "' returning *", function(err, result) {
          done();
          if (err) {
            console.error(err);
          } else {
            socket.broadcast.to(room).emit('titleUpdated', result.rows[0]);
          }
        });
      });
    }
  });

  socket.on('addWidget', function (data) {
      let board_id = data.boardId;

      if (data.type === 'text') {
        let type = 1;
        let defaultState = JSON.stringify({text: "start typing here"});

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          let query = `INSERT INTO widgets (board_id, type, state) values (${board_id}, ${type}, '${defaultState}') returning *` ;

          client.query(query, function(err, result) {
            done();
            if (err) {
              console.error(err);
              return false;
            } else {
              let widget = result.rows[0];
              if (widget) {

                fs.readFile('views/partials/text-widget.ejs','utf-8', function(err, data) {
                  if (err) {
                      console.log(err);
                  } else {
                    let test = ejs.render(data, { widget: widget });
                    socket.broadcast.to(room).emit('addWidget', {widget: widget, html: test});
                    socket.emit('addWidget', {widget: widget, html: test});
                  }
                });

                // console.log(ejs.render({widget : widget}, {url: '/views/partials/text-widget.ejs'}));
                // html = ejs.render {url: '/views/partials/text-widget.ejs'}).render(data);
              };
            }
          });
        });
      } //else if (data.type === 'checklist') {}
      else {
        socket.emit('error', { errorMessage: 'could not create widget of type ' + data.type + ". This type is not supported yet"});
      }
  });

});




