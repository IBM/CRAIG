const { transpose, formatCidrBlock } = require("lazy-z");

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

/**
 * Build a subnet object
 * @param {number} vpcIndex index of vpc in array, used for CIDR calculation
 * @param {string} tierName name of the tier
 * @param {number} tierIndex index of tier in array, used for CIDR calculation
 * @param {string} aclName name of the acl
 * @param {number} zone zone, can be 1,2, or 3
 * @param {boolean} addPublicGateway add public gateway
 * @param {boolean=} isEdgeVpc is edge vpc
 * @returns {Object} subnet object
 */
function buildSubnet(
  vpcName,
  vpcIndex,
  tierName,
  tierIndex,
  aclName,
  resourceGroup,
  zone,
  addPublicGateway,
  addPrefix,
  isEdgeVpc
) {
  // create a subnet based on vpc, tier, index, and zone
  return {
    vpc: vpcName,
    zone: zone,
    cidr: formatCidrBlock(vpcIndex, zone, tierIndex, isEdgeVpc),
    name: tierName + "-zone-" + zone,
    network_acl: aclName === null ? null : `${aclName}`,
    resource_group: resourceGroup,
    public_gateway: addPublicGateway || false,
    has_prefix: addPrefix || true
  };
}

module.exports = {
  buildNewEncryptionKey,
  buildSubnet
};
