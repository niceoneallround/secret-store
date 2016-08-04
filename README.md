# secret-store
Stores Secrets


#Using AWS KMS

When using AWS KMS all secrets have been encrypted by AWS KMS and then loaded into the secret store as <key, encrypted-data-encoded-format>. The secret store provides an interface read and decrypt the secrets. If the process cannot access the AWS KMS key it returns a 403.

The secrets are encrypted with AES-256-CB, a random value, and a key that is managed by AWS KMS. As the random value and key can vary across secrets there needs to be enough information in the

As there is no restriction on what random value or AWS KMS key


To support decryption

The encrypted secret is stored in an encoded-format that contains enough information so that a party that can access the Key in AWS KMS can decrypt it. The encoded format is protected against tampering with a SHA256 HMAC uses the same key that was used to encrypt. The final format is

       encrypted_data.iv.encrypted_key.key_context.hmac_code
