/*jslint node: true, vars: true */
const assert = require('assert');
const encoder = require('./encoder');
const kmsWrapper = require('./kmsWrapper');

//
// Implement the secret store as described in the README

function create(options, callback) {
  'use strict';

  let store = {},
      kms = kmsWrapper.create(options);
  store.callbacks = {};
  store.promises = {};
  store.plain = {};
  store.map = new Map();

  //
  // Return the clear text value associated with the key. The props
  // props.name - the secret name that is used for lookup and the AWS KMS encryption context
  // props.hostname - used for AWS KMS encryption context
  //
  store.callbacks.decryptSecret = function decryptSecret(props, callback) { // key, callback
    assert(props.name, 'no params.name cannot decrypt');
    assert(props.hostname, 'no params.hostname cannot decrypt');

    // lets get the encrypted secret
    let encoded = store.map.get(props.name);
    if (!encoded) {
      return callback(403, null);
    }

    //
    // Decode to get the key and the cipher text
    //
    let decoded = encoder.decode(encoded);

    // decrypt, construct the correct format encryption context
    kms.decrypt(
      { CiphertextBlob: decoded.cipherText,
        EncryptionContext: { name: props.name, hostname: props.hostname }
      },
      function (err, decryptResponse) {
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, kms.utils.getPlainText(decryptResponse));
        }
      });
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
  //
  store.addSecret = function addSecret(name, cipherText) { // key, value
    assert(name, 'name param is missing');
    assert(cipherText, 'cipherText param is missing');
    store.map.set(name, cipherText);
  };

  //
  // Return the size of the map
  //
  store.size = function size() {
    return store.map.size;
  };

  //
  // Return the newly created store
  //
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
