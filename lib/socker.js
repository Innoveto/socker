'use strict';

var events = require('events');
var util = require('util');

var Socker = module.exports = function(params) {
  this.dockerApi = params.dockerApi;
  this.stateCache = {};
  this.pollInterval = params.pollInterval;
  this.intervalId = null;
  this._startPolling();

  events.EventEmitter.call(this);
};

util.inherits(Socker, events.EventEmitter);

Socker.prototype._startPolling = function() {
  var self = this;
  this.intervalId = setInterval(function () {
    self._getAllContainerStates();
  }, this.pollInterval);
};

Socker.prototype.getState = function(containerName) {
  return this.stateCache[containerName];
};

Socker.prototype.getAllStates = function () {
  var result = [];
  for (var containerName in this.stateCache) {
    result.push(this.stateCache[containerName]);
  }
  return result;
};

Socker.prototype._attachStream = function (container) {
  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    //dockerode may demultiplex attach streams for you :)
    container.modem.demuxStream(stream, process.stdout, process.stderr);
  });
};

Socker.prototype._handleContainerState = function (data) {
  var stringified = JSON.stringify(data);
  if (stringified === JSON.stringify(this.stateCache[data.Name])) {
    //nothing changed
    return;
  }
  this.stateCache[data.Name] = data;
  this.emit('statechange', data);
};

Socker.prototype._getAllContainerStates = function() {
  var self = this;
  this.dockerApi.listContainers({all: 1}, function (err, containers) {
    if (err) {
      return console.error('could not list containers: ' + err);
    }
    containers.forEach(function (containerInfo) {
      var containerId = containerInfo.Id;
      var container = self.dockerApi.getContainer(containerId);
      container.inspect(function (err, data) {
        if (err) {
          return console.error('could inpect container: ' + containerId);
        }
        //self._attachStream(container);
        self._handleContainerState(data);
      });
    });
  });
};
