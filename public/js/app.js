'use strict'

let socket = io.connect('', {query: 'room='+window.GLOBALS.board.identifier});

socket.on('titleUpdated', function (data) {
    $('#title').val(data.name);
});

socket.on('addWidget', function (data) {
    window.GLOBALS.board.widgets = window.GLOBALS.board.widgets || [];
    let widgets = window.GLOBALS.board.widgets;
    widgets.push(data.widget);
    $('#widgets-container').append(data.html);
});

socket.on('updateWidget', function(data) {
    let state = data.newState;
    $("#widget-"+data.widgetId).find('[name="' + data.updateField +'"]').val(state[data.updateField]);
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

$('#title').on('change', function(e) {
    socket.emit('titleUpdated', {board: window.GLOBALS.board, title: this.value})
});

$(document).one('focus.autoExpand', 'textarea.autoExpand', function(){
    let savedValue = this.value;
    this.value = '';
    this.baseScrollHeight = this.scrollHeight;
    this.value = savedValue;
})
.on('input.autoExpand', 'textarea.autoExpand', function(){
    let minRows = this.getAttribute('data-min-rows')|0, rows;
    this.rows = minRows;
    rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 16);
    this.rows = minRows + rows;
});

function addWidget(type) {
    socket.emit('addWidget', {boardId: window.GLOBALS.board.id, type: type});
};

function updateWidget(widgetId, el) {
    socket.emit('updateWidget', { widgetId: widgetId, updateField: el.name, value: el.value });
}

function deleteWidget(widgetId) {
    socket.emit('deleteWidget', {widgetId: widgetId}); //not implemented yet
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