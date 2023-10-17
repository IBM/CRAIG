const { transpose, carve, contains, splatContains } = require("lazy-z");
const { createEdgeVpc } = require("../state/vpc");

/**
 * setup wizard function
 * @param {*} wizardJson
 * @param {boolean} wizardJson.use_atracker
 * @param {Array<string>} wizardJson.vpc_networks
 * @param {boolean=} wizardJson.cos_vpe
 * @param {boolean=} wizardJson.use_tgw
 * @param {boolean=} wizardJson.fs_cloud
 * @param {number} wizardJson.zones
 * @param {boolean} wizardJson.use_power_vs
 * @param {boolean} wizardJson.use_f5
 * @param {string=} wizardJson.key_management_service
 * @param {object} json config json
 */
function wizard(wizardJson, json) {
  transpose(
    {
      prefix: "wizard",
      tags: ["craig", "wizard"],
      fs_cloud: wizardJson.fs_cloud,
      enable_power_vs: wizardJson.use_power_vs,
      power_vs_zones: wizardJson.power_vs_zones || [],
      dynamic_subnets: !wizardJson.use_f5,
    },
    json._options
  );
  if (!wizardJson.use_atracker) {
    // remove atracker and connected resources
    json.atracker.enabled = false;
    carve(json.object_storage, "name", "atracker-cos");
    carve(json.key_management[0].keys, "name", "atracker-key");
  }

  if (
    wizardJson.fs_cloud &&
    wizardJson.key_management_service === "Bring Your Own HPCS"
  ) {
    ["use_data", "use_hs_crypto"].forEach((field) => {
      json.key_management[0][field] = true;
    });
  }

  // remove deployment keys
  ["roks-key", "vsi-volume-key"].forEach((keyName) => {
    carve(json.key_management[0].keys, "name", keyName);
  });

  // remove deployments
  ["clusters", "vsi", "vpn_gateways", "ssh_keys"].forEach((field) => {
    json[field] = [];
  });

  // remove cos vpe
  if (!wizardJson.cos_vpe) {
    json.virtual_private_endpoints = [];
  }

  // remove vpn gw subnet
  if (contains(wizardJson.vpc_networks, "Management VPC")) {
    carve(json.vpcs[0].subnets, "name", "vpn-zone-1");
  }

  // remove tgw
  if (!wizardJson.use_tgw) {
    json.transit_gateways = [];
  }

  let defaultCosIndex = wizardJson.use_atracker ? 1 : 0;
  if (wizardJson.vpc_networks.length === 1) {
    // remove references to removed vpc network
    let missingVpc = contains(wizardJson.vpc_networks, "Management VPC")
      ? "workload"
      : "management";
    // remove vpe if using vpe
    if (wizardJson.cos_vpe)
      carve(json.virtual_private_endpoints, "name", `${missingVpc}-cos`);
    // remove vpc
    carve(json.vpcs, "name", missingVpc);
    // remove flow logs bucket
    carve(
      json.object_storage[defaultCosIndex].buckets,
      "name",
      `${missingVpc}-bucket`
    );
    // remove rg
    carve(json.resource_groups, "name", `${missingVpc}-rg`);
    // remove tgw connections if using tgw
    if (wizardJson.use_tgw)
      carve(json.transit_gateways[0].connections, "vpc", missingVpc);
    // remove security groups if found
    [`${missingVpc}-vpe`, `${missingVpc}-vsi`].forEach((sg) => {
      if (splatContains(json.security_groups, "name", sg))
        carve(json.security_groups, "name", sg);
    });
  } else if (wizardJson.vpc_networks.length === 0) {
    // remove all vpc references
    ["vpcs", "virtual_private_endpoints", "security_groups"].forEach(
      (field) => {
        json[field] = [];
      }
    );
    // remove rgs
    json.resource_groups.pop();
    json.resource_groups.pop();
    json.transit_gateways[0].connections = [];
    json.object_storage[defaultCosIndex].buckets = [];
  }

  // remove az if less than three
  if (wizardJson.zones < 3) {
    // remove address prefixes and subnets out of zone
    json.vpcs.forEach((vpc) => {
      let newPrefixes = [],
        newSubnets = [];
      vpc.address_prefixes.forEach((prefix) => {
        if (prefix.zone <= wizardJson.zones) {
          newPrefixes.push(prefix);
        }
      });
      vpc.subnets.forEach((subnet) => {
        if (subnet.zone <= wizardJson.zones) newSubnets.push(subnet);
      });
      vpc.address_prefixes = newPrefixes;
      vpc.subnets = newSubnets;
    });
    // remove vpe subnets
    json.virtual_private_endpoints.forEach((vpe) => {
      let newSubnets = [];
      vpe.subnets.forEach((subnet) => {
        if (parseInt(subnet.replace(/\D+/g, "")) <= wizardJson.zones) {
          newSubnets.push(subnet);
        }
      });
      vpe.subnets = newSubnets;
    });
  }

  if (wizardJson.use_f5) {
    createEdgeVpc(
      {
        store: {
          json: json,
          vpcList: [],
          subnetTiers: {},
        },
      },
      "vpn-and-waf",
      false,
      wizardJson.zones,
      true
    );
  }

  return json;
}

module.exports = wizard;
