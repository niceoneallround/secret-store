/*jslint node: true, vars: true */
const chai = require('chai');
const expect = chai.expect;
const encoder = require('../lib/encoder');

describe('encoder tests', function () {
  'use strict';

  let canonParam = {
    awsKeyId:  'bogus-key-id',
    cipherText: 'cipherText'
  },
  canonResult = 'Ym9ndXMta2V5LWlk.Y2lwaGVyVGV4dA==';

  describe('1 encode tests', function () {
    it('1.1 should encode a keyId and a cipher text string', function () {
      let result = encoder.encode(canonParam);

      //console.log(result);
      expect(result).to.be.equal(canonResult);
    }); // 1.1

    it('1.2 should encode a keyId and cipher text are buffer', function () {
      let result = encoder.encode({
        awsKeyId: new Buffer(canonParam.awsKeyId),
        cipherText: new Buffer(canonParam.cipherText)
      });

      //console.log(result);
      expect(result).to.be.equal(canonResult);
    }); // 1.2
  }); // 1

  describe('2 decode tests', function () {
    it('2.1 should decode an encoded format returning the canonParam', function () {
      let result = encoder.decode(canonResult);

      //console.log(result);
      expect(result).to.have.property('awsKeyId');
      expect(result.awsKeyId.toString()).to.be.equal(canonParam.awsKeyId);
      expect(result).to.have.property('cipherText');
      expect(result.cipherText.toString()).to.be.equal(canonParam.cipherText);
    }); // 2.1

    it('2.2 should decode an encoded format passed as a buffer returning the canonParam', function () {
      let result = encoder.decode(new Buffer(canonResult));

      //console.log(result);
      expect(result).to.have.property('awsKeyId');
      expect(result.awsKeyId.toString()).to.be.equal(canonParam.awsKeyId);
      expect(result).to.have.property('cipherText');
      expect(result.cipherText.toString()).to.be.equal(canonParam.cipherText);
    }); // 2.12

  }); // 2

});
