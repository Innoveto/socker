'use strict';

var conf = require('./config');
var Socker = require('./lib/socker');
var debug = require('debug')('socker');
var Docker = require('dockerode');
var io = require('socket.io')(conf.port);

var dockerApi = new Docker(conf.docker);
var socker = new Socker({dockerApi: dockerApi, pollInterval: conf.socker.pollInterval});

socker.on('statechange', function (state) {
	debug('state of container ' + state.Name + ' changed');
	io.emit('statechange:' + state.Name, state);
});

io.on('connection', function(socket) {

  debug('socket.io connected');

  socket.on('getstates', function () {
    socket.emit('getstates', socker.getAllStates());
  });

  socket.on('getstate', function (containerName) {
    socket.emit('statechange:' + containerName, socker.getState(containerName));
  });

  socket.on('attachstream', function (containerName) {
    //TODO
  });

  socket.on('disconnect', function() {
    debug('socket.io disconnect');
  });
});

debug('socketio listening on: ' + conf.port);
