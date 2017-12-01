'use strict'

let socket = io.connect('', {query: 'room='+window.GLOBALS.board.identifier});

socket.on('titleUpdated', function (data) {
    $('#title').val(data.name);
});

socket.on('addWidget', function (data) {
    window.GLOBALS.board.widgets = window.GLOBALS.board.widgets || [];
    let widgets = window.GLOBALS.board.widgets;
    widgets.push(data.widget);
    $('#add-widget').before(data.html);
});

socket.on('updateWidget', function(data) {
    let state = data.newState;
    $("#widget-"+data.widgetId).find('[name="' + data.updateField +'"]').val(state[data.updateField]);
});

socket.on('deleteWidget', function(data) {
    $('#widget-'+data.widgetId).remove();
});

socket.on('addWidgetTask', function(data) {
    $('#widget-'+data.widget.id).find('#tasks').replaceWith(data.html);
});

socket.on('updateTask', function(data) {
    let fieldToUpdate = $('#'+data.task.id).find('[name="' + data.updateField +'"]');
    if (data.updateField !== 'completed') {
        fieldToUpdate.val(data.task[data.updateField]);
    } else {
        if (data.task.completed) {
            fieldToUpdate.attr('checked', true);
        } else {
            fieldToUpdate.attr('checked', false);
        }
    }
});

socket.on('deleteTask', function(data){
    $('#'+data.taskId).remove();
});

socket.on('error-event', function (data) {
    window.alert(data.errorMessage);
});

socket.on('startEditInput', function (data) {
    console.log('startEditInput fired with ', data.elementId);
});

socket.on('stopEditInput', function (data) {
    console.log('stopEditInput fired with ', data.elementId);
});

$('#title').on('keyup', function(e) {
    socket.emit('titleUpdated', {board: window.GLOBALS.board, title: this.value})
});

function addWidget(type) {
    socket.emit('addWidget', {boardId: window.GLOBALS.board.id, type: type});
};

function updateWidget(widgetId, el) {
    socket.emit('updateWidget', { widgetId: widgetId, updateField: el.name, value: el.value });
}

function deleteWidget(widgetId) {
    if (window.confirm('Are you sure you want to delete this widget?')) {
            socket.emit('deleteWidget', {widgetId: widgetId});
        }
}

function addWidgetTask(widgetId) {
    socket.emit('addWidgetTask', {widgetId: widgetId});
}

function updateTask(widgetId, el) {
    let taskId = $(el).parent('li').attr('id');
    socket.emit('updateTask', {
        widgetId: widgetId,
        taskId: taskId,
        updateField: el.name,
        value: el.name === 'completed' ? el.checked: el.value });
}

function deleteTask(widgetId, taskId) {
    socket.emit('deleteTask', {widgetId: widgetId, taskId: taskId});
}

function startEditInput(el) {
    socket.emit('startEditInput', {elementId: el.id});
}

function stopEditInput(el) {
    socket.emit('stopEditInput', {elementId: el.id});
}