/*jslint node: true, vars: true */
var secretStoreFactory = require('../lib/secretStore');

describe('secretStore Tests', function () {
  'use strict';

  describe('1 having a laugh', function () {

    it('1.1 should create a store and read', function (done) {

      secretStoreFactory.create({}, function (err, sStore) {
        sStore.read();
        done();
      });
    });
  });
});
