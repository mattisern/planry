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
    socket.emit('updateTextWidget', { widgetId: widgetId, updateField: el.name, value: el.value });
}

function deleteWidget(widgetId) {
    socket.emit('deleteWidget', {widgetId: widgetId});
}

function addWidgetTask(widgetId) {
    socket.emit('addWidgetTask', {widgetId: widgetId});
}

function updateTasks(widgetId, el) {
    console.log(widgetId, el);
    socket.emit('updateTask', {widgetId: widgetId});
}