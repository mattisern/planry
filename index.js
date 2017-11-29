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
        let query = `SELECT * FROM widgets where board_id = ${board.id} ORDER BY id`;

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

  socket.on('titleUpdated', (data) => {

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

  socket.on('addWidget', (data) => {
      let board_id = data.boardId;

      if (data.type === 'text') {
        let type = 1;
        let defaultState = JSON.stringify({name: "new text widget", text: "Start typing here ..."});

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          let query = `INSERT INTO widgets (board_id, type, state) values (${board_id}, ${type}, '${defaultState}') returning *` ;

          client.query(query, function(err, result) {
            done();
            if (err) {
              console.error(err);
            } else {
              let widget = result.rows[0];
              if (widget) {

                ejs.renderFile('views/partials/text-widget.ejs', {widget: widget}, {}, (err, str) => {
                  if (err) {
                    console.log(err);
                  } else {
                    let template = str;
                    socket.broadcast.to(room).emit('addWidget', {widget: widget, html: template});
                    socket.emit('addWidget', {widget: widget, html: template});
                  }
                });
              };
            }
          });
        });
      } else if (data.type === 'checklist') {
        let type = 2;
        let defaultState = JSON.stringify({name: "new todo widget", tasks: [{ id: uuid(), description: 'New Task', completed: false}]});

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          let query = `INSERT INTO widgets (board_id, type, state) values (${board_id}, ${type}, '${defaultState}') returning *` ;

          client.query(query, function(err, result) {
            done();
            if (err) {
              console.error(err);
            } else {
              let widget = result.rows[0];
              if (widget) {

                ejs.renderFile('views/partials/checklist-widget.ejs', {widget: widget}, {}, (err, str) => {
                  if (err) {
                    console.log(err);
                  } else {
                    let template = str;
                    socket.broadcast.to(room).emit('addWidget', {widget: widget, html: template});
                    socket.emit('addWidget', {widget: widget, html: template});
                  }
                });
              };
            }
          });
        });
      } else {
        socket.emit('error-event', { errorMessage: 'could not create widget of type ' + data.type + ". This type is not supported yet"} );
      }
  });

  socket.on('updateWidget', (data) => {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          let updateField = data.updateField;
          let widgetId = data.widgetId;
          let value = data.value;

          let query = `SELECT state FROM widgets WHERE id = ${widgetId}` ;

          client.query(query, function(err, result) {
            done();
            if (err) {
              console.log(err);
            } else {
              let state = result.rows[0]['state'];
              if (state[updateField] !== value) {
                state[updateField] = value;
                query = `UPDATE WIDGETS SET state = '${JSON.stringify(state)}' WHERE id = ${widgetId} RETURNING state`;

                client.query(query, (err,result) => {
                  if (err) {
                    console.log(err);
                  } else {
                    let newState = result.rows[0]['state'];
                    socket.broadcast.to(room).emit('updateWidget', {widgetId: widgetId, updateField: updateField, newState: newState });
                  }
                });

              };
            }
          });
        });
  });

  socket.on('deleteWidget', (data) => {
    pg.connect(process.env.DATABASE_URL, (err, client, done) => {
      let query = `DELETE FROM widgets WHERE id = ${data.widgetId}`;
      client.query(query, (err, result) => {
        done();
        if (err) {
          console.log(err);
        } else {
          socket.broadcast.to(room).emit('deleteWidget', data);
          socket.emit('deleteWidget', data);
        }
      });
    });
  });

  socket.on('addWidgetTask', (data) => {
    let defaultTask = { id: uuid(), description: 'New Task', completed: false};

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {

      let query = `SELECT state FROM widgets WHERE id = ${data.widgetId}`;
      client.query(query, (err, result) => {
        done();

        if (err) {
          console.log(err);
        } else {
          let state = result.rows[0]['state'];
          let tasks = state.tasks;
          tasks.push(defaultTask);

          let query = `UPDATE widgets SET state = '${ JSON.stringify(state) }' WHERE id = ${data.widgetId} RETURNING *`;
          client.query(query, (err, result) => {
            done();

            if (err) {
              console.log(err);
            } else {
              let widget = result.rows[0];

              if (widget) {
                fs.readFile('views/partials/checklist-widget-tasks.ejs','utf-8', function(err, data) {
                  if (err) {
                      console.log(err);
                  } else {
                    let template = ejs.render(data, { widget: widget });
                    socket.broadcast.to(room).emit('addWidgetTask', {widget: widget, html: template});
                    socket.emit('addWidgetTask', {widget: widget, html: template});
                  }
                });
              };
            }
          });
        }
      });

    });
  });

  socket.on('updateTask', (data) => {
    let value = data.value;
    let widgetId = data.widgetId;
    let taskId = data.taskId;
    let updateField = data.updateField;

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {

      let query = `SELECT state FROM widgets WHERE id = ${widgetId}`;

      client.query(query, (err, result) => {
        done();

        if (err) {
          console.log(err);
        } else {
          let state = result.rows[0]['state'];
          let tasks = state.tasks;
          let task = tasks.find( (task) => {
            return task.id === taskId;
          });

          task[updateField] = value; //state is updated with new values

          query = `UPDATE WIDGETS SET state = '${JSON.stringify(state)}' WHERE id = ${widgetId}`
          client.query(query, (err, result) => {
            done();

            if (err) {
              console.log(err);
            } else {
              socket.broadcast.to(room).emit('updateTask', {widgetId: widgetId, task: task, updateField: updateField });
            }
          });
        }
      });


    });
  });

  socket.on('deleteTask', (data) => {
    pg.connect(process.env.DATABASE_URL, (err, client, done) => {
      let query = `SELECT state FROM widgets WHERE id = ${data.widgetId}`;

      client.query(query, (err, result) => {
        done();
        if (err) {
          console.log(err);
        } else {
          let state = result.rows[0].state;
          let tasks = state.tasks;

          tasks = tasks.filter(task => {
            return task.id !== data.taskId;
          });

          state.tasks = tasks;

          query = `UPDATE widgets SET state = '${JSON.stringify(state)}' WHERE id = ${data.widgetId}`;
          client.query(query, (err, result) => {
            done();
            if (err) {
              console.log(err);
            } else {
              socket.broadcast.to(room).emit('deleteTask', {taskId : data.taskId});
              socket.emit('deleteTask', {taskId : data.taskId});
            }
          });
        }
      });

    });
  });

});
