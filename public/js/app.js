(function(){
    'use strict'

    var socket = io.connect('', {query: 'room='+window.GLOBALS.board.identifier});

    socket.on('titleUpdated', function (data) {
        $('#title').val(data.name);
    });

    $('#title').on('change', function(e) {
        socket.emit('titleUpdated', {board: window.GLOBALS.board, title: this.value})
    });



    $(document)
    .one('focus.autoExpand', 'textarea.autoExpand', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', 'textarea.autoExpand', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 16);
        this.rows = minRows + rows;
    });



})();