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

Socker.prototype._handleContainerState = function (id, data) {
  //simple change
  var stringified = JSON.stringify(data);
  if (stringified === this.stateCache[id]) {
    //nothing changed
    return;
  }
  this.stateCache[id] = stringified;
  this.emit('statechange', {id: id, data: data});
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
        self._handleContainerState(containerId, data);
      });
    });
  });
};
