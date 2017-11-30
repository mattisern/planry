const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const uuid = require('uuid/v4');
const http = require('http');
// const url = require('url');
const ejs = require('ejs');
const fs = require('fs');
const models  = require('./app/models');

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

  models.board.findOne({include: [{model: models.widget}], where: { identifier: req.params.uuid },order: [[models.widget, 'id', 'asc']] }).then( board => {
    if (!board) {
      models.board.create({
        identifier: req.params.uuid
      }).then(board => {
        res.render('pages/boards', {board: board});
      })
    } else {
      res.render('pages/boards', {board: board});
    }
  });

});

models.sequelize.sync().then(()=> {
  server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
});


//event handling with socket iox
io.on('connection', function (socket) {

  let room = socket.handshake.query.room;

  socket.join(room);

  socket.on('titleUpdated', (data) => {

    if (data.board.name !== data.title) {

      models.board.update(
        { name: data.title},
        { fields: ['name'], where: {identifier: data.board.identifier}, returning: true, plain: true}).then(board => {
          if (board) {
            socket.broadcast.to(room).emit('titleUpdated', board[1].dataValues);
          }
        }
      );
    }
  });

  socket.on('addWidget', (data) => {
      let boardId = data.boardId;
      let type = data.type === 'text' ? 1 : data.type === 'checklist' ? 2 : null;

      if (models.widget.getAllowedTypes().includes(type)) {

        let widget = models.widget.build({type: type, boardId: boardId});
        widget.state = widget.getDefaultState();

        widget.save().then( widget => {
          if (widget) {
            ejs.renderFile(widget.getTemplateUrl(), {widget: widget}, {}, (err, str) => {
              if (err) {
                console.log(err);
              } else {
                let template = str;
                socket.broadcast.to(room).emit('addWidget', {widget: widget, html: template});
                socket.emit('addWidget', {widget: widget, html: template});
              }
            });
          }
        });

      } else {
        socket.emit('error-event', { errorMessage: 'could not create widget of type ' + data.type + ". This type is not supported yet"} );
      }
  });

  socket.on('updateWidget', (data) => {
    let updateField = data.updateField;
    let widgetId = data.widgetId;
    let value = data.value;

    models.widget.findOne({where: {id: widgetId}}).then(widget => {
      if (widget.state[updateField] !== value) {

        widget.set('state.' + updateField, value );
        widget.save().then(widget => {
          let newState = widget.state;
          socket.broadcast.to(room).emit('updateWidget', {widgetId: widgetId, updateField: updateField, newState: newState });
        });
      }
    });
  });

  socket.on('deleteWidget', (data) => {
    models.widget.destroy({where: {id: data.widgetId}}).then( ()=> {
      socket.broadcast.to(room).emit('deleteWidget', data);
      socket.emit('deleteWidget',data);
    });

  });

  socket.on('addWidgetTask', (data) => {
    let defaultTask = { id: uuid(), description: 'New Task', completed: false};

    models.widget.findOne({where: {id: data.widgetId}}).then(widget => {
      //sequelize is a little wierd when manipulating json. Clone array and insert to force update
      let tasks = widget.state.tasks.slice();
      tasks.push(defaultTask);
      widget.set('state.tasks', tasks);

      widget.save().then( widget => {
        fs.readFile('views/partials/checklist-widget-tasks.ejs','utf-8', function(err, data) {
          if (err) {
              console.log(err);
          } else {
            let template = ejs.render(data, { widget: widget.dataValues });
            socket.broadcast.to(room).emit('addWidgetTask', {widget: widget.dataValues, html: template});
            socket.emit('addWidgetTask', {widget: widget.dataValues, html: template});
          }
        });
      });
    });
  });

  socket.on('updateTask', (data) => {
    let value = data.value;
    let widgetId = data.widgetId;
    let taskId = data.taskId;
    let updateField = data.updateField;

    models.widget.findOne({where: {id: data.widgetId} }).then( widget => {
      let tasks = widget.state.tasks.slice();

      let task = tasks.find( task => {
        return task.id === taskId;
      });

      if (task[updateField] !== value) {

        task[updateField] = value;
        //this is a fugly hack to make sequelize realize that we actually have changed the tasks array
        widget.set('state.tasks', []);
        widget.set('state.tasks', tasks);
        widget.save().then( widget => {
          if (widget) {
            socket.broadcast.to(room).emit('updateTask', {widgetId: widgetId, task: task, updateField: updateField });
          }
        });
      }
    });
  });

  socket.on('deleteTask', (data) => {

    models.widget.findOne({where: {id: data.widgetId}}).then( widget => {
      let tasks = widget.state.tasks.slice();

      tasks = tasks.filter( task => {
        return task.id !== data.taskId;
      });

      widget.set('state.tasks', tasks);

      widget.save().then( () => {
        socket.broadcast.to(room).emit('deleteTask', {taskId : data.taskId});
        socket.emit('deleteTask', {taskId : data.taskId});
      });
    });
  });

});
