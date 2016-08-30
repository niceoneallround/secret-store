/*jslint node: true, vars: true */
var secretStoreFactory = require('../lib/secretStore');

describe('secretStore Tests', function () {
  'use strict';

  describe('1 Callback tests', function () {
    it('1.1 should create a store, load it with a secret, and decrypt it', function (done) {
      secretStoreFactory.create({}, function (err, sStore) {
        sStore.callbacks.loadSecrets([], function (err) {
          sStore.callbacks.decryptSecret({ name: 'test' }, function (err, data) {
            done();
          });
        });
      });
    }); // 1.1
  }); // 1

  describe('2 Promise tests', function () {
    it('2.1 should create a store, load it with a secret, and decrypt it', function () {

      return secretStoreFactory.promiseCreate({})
        .then(
          function (store) {
            console.log('promise returned store');
            return store.promises.loadSecrets();
          },

          function (err) {
            console.log('promise returned err');
          }
        );
    }); // 2.1
  }); // 2
});
