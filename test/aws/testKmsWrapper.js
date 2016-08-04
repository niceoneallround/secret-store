/*jslint node: true, vars: true */
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const kmsWrapper = require('../../lib/aws/kmsWrapper');
const util = require('util');

const KEY_ID =  '09165844-ec39-4e76-915a-54498ef420da';

describe('kmsWrapper Tests', function () {
  'use strict';

  const kmsOptions = { region: 'us-east-1' };

  describe('1 create tests', function () {
    it('1.1 should create a KMS wrapper with the correct properties', function (done) {
      let kmsW = kmsWrapper.create(kmsOptions);
      assert(kmsW, 'no KMS wrapper retuned');
      expect(kmsW).to.have.property('listKeys');
      expect(kmsW).to.have.property('promiseListKeys');
      expect(kmsW).to.have.property('encrypt');
      expect(kmsW).to.have.property('promiseEncrypt');
      done();
    }); // 1.1
  }); //1

  describe('2 list keys', function () {
    it('2.1 should list all the keys in a region', function () {
      let kmsW = kmsWrapper.create(kmsOptions);
      assert(kmsW, 'no KMS wrapper retuned');

      return kmsW.promiseListKeys()
        .then(function (keys) {
            //console.log(keys);
            assert((keys.Keys.length > 0), util.format('not enough keys:%s', keys.Keys.length));
          });
    }); // 2.1
  }); //2

  describe('3 encrypt with master key', function () {
    it('3.1 should encrypt with a master key and be able to decrypt it', function () {
      let kmsW = kmsWrapper.create(kmsOptions);
      assert(kmsW, 'no KMS wrapper retuned');

      return kmsW.promiseEncrypt({
        KeyId: KEY_ID,
        Plaintext: new Buffer('some-plain-text'),
        EncryptionContext: { context1: 'http://econtext.test.com/key_service/com/abc' }
      })
      .then(function (encryptResponse) {
          //console.log('cipherTextResponse: %j', cipherTextResponse);
          //console.log(cipherTextResponse);
          //console.log('cipherTextResponse.KeyId: %s', cipherTextResponse.KeyId);
          //console.log('cipherTextResponse.CiphertextBlob', cipherTextResponse.CiphertextBlob);
          let a = new Buffer(encryptResponse.CiphertextBlob);
          expect(kmsW.utils.getCipherText(encryptResponse)).to.be.equal(a.toString('base64'));
          expect(encryptResponse).to.have.property('KeyId');

          return encryptResponse;
        })
        .then(function (encryptResponse) {
          // ok lets try and decrypt

          return kmsW.promiseDecrypt({
            CiphertextBlob: encryptResponse.CiphertextBlob,
            EncryptionContext: { context1: 'http://econtext.test.com/key_service/com/abc' }
          })
          .then(function (decryptResponse) {
            //console.log('Decrypt', decryptResponse);let a = new Buffer(encryptResponse.CiphertextBlob);
            //console.log(decryptResponse.Plaintext);
            //console.log(new Buffer(decryptResponse.Plaintext).toString());
            expect(new Buffer(decryptResponse.Plaintext).toString()).to.be.equal('some-plain-text');
            expect(kmsW.utils.getPlainText(decryptResponse)).to.be.equal('some-plain-text');
            return decryptResponse;
          });
        });
    }); // 3.1

    it('3.2 should fail as encrypt params are missing', function () {
      let kmsW = kmsWrapper.create(kmsOptions);
      assert(kmsW, 'no KMS wrapper retuned');

      return kmsW.promiseEncrypt({
        Plaintext: 'plan-text',
        EncryptionContext: 'http://econtext.test.com/key_service/com/abc' })
        .then(function (cipherText) {
            assert(false, 'should have failed');
          },

          function (err) {
            // and ok error so just swallow error;

          });
    }); // 3.2
  }); //3


});
