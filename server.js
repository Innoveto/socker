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
  //emit all states
  socker.getAllStates().forEach(function (state) {
    socket.emit('statechange:' + state.Name, state);
  });

  debug('socket.io connected');
  socket.on('disconnect', function() {
    debug('socket.io disconnect');
  });
});

debug('socketio listening on: ' + conf.port);
