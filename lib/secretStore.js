

function create(options, callback) {
  'use strict';

  let store = {};
  store.callbacks = {};
  store.promises = {};

  //
  // Return the clear text value associated with the key
  //
  store.callbacks.decryptSecret = function decryptSecret(props, callback) { // key, callback
    return callback(null, 'dummy');
  };

  store.promises.decryptSecret = function decryptSecret(props) {
    return new Promise(function (resolve, reject) {
      store.callbacks.decryptSecret(props, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  //
  // Load a key and a cipher-text value into the store
  // use to pre-load the store with content
  //
  store.callbacks.loadSecrets = function (loadData, callback) { // key, value
    return callback(null);
  };

  store.promises.loadSecrets = function loadSecrets(loadData) {
    return new Promise(function (resolve, reject) {
      store.callbacks.loadSecrets(loadData, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  return callback(null, store);
}

//
// A promise version of create
//
function promiseCreate(options) {
  'use strict';
  return new Promise(function (resolve, reject) {
    create(options, function (err, store) {
      if (err) {
        reject(err);
      } else {
        resolve(store);
      }
    });
  });
}

module.exports = {
  create: create,
  promiseCreate: promiseCreate
};
