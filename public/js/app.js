(function(){
    'use strict'

    var socket = io.connect('', {query: 'room='+window.GLOBALS.board.identifier});

    socket.on('titleUpdated', function (data) {
        $('#title').val(data.name);
    });

    $('#title').on('change', function(e) {
        socket.emit('titleUpdated', {board: window.GLOBALS.board, title: this.value})
    });


})();