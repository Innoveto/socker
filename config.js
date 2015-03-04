'use strict';

process.env.DEBUG = 'socker';

module.exports = {
  port: 3001,
  socker: {
    pollInterval: 2000
  },
  docker: {
    //unix socket
    //socketPath: '/var/run/docker.sock',
    //or tcp
    host: 'http://192.168.1.132',
    port: 2375
  }
};
