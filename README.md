# Secret Store
Provides an in memory, in process store for secrets that have been encrypted with AWS KMS thus avoiding the need to pass them to the service as clear text. Examples might be database username/password, private asymmetric keys, service credentials, etc.

Typically I pass the encrypted secret in as an environment variable, and then the service code reads and adds to the encrypted store.

Provides the following functionalities:
- addSecret(name, cipherText) function that adds a secret into the store - assumes has been encrypted as described below.
  - stored as <secret_name, encrypted_representation>.
- decryptSecret(props, callback) function that returns the decrypted secret. It automatically adds the
  - props has the following fields
    - name: secret name
    - hostname: the hostname to use for the encryption context
  - The callback is cb(err, clearText)
  - the encryption context is set as described below, the host na
  - if not allowed access err is 403
  - if secret not found err is 400

#AWS KMS Usage
All secrets are assumed to have been encrypted by AWS KMS in the following way
- Uses a AWS customer master key (CMK). Main reasons use CMK are
  - Did not want to manage another key.
  - Provides an audit trail of the key usage, i.e. call AWS to decrypt and it audits the operation in cloud trail.
  - Provides authenticated encryption - so cannot alter the cipher text - so not need to add hmac.
    - uses AES 256 in Galois/Counter Mode GCM.
- Uses an Encryption Context that is a combination of the secret name and the host name the service is running on.
    - { name: <name of the secret>, hostname: <host-name>}. For example {secret_name: db_username, hostname: ms.webshield.io}
    - This provides the Additional Authentication Data, if user tried to swap encrypted secret the code will break as it will pass in the wrong context.
- Use TLS to connect to AWS

#Encrypted representation.
The formatted representation holds enough information so that the cipher text can be decrypted by parties authorized by AWS IAM. It has the following format

       <base64 aws key id>.<base64 cipher text>

NOTE. Do not need the key id as it is part of the AWS KMS Encrypt cipher text, but had added as used for other encryption package so just decided to leave as may use.


#Reference Material
- http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/KMS.html - AWS SDK documentation
- http://blogs.aws.amazon.com/security/post/Tx2LZ6WBJJANTNW/How-to-Protect-the-Integrity-of-Your-Encrypted-Data-by-Using-AWS-Key-Management
- https://blogs.aws.amazon.com/security/post/Tx79IILINW04DC/How-to-Help-Protect-Sensitive-Data-with-AWS-KMS
- https://github.com/docker/docker/issues/13490#issue-81134963
- https://andreas.github.io/2015/02/04/envelope-encryption-with-amazon-kms/
