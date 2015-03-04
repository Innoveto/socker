'use strict';

var conf = require('./config');
var Socker = require('./lib/socker');
var debug = require('debug')('socker');
var Docker = require('dockerode');
var io = require('socket.io')(conf.port);

var dockerApi = new Docker(conf.docker);
var socker = new Socker({dockerApi: dockerApi, pollInterval: conf.socker.pollInterval});

socker.on('statechange', function (msg) {
	debug('state of container ' + msg.id + ' changed');
	io.emit('statechange:' + msg.id, msg.data);
});

io.on('connection', function(socket) {
  debug('socket.io connected');
  socket.on('disconnect', function() {
    debug('socket.io disconnect');
  });
});
