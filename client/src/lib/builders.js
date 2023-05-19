const {
  transpose,
  formatCidrBlock,
  azsort,
  parseIntFromZone,
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { firewallTiers } = require("./state/defaults");

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
    dual_auth_delete: false,
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
    has_prefix: addPrefix || true,
  };
}

/**
 * add the default vsi encryption key
 * @param {lazyZstate} parent state store
 */
function addVsiEncryptionKey(parent) {
  parent.store.json.key_management[0].keys.push({
    key_ring: "ring",
    name: "vsi-volume-key",
    root_key: true,
    force_delete: null,
    endpoint: "public",
    rotation: 12,
    dual_auth_delete: false,
  });
}

/**
 * create a new f5 vsi
 * @param {string} pattern pattern name
 * @param {string} zone zone formatted zone-{zone}
 * @param {boolean=} useManagementVpc use management VPC
 * @param {*} params
 * @param {string} params.image
 * @param {string} params.resource_group
 * @param {Array<string>} params.ssh_keys
 * @param {string} params.profile
 * @returns {Object} f5 vsi object
 */
function newF5Vsi(pattern, zone, useManagementVpc, params) {
  let vpcName = useManagementVpc ? "management" : "edge"; // get vpc
  let tiers = firewallTiers[pattern](); // get tiers
  network_interfaces = [];

  // for each tier in alphabetical order
  tiers.sort(azsort).forEach((tier) => {
    // if a secondary tier
    if (tier !== "f5-management") {
      // add network_interfaces
      network_interfaces.push({
        security_groups: [tier + "-sg"],
        subnet: `${tier}-${zone}`,
      });
    }
  });

  let vsi = {
    kms: "kms",
    subnet: `f5-management-${zone}`,
    vpc: vpcName,
    resource_group: params?.resource_group || `${vpcName}-rg`,
    ssh_keys: params?.ssh_keys || ["ssh-key"],
    security_groups: ["f5-management-sg"],
    encryption_key: params?.encryption_key || "vsi-volume-key",
    profile: params?.profile || "cx2-4x8",
    name: "f5-" + zone,
    image: params?.image || "f5-bigip-15-1-5-1-0-0-14-all-1slot",
    network_interfaces: network_interfaces,
    template: {
      hostname: "f5-ve-01",
      domain: "local",
      default_route_gateway_cidr: "10.10.10.10/24",
      zone: parseIntFromZone(zone),
      vpc: vpcName,
      do_declaration_url: "null",
      as3_declaration_url: "null",
      ts_declaration_url: "null",
      phone_home_url: "null",
      tgstandby_url: "null",
      tgrefresh_url: "null",
      tgactive_url: "null",
      template_version: "20210201",
      template_source:
        "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
      app_id: "null",
      license_type: "none",
      license_host: "null",
      license_username: "null",
      license_password: "null",
      license_pool: "null",
      license_sku_keyword_1: "null",
      license_sku_keyword_2: "null",
      tmos_admin_password: null,
    },
  };
  return vsi;
}

module.exports = {
  buildNewEncryptionKey,
  buildSubnet,
  addVsiEncryptionKey,
  newF5Vsi,
};
