const { transpose } = require("lazy-z");

/**
 * build an encryption key
 * @param {Object} keyParams key management params
 * @param {string} keyParams.name name
 * @param {boolean} keyParams.root_key root_key value
 * @param {string} keyParams.key_ring key_ring value
 * @param {boolean} keyParams.force_delete force_delete value
 * @param {string} keyParams.endpoint endpoint value
 * @param {number} keyParams.rotation interval month for policy
 * @returns {Object} encryption key object
 */
function buildNewEncryptionKey(keyParams) {
  let params = keyParams;
  let newKey = {
    name: `new-key`,
    root_key: true,
    key_ring: null,
    force_delete: null,
    endpoint: null,
    rotation: 12,
    dual_auth_delete: false
  };
  if (params?.rotation) {
    newKey.rotation = params.rotation;
    delete params.rotation;
  }
  transpose(params, newKey);
  return newKey;
}

module.exports = {
  buildNewEncryptionKey
};
