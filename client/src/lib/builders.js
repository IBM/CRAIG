const { transpose } = require("lazy-z");

/**
 * build an encryption key
 * @param {Object} keyParams key management params
 * @param {string} keyParams.name name
 * @param {boolean} keyParams.root_key root_key value
 * @param {string} keyParams.payload payload value
 * @param {string} keyParams.key_ring key_ring value
 * @param {boolean} keyParams.force_delete force_delete value
 * @param {string} keyParams.endpoint endpoint value
 * @param {string} keyParams.iv_value iv_value value
 * @param {string} keyParams.encrypted_nonce encrypted_nonce value
 * @param {number} keyParams.interval_month interval month for policy
 * @returns {Object} encryption key object
 */
function buildNewEncryptionKey(keyParams) {
  let params = keyParams;
  let newKey = {
    name: `new-key`,
    root_key: true,
    payload: null,
    key_ring: null,
    force_delete: null,
    endpoint: null,
    iv_value: null,
    encrypted_nonce: null,
    policies: {
      rotation: {
        interval_month: 12
      }
    }
  };
  if (params?.interval_month) {
    newKey.policies.rotation.interval_month = params.interval_month;
    delete params.interval_month;
  }
  transpose(params, newKey);
  return newKey;
}

module.exports = {
  buildNewEncryptionKey
};
