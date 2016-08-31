/*jslint node: true, vars: true */

var assert = require('assert'),
    util = require('util'),
    ENCODING = 'base64';

//
// Create encoded format as described in the README.md
//

//
// Create the 'encoded' format from passed in params.
//  - cipherText - A Buffer - For convenience will convert non Buffer to a Buffer
//  - awsKeyId - the keyId
//
function encode(params) {
  'use strict';
  var cipherText, keyId;
  assert(params.awsKeyId, util.format('no params.awsKeyId:%j', params));
  assert(params.cipherText, util.format('no params.cipherText:%j', params)); // can be a string or a Buffer

  if (!(params.cipherText instanceof Buffer)) {
    cipherText = new Buffer(params.cipherText);
  } else {
    cipherText = params.cipherText;
  }

  if (!(params.awsKeyId instanceof Buffer)) {
    keyId = new Buffer(params.awsKeyId);
  } else {
    keyId = params.awsKeyId;
  }

  return keyId.toString(ENCODING) + '.' + cipherText.toString(ENCODING);
}

//
// Converts from encoded format into a object - all data is returned in a Buffer and caller interprets
// *smft - the item to unpack may be a string or a Buffer
//
function decode(sfmt) {
  'use strict';
  var unpack = {}, t;

  // if passed in format is a Buffer then convert to string
  if (Buffer.isBuffer(sfmt)) {
    // use utf-8 as want to maintain the '.'
    t = (sfmt.toString('utf-8')).split('.');
  } else if (util.isString(sfmt)) {
    t = sfmt.split('.');
  } else {
    assert(false, util.format('decode only accepts a String or a Buffer:%j', sfmt));
  }

  unpack.awsKeyId = new Buffer(t[0], ENCODING);
  unpack.cipherText = new Buffer(t[1], ENCODING);

  return unpack;
}

module.exports = {
  decode: decode,
  encode: encode
};
