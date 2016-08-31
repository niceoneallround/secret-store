/*jslint node: true, vars: true */
const secretStoreFactory = require('../lib/secretStore');
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const kmsWrapper = require('../lib/kmsWrapper');
const encoder = require('../lib/encoder');

describe('secretStore Tests', function () {
  'use strict';

  let canonStore = null;

  before(function (done) {
    // create a secret store that can be used for tests
    const kmsOptions = { region: 'us-east-1' };
    secretStoreFactory.create(kmsOptions, function (err, sStore) {
      assert(sStore, 'no secret store created');
      canonStore = sStore;
      done();
    });

  });

  //
  // Test can add something to the store
  //
  describe('1 Test adding a secret to the store', function () {
    it('1.1 Add an item to the secret store', function () {
      canonStore.addSecret('key1', 'cipher1');
      expect(canonStore.size()).to.be.equal(1);
    }); // 1.1
  }); // 1

  describe('2 Decrypt tests', function () {
    it('2.1 should be able to decrypt a formated item', function () {

      const name = 'a_secret_name';
      const hostname = 'a_host_name';
      const value = 'secretClearText';
      const kmsOptions = { region: 'us-east-1' };
      const KEY_ID =  '09165844-ec39-4e76-915a-54498ef420da';   // A globally unique AWS Key ID
      let kmsW = kmsWrapper.create(kmsOptions);

      return kmsW.promiseEncrypt({
        KeyId: KEY_ID,
        Plaintext: new Buffer(value),
        EncryptionContext: { name: name, hostname: hostname }
      })
      .then(function (encryptResponse) {
          let encoded = encoder.encode({ awsKeyId: KEY_ID, cipherText: encryptResponse.CiphertextBlob });

          //console.log('encryptResponse: %j', encryptResponse);
          //console.log('cipherTextResponse.KeyId: %s', cipherTextResponse.KeyId);
          //console.log('cipherTextResponse.CiphertextBlob', cipherTextResponse.CiphertextBlob);
          //console.log(encoded);

          // add the encoded value to the secret store so that it can be found for decrypt
          //
          canonStore.addSecret(name, encoded);

          //
          // now lets decrypt - need to pass in the correct encryption context
          //
          return canonStore.promises.decryptSecret({ name: name, hostname: hostname });
        })
        .then(function (clearText) {
          expect(clearText).to.be.equal(value);
          return clearText;
        });
    }); // 2.1
  }); // 2

});
