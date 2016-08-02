

function createSecretStore(options, callback) {
  'use strict';

  var sStore = {};

  sStore.read = function read() { // key, callback
    console.log('Reading');
  };

  return callback(null, sStore);
}

module.exports = {
  create: createSecretStore
};
