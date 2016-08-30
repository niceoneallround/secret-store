//
// Wrap the KMS functionality to
// - capture boiler plate code
// - provide a promises interface
//

//
// Credentials - if not running in AWS they are picked up from ~/.aws
//

const assert = require('assert');
const AWS = require('aws-sdk');

// factory routine to create AWS KMS connection
// *options.kmsOptions - a direct mapping to AWS.KMS params see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/KMS.html
//
function create(kmsOptions) {
  'use strict';
  assert(kmsOptions, 'param kmsOptions is missing');

  let kms, promises = {}, callbacks = {}, utils = {};

  kms = new AWS.KMS(kmsOptions);

  //----------------------------
  // Routines to list keys
  //-----------------------------

  // list master keys witin the region
  callbacks.listKeys = function listKeys(next) {
    kms.listKeys({}, function (err, data) {
      if (!err) {
        return next(null, data);
      } else {
        return next(err);
      }
    });
  };

  promises.listKeys = function promiseListKeys() {
    return new Promise(function (resolve, reject) {
      callbacks.listKeys(function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  //----------------------------------------------------------------
  // routines that use AWS to encrypt data using a master key in KMS
  //----------------------------------------------------------------

  // The params are from AWS - required the Encryption Context as more secure
  //
  callbacks.encrypt = function encrypt(params, next) {
    assert(params.KeyId, 'params.KeyId is missing');
    assert(params.Plaintext, 'params.Plaintext is missing');

    // make this a required param as best practise to add context to the encryption - the whole Additional Authenticated Data.
    assert(params.EncryptionContext, 'params.EncryptionContext is missing');

    kms.encrypt(params, function (err, encryptResponse) {
      if (err) {
        return next(err, null);
      } else {
        return next(null, encryptResponse);
      }
    });
  };

  promises.encrypt = function promiseEncrypt(params) {
    return new Promise(function (resolve, reject) {
      callbacks.encrypt(params, function (err, encryptResponse) {
        if (err) {
          reject(err);
        } else {
          resolve(encryptResponse);
        }
      });
    });
  };

  utils.getCipherText = function getCipherText(encryptResponse) {
    return new Buffer(encryptResponse.CiphertextBlob).toString('base64');
  };

  //----------------------------------------------------------------
  // routines that use AWS to decrypt data using a master key in KMS
  //----------------------------------------------------------------

  // The params are from AWS - required the Encryption Context as more secure
  //
  callbacks.decrypt = function decrypt(params, next) {
    assert(params.CiphertextBlob, 'params.CiphertextBlob is missing');

    // make this a required param as best practise to add context to the encryption - the whole Additional Authenticated Data.
    assert(params.EncryptionContext, 'params.EncryptionContext is missing');

    kms.decrypt(params, function (err, decryptResponse) {
      if (err) {
        return next(err, null);
      } else {
        return next(null, decryptResponse);
      }
    });
  };

  // promise wrapper for the callback version of decrypt
  promises.decrypt = function promiseDecrypt(params) {
    return new Promise(function (resolve, reject) {
      callbacks.decrypt(params, function (err, decryptResponse) {
        if (err) {
          reject(err);
        } else {
          resolve(decryptResponse);
        }
      });
    });
  };

  utils.getPlainText = function getCipherText(decryptResponse) {
    return new Buffer(decryptResponse.Plaintext).toString();
  };

  return {
    callbacks: callbacks,
    promises: promises,
    utils: utils,

    // the individual functions
    listKeys: callbacks.listKeys,
    promiseListKeys: promises.listKeys,

    // the individual functions
    encrypt: callbacks.encrypt,
    promiseEncrypt: promises.encrypt,

    // the individual functions
    decrypt: callbacks.decrypt,
    promiseDecrypt: promises.decrypt
  };

} // create

module.exports = {
  create: create
};
