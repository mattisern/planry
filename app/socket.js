const models  = require('./db/models');
const uuid = require('uuid/v4');

let rooms = {};

module.exports = function setupSocket (io) {
    
    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };
    
    //event handling with socket iox
    io.on('connection', (socket) => {
      let room = socket.handshake.query.room;
      let user = {};
    
      socket.join(room);
    
      if (rooms[room]) {
        socket.emit('joinedRoom', { lockedElementIds: rooms[room].lockedElementIds });
      } else {
        rooms[room] = {
          lockedElementIds: []
        };
      }
    
      socket.on('titleUpdated', (data) => {
        let promise;
    
        if (Number.isInteger(data.board)) {
          promise = models.board.findById(data.board).then((board) => {
            data.board = board;
            return board;
          });
        } else {
          promise = Promise.resolve();
        }
    
        promise.then(() => {
          if (data.board.name !== data.title) {
            models.board.update(
              { name: data.title},
              { fields: ['name'], where: {identifier: data.board.identifier}, returning: true, plain: true}).then(board => {
                socket.broadcast.to(room).emit('titleUpdated', board[1].dataValues);
              }
            );
          }
        })
      });
    
      socket.on('addWidget', (data) => {
          const boardId = data.boardId;
          const type = data.type === 'text' ? 1 : data.type === 'checklist' ? 2 : null;
    
          if (models.widget.getAllowedTypes().includes(type)) {
            const widget = models.widget.build({type: type, boardId: boardId});
            widget.state = widget.getDefaultState();
    
            widget.save().then( widget => {
                socket.broadcast.to(room).emit('addWidget', {widget: widget});
                socket.emit('addWidget', {widget: widget});
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
        let defaultTask = { id: uuid(), description: '', completed: false};
    
        models.widget.findOne({where: {id: data.widgetId}}).then(widget => {
          //sequelize is a little wierd when manipulating json. Clone array and insert to force update
          let tasks = widget.state.tasks.slice();
          tasks.push(defaultTask);
          widget.set('state.tasks', tasks);
    
          widget.save().then( widget => {
            socket.broadcast.to(room).emit('addWidgetTask', {
              widget: widget.dataValues,
              task: defaultTask
            });
            socket.emit('addWidgetTask', { widget: widget.dataValues, task: defaultTask });
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
    
      socket.on('startEditInput', (data) => {
        user.editingElementId = data.elementId;
        if (rooms[room]) {
          rooms[room].lockedElementIds.push(data.elementId);
        }
        socket.broadcast.to(room).emit('startEditInput', data);
      });
    
      socket.on('stopEditInput', (data) => {
        user.editingElementId = null;
        if (rooms[room]) {
          rooms[room].lockedElementIds = rooms[room].lockedElementIds.remove(data.elementId);
        }
        socket.broadcast.to(room).emit('stopEditInput', data);
      });
    
      socket.on('disconnect', (data) => {
        if (user.editingElementId) {
          socket.broadcast.to(room).emit('stopEditInput', {elementId: user.editingElementId});
        }
      });
    });
}
