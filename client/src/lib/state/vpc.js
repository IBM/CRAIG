const {
  splat,
  carve,
  transpose,
  contains,
  revision,
  arraySplatIndex,
  parseIntFromZone,
  buildNetworkingRule,
  eachZone,
  splatContains,
  getObjectFromArray,
} = require("lazy-z");
const {
  newDefaultEdgeAcl,
  newDefaultF5ExternalAcl,
  newF5VpeSg,
  newF5ManagementSg,
  newF5ExternalSg,
  newF5WorkloadSg,
  newF5BastionSg,
  firewallTiers,
  newDefaultF5ExternalAclManagement,
  legacyDefaultVpcs,
} = require("./defaults");
const { lazyZstate } = require("lazy-z/lib/store");
const { buildSubnet } = require("../builders");
const { formatNetworkingRule, updateNetworkingRule } = require("./utils");
const { calculateNeededSubnetIps, getNextCidr } = require("../json-to-iac");
const {
  getSubnetTierData,
  getUpdatedTierData,
  getSubnetRevisionData,
  deleteAdvancedTier,
  deleteLegacySubnetTier,
  updateAdvancedSubnetTier,
  editSubnets,
} = require("./subnets");

/**
 * initialize vpc store
 * @param {lazyZstate} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function vpcInit(config) {
  config.store.json.vpcs = legacyDefaultVpcs();
  config.store.subnets = {};
  config.store.subnetTiers = {
    management: [
      {
        name: "vsi",
        zones: 3,
      },
      { name: "vpe", zones: 3 },
      { name: "vpn", zones: 1 },
    ],
    workload: [
      {
        name: "vsi",
        zones: 3,
      },
      { name: "vpe", zones: 3 },
    ],
  };
  config.store.networkAcls = {};
  config.store.vpcList = ["management", "workload"];
}

/**
 * add public gateways to vpc
 * @param {Object} vpc
 */
function pgwNumberToZone(vpc) {
  if (vpc.publicGateways) {
    vpc.public_gateways = [];
    vpc.publicGateways.forEach((gw) => {
      vpc.public_gateways.push({
        vpc: vpc.name,
        zone: gw,
        resource_group: vpc.resource_group,
      });
    });
  }
}

/**
 * get cos for vpc based on bucket name
 * @param {lazyZState} config state store
 * @param {string} bucket
 * @returns {string} name of instance for tf ref
 */
function getVpcCosName(config, bucket) {
  let cosName = null;
  config.store.json.object_storage.forEach((instance) => {
    if (splatContains(instance.buckets, "name", bucket)) {
      cosName = instance.name;
    }
  });
  return cosName;
}

/**
 * create a new vpc
 * @param {lazyZState} config state store
 * @param {object} config.store
 * @param {object} config.store.subnetTiers tiers
 * @param {object} stateData component state data
 */
function vpcCreate(config, stateData) {
  let vpc = {
    name: null,
    resource_group: null,
    classic_access: false,
    manual_address_prefix_management: false,
    default_network_acl_name: null,
    default_security_group_name: null,
    default_routing_table_name: null,
    address_prefixes: [],
    subnets: [],
    public_gateways: [],
    acls: [],
  };
  transpose(stateData, vpc);
  pgwNumberToZone(vpc);
  config.store.subnetTiers[vpc.name] = [];
  vpc.cos = getVpcCosName(config, stateData.bucket);
  config.push(["json", "vpcs"], vpc);
}

/**
 * delete vpc
 * @param {lazyZState} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {object} config.store.subnetTiers
 * @param {Object} stateData
 * @param {object} componentProps
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name name to delete
 */

function vpcDelete(config, stateData, componentProps) {
  delete config.store.subnetTiers[componentProps.data.name];
  carve(config.store.json.vpcs, "name", componentProps.data.name);
}

/**
 * on store update
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 */
function vpcOnStoreUpdate(config) {
  // for each network
  config.store.json.vpcs.forEach((network) => {
    network.cos = getVpcCosName(config, network.bucket);
    if (network.cos === null && network.bucket !== "$disabled") {
      network.bucket = null;
    }
    config.store.networkAcls[network.name] = splat(network.acls, "name");
    let subnetList = []; // create a new list
    // for each zone
    network.subnets.forEach((subnet) => {
      subnet.vpc = network.name;
      // add the names of the subnets to the list
      subnetList = subnetList.concat(subnet.name);
      if (
        !contains(config.store.networkAcls[network.name], subnet.network_acl)
      ) {
        subnet.network_acl = null;
      }
    });
    network.acls.forEach((acl) => {
      acl.vpc = network.name;
      acl.rules.forEach((rule) => {
        rule.acl = acl.name;
        rule.vpc = network.name;
      });
    });
    // set subnets object vpc name to list
    config.store.subnets[network.name] = subnetList;
    // set acls object to the list of acls
    config.updateUnfound("resourceGroups", network, "resource_group");
    network.publicGateways = splat(network.public_gateways, "zone");
  });
  config.store.vpcList = splat(config.store.json.vpcs, "name");
  if (config.store.json._options.dynamic_subnets) {
    let dynamicCidrList = calculateNeededSubnetIps(config.store.json);
    config.store.json.vpcs.forEach((vpc) => {
      let vpcCidr = dynamicCidrList[vpc.name];
      vpc.address_prefixes = [];
      while (vpc.address_prefixes.length < config.store.json._options.zones) {
        let zone = vpc.address_prefixes.length + 1;
        vpc.address_prefixes.push({
          vpc: vpc.name,
          zone: zone,
          name: vpc.name + "-zone-" + zone,
          cidr:
            "10." +
            (arraySplatIndex(config.store.json.vpcs, "name", vpc.name) + zone) +
            "0.0.0/22",
        });
      }
      let newSubnets = [];
      vpc.subnets.forEach((subnet) => {
        // get last address for zone from subnet list or zone prefix
        let lastCidr = // automatically set to first in zone for vpc
          "10." +
          (arraySplatIndex(config.store.json.vpcs, "name", vpc.name) +
            subnet.zone) +
          "0.0.0/x";
        // if new subnets has subnets and the zone exists within array
        if (
          newSubnets.length > 0 &&
          splatContains(newSubnets, "zone", subnet.zone)
        ) {
          let searchIndex = newSubnets.length - 1;
          // get index of the zone
          while (
            searchIndex >= 0 &&
            newSubnets[searchIndex].zone !== subnet.zone
          ) {
            searchIndex--;
          }
          // get cidr
          lastCidr = newSubnets[searchIndex].cidr;
        }
        let nextSubnet = {}; // transpose subnet to get old data
        transpose(subnet, nextSubnet);
        nextSubnet.cidr = getNextCidr(lastCidr, vpcCidr[subnet.name]);
        nextSubnet.has_prefix = false;
        newSubnets.push(nextSubnet);
      });
      vpc.subnets = newSubnets;
    });
  }
}

/**
 * update existing vpc
 * @param {lazyZState} config state store
 * @param {object} config.store
 * @param {object} config.store.subnetTiers tiers
 * @param {string=} config.store.edge_vpc_name edge name
 * @param {object} stateData component state dat
 * @param {boolean} stateData.show
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name vpc name
 */
function vpcSave(config, stateData, componentProps) {
  let vpc = stateData;
  delete vpc.show;
  let oldName = componentProps.data.name;
  [
    "default_network_acl_name",
    "default_routing_table_name",
    "default_security_group_name",
    "name",
  ].forEach((field) => {
    if (vpc[field] === "") {
      vpc[field] = null;
    }
  });
  pgwNumberToZone(vpc);
  if (vpc.name !== oldName) {
    // add to empty array to prevent reference to original object
    config.store.subnetTiers[stateData.name] = [];
    config.store.subnetTiers[oldName].forEach((tier) => {
      config.store.subnetTiers[vpc.name].push(tier);
    });
    delete config.store.subnetTiers[oldName];
  }
  vpc.cos = getVpcCosName(config, stateData.bucket);

  new revision(config.store.json)
    .child("vpcs", oldName, "name")
    .update(vpc)
    .then(() => {
      if (
        oldName === config.store.edge_vpc_name &&
        stateData.name !== oldName
      ) {
        config.store.edge_vpc_name = stateData.name;
      }
    });
}

/**
 * update a subnet in place
 * @param {lazyZState} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {string} stateData.name name
 * @param {string} stateData.acl_name network acl name
 * @param {object} componentProps
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name subnet name
 * @param {string} componentProps.name vpc name
 */
function subnetSave(config, stateData, componentProps) {
  let subnetName = componentProps.data.name;
  if (stateData.acl_name === "") {
    stateData.acl_name = null;
  }
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name")
    .then((data) => {
      // update advanced tier subnet prefixes
      if (stateData.tier) {
        let prefix = getObjectFromArray(
          data.address_prefixes,
          "name",
          subnetName
        );
        prefix.name = stateData.name;
        prefix.cidr = stateData.cidr;
      }
    })
    .child("subnets", subnetName, "name")
    .update(stateData)
    .then(() => {
      let tier = new revision(config.store.subnetTiers).child(
        componentProps.vpc_name,
        stateData.tier
      ).data;
      if (tier.advanced) {
        let newSubnets = [];
        tier.subnets.forEach((subnet) => {
          if (subnet === subnetName) {
            newSubnets.push(stateData.name);
          } else {
            newSubnets.push(subnet);
          }
        });
        tier.subnets = newSubnets;
      }
    });
}

/**
 * delete a subnet
 * @param {lazyZState} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {object} componentProps
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name subnet name
 * @param {string} componentProps.name vpc name
 */

function subnetDelete(config, stateData, componentProps) {
  let subnetName = componentProps.data.name;
  new revision(config.store.json)
    .child("vpcs", componentProps.name, "name")
    .child("subnets")
    .deleteArrChild(subnetName);
}

/**
 * create a subnet
 * @param {lazyZState} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {string} stateData.name name
 * @param {object} componentProps
 * @param {string} componentProps.name vpc name
 */
function subnetCreate(config, stateData, componentProps) {
  new revision(config.store.json)
    .child("vpcs", componentProps.name, "name")
    .child("subnets")
    .push(stateData);
}

/**
 * delete subnet tier
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function subnetTierDelete(config, stateData, componentProps) {
  subnetTierSave(config, { zones: 0 }, componentProps);
}

/**
 * create a new subnet tier
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.networkAcl
 * @param {boolean} stateData.addPublicGateway
 * @param {number} stateData.zones
 * @param {boolean} stateData.hide
 * @param {object} componentProps props from component form
 * @param {string} componentProps.vpc_name
 */
function subnetTierCreate(config, stateData, componentProps) {
  let vpcName = componentProps.vpc_name;
  // get index of vpc for CIDR calculation
  let vpcIndex = splat(config.store.json.vpcs, "name").indexOf(vpcName);
  if (stateData.advanced) {
    config.store.json._options.advanced_subnets = true;
    let tier = {
      name: stateData.name,
      zones: undefined,
      select_zones: stateData.select_zones,
      advanced: true,
      subnets: [],
    };
    stateData.select_zones.forEach((zone) => {
      tier.subnets.push(stateData.name + "-zone-" + zone);
      config.store.json.vpcs[vpcIndex].subnets.push({
        name: stateData.name + "-zone-" + zone,
        cidr: null,
        network_acl: null,
        public_gateway: false,
        zone: zone,
        vpc: componentProps.vpc_name,
        resource_group: config.store.json.vpcs[vpcIndex].resource_group,
        has_prefix: true,
        tier: stateData.name,
      });
    });
    config.store.subnetTiers[vpcName].push(tier);
  } else {
    // for each zone
    for (let i = 0; i < stateData.zones; i++) {
      // add subnet to that zone
      config.store.json.vpcs[vpcIndex].subnets.push(
        buildSubnet(
          vpcName,
          vpcIndex,
          stateData.name,
          config.store.subnetTiers[vpcName].length,
          stateData?.networkAcl ? stateData.networkAcl : null,
          config.store.json.vpcs[vpcIndex].resource_group,
          i + 1,
          stateData.addPublicGateway,
          stateData.use_prefix // prefix
        )
      );
      let lastSubnet = config.store.json.vpcs[vpcIndex].subnets.length - 1;
      config.store.json.vpcs[vpcIndex].address_prefixes.push({
        vpc: vpcName,
        zone: i + 1,
        cidr: config.store.json.vpcs[vpcIndex].subnets[lastSubnet].cidr,
        name: config.store.json.vpcs[vpcIndex].subnets[lastSubnet].name,
      });
    }
    // add tier to subnetTiers
    config.store.subnetTiers[vpcName].push({
      name: stateData.name,
      zones: stateData.zones,
    });
  }
}

/**
 * save subnet tier
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs list of vpcs
 * @param {string} config.store.edge_vpc_name
 * @param {Object} stateData
 * @param {string} stateData.networkAcl
 * @param {number} stateData.zones
 * @param {boolean} stateData.addPublicGateway
 * @param {boolean} stateData.advanced
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name tier name
 * @param {boolean} componentProps.data.advanced
 */
function subnetTierSave(config, stateData, componentProps) {
  let { newTierName, oldTierName, vpcName, zones, vpcIndex, oldTiers } =
    getSubnetTierData(config, stateData, componentProps);
  let newTiers = []; // new subnet tiers
  // for each subnet tier
  oldTiers.forEach((tier) => {
    // if not being deleted
    if (
      (tier.name === oldTierName && zones !== 0) || // if zones is not 0 and tier name is old name
      tier.name !== oldTierName // or if tiername is different
    ) {
      let tierData = getUpdatedTierData(tier, oldTierName, newTierName, zones);
      if (config.store.json._options.dynamic_subnets) {
        newTiers.push(tierData);
      } else if (stateData.advanced && componentProps.data.name === tier.name) {
        config.store.json._options.advanced_subnets = true;
        newTiers.push(
          updateAdvancedSubnetTier(
            tierData,
            config,
            stateData,
            componentProps,
            oldTierName,
            vpcName,
            newTierName,
            vpcIndex
          )
        );
      } else if (tier.advanced) {
        config.store.json._options.advanced_subnets = true;
        newTiers.push(tier);
      } else newTiers.push(tierData);
    }
  });

  // edit subnets
  new revision(config.store.json)
    .child("vpcs", vpcName, "name") // get vpc
    .then((vpc) => {
      let { subnets, isEdgeVpcTier } = getSubnetRevisionData(
        vpc,
        newTierName,
        vpcName,
        config
      );
      if (componentProps.data.advanced && stateData.zones === 0) {
        deleteAdvancedTier(oldTiers, componentProps.data.name, vpc);
      } else if (!stateData.advanced) {
        // add subnets until they have the correct number of zones
        editSubnets(
          vpc,
          zones,
          isEdgeVpcTier,
          newTierName,
          newTiers,
          vpcName,
          vpcIndex,
          oldTierName,
          config,
          stateData,
          componentProps
        );
      }
      // if deleting a tier
      if (zones === 0) {
        deleteLegacySubnetTier(
          subnets,
          config,
          oldTierName,
          componentProps.vpc_name,
          vpcIndex
        );
      }
    });

  config.store.subnetTiers[vpcName] = newTiers;
}

/**
 * create acl
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {Object} stateData
 * @param {string} stateData.name
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name vpc name
 */
function naclCreate(config, stateData, componentProps) {
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name")
    .then((data) => {
      data.acls.push({
        name: stateData.name,
        resource_group: data.resource_group,
        vpc: componentProps.vpc_name,
        rules: [],
      });
    });
}

/**
 * delete acl
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {Object} stateData
 * @param {object} componentProps
 * @param {string} componentProps.arrayParentName vpc name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name acl old name
 */

function naclDelete(config, stateData, componentProps) {
  // new revision
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name") // get vpc
    .child("acls") // get network acl
    .deleteArrChild(componentProps.data.name); // delete acl
}

/**
 * save acl
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {Object} stateData
 * @param {string} stateData.name
 * @param {object} componentProps
 * @param {string} componentProps.arrayParentName vpc name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name acl old name
 */

function naclSave(config, stateData, componentProps) {
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name")
    .child("acls", componentProps.data.name)
    .then((data) => {
      data.rules.forEach((rule) => {
        rule.acl = stateData.name;
      });
    })
    .update(stateData);
}

/**
 * create nacl rule
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {object} stateData
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {string} componentProps.parent_name acl name
 */
function naclRuleCreate(config, stateData, componentProps) {
  stateData.inbound = stateData.direction === "inbound" ? true : false;
  stateData.allow = stateData.action === "allow" ? true : false;
  // build rule
  let rule = buildNetworkingRule(stateData, true);
  // add new fields as per schema
  rule.acl = componentProps.parent_name;
  rule.vpc = componentProps.vpc_name;
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name")
    .child("acls", componentProps.parent_name)
    .child("rules")
    .push(rule);
}

/**
 * save nacl rule
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {object} stateData
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {string} componentProps.parent_name acl name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name old rule name
 */
function naclRuleSave(config, stateData, componentProps) {
  let networkRule = stateData;
  let vpcName;
  formatNetworkingRule(networkRule, componentProps);
  config.store.json.vpcs.forEach((vpc) => {
    if (splatContains(vpc.acls, "name", componentProps.parent_name)) {
      vpcName = vpc.name;
    }
  });
  // new revision
  new revision(config.store.json)
    .child("vpcs", vpcName, "name") // get vpc
    .child("acls", componentProps.parent_name) // get acls
    .child("rules", componentProps.data.name) // get rule
    .then((data) => {
      // update rule
      updateNetworkingRule(true, data, networkRule);
    });
}

/**
 * delete nacl rule
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {object} stateData
 * @param {string} stateData.direction
 * @param {string} stateData.action
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {string} componentProps.parent_name acl name
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name old rule name
 */

function naclRuleDelete(config, stateData, componentProps) {
  let vpcName;
  config.store.json.vpcs.forEach((vpc) => {
    if (splatContains(vpc.acls, "name", componentProps.parent_name)) {
      vpcName = vpc.name;
    }
  });
  // new revision
  new revision(config.store.json)
    .child("vpcs", vpcName, "name") // get vpc name
    .child("acls", componentProps.parent_name) // get network acls
    .child("rules") // get rules
    .deleteArrChild(componentProps.data.name); // delete rule
  config.update();
}

/**
 * get cidr order for edge tier
 */
function getCidrOrder() {
  return [
    "vpn-1",
    "vpn-2",
    "f5-management",
    "f5-external",
    "f5-workload",
    "f5-bastion",
    "vpe",
  ];
}

/**
 * create an edge vpc
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpcs
 * @param {string} pattern name of pattern can be vpn-and-waf, waf, or full-tunnel
 * @param {boolean=} useManagementVpc create edge data on management vpc
 * @param {number} zones number of deployment zones
 */
function createEdgeVpc(config, pattern, useManagementVpc, zones) {
  let edgeTiers = firewallTiers[pattern]();
  let edgeTiersExist = config.store.edge_pattern !== undefined;
  let cidrOrder = getCidrOrder();
  let newSecurityGroups = [newF5ManagementSg(), newF5ExternalSg()];
  if (!edgeTiersExist) {
    config.store.edge_vpc_name = "edge";
    config.store.edge_pattern = pattern;
    config.store.edge_zones = zones;
    config.store.f5_on_management = useManagementVpc || false;
    // add security groups and edit cidr order based on pattern
    if (pattern === "full-tunnel") {
      // delete workload subnet for full-tunnel
      cidrOrder.splice(4, 1);
      // add bastion sg
      newSecurityGroups.push(newF5BastionSg());
    } else if (pattern === "waf") {
      // delete vpn and bastion for waf
      cidrOrder.splice(5, 1);
      cidrOrder.shift();
      cidrOrder.shift();
      // add workload sg
      newSecurityGroups.push(newF5WorkloadSg());
    } else {
      // add workload and bastion
      newSecurityGroups.push(newF5WorkloadSg());
      newSecurityGroups.push(newF5BastionSg());
    }
    // add f5 vpe group
    newSecurityGroups.push(newF5VpeSg());
  }

  // create edge network object
  let newEdgeNetwork =
    useManagementVpc || edgeTiersExist
      ? config.store.json.vpcs[0]
      : {
          cos: null,
          bucket: null,
          name: "edge",
          resource_group: `edge-rg`,
          classic_access: false,
          manual_address_prefix_management: true,
          default_network_acl_name: null,
          default_routing_table_name: null,
          default_security_group_name: null,
          address_prefixes: [],
          acls: [newDefaultEdgeAcl(), newDefaultF5ExternalAcl()],
          subnets: [],
          public_gateways: [],
        };

  let managementPrefixes = [
      { vpc: "management", zone: 1, cidr: "10.5.0.0/16" },
      { vpc: "management", zone: 1, cidr: "10.10.10.0/16" },
      { vpc: "management", zone: 2, cidr: "10.6.0.0/16" },
      { vpc: "management", zone: 2, cidr: "10.20.10.0/16" },
      { vpc: "management", zone: 3, cidr: "10.7.0.0/16" },
      { vpc: "management", zone: 3, cidr: "10.30.10.0/16" },
    ],
    edgePrefixes = [
      { vpc: "edge", zone: 1, cidr: "10.5.0.0/16" },
      { vpc: "edge", zone: 2, cidr: "10.6.0.0/16" },
      { vpc: "edge", zone: 3, cidr: "10.7.0.0/16" },
    ];

  // set address prefixes
  newEdgeNetwork.address_prefixes = [];

  // add prefixes based on number of zones
  (useManagementVpc ? managementPrefixes : edgePrefixes).forEach((prefix) => {
    if (prefix.zone <= zones) {
      newEdgeNetwork.address_prefixes.push(prefix);
    }
  });

  // add edge to vpc
  if (!useManagementVpc) edgeTiers.push("vpe");
  else newEdgeNetwork.acls.push(newDefaultF5ExternalAclManagement());
  // if not waf, add vpn subnets
  if (pattern !== "waf") {
    edgeTiers.push("vpn-1");
    edgeTiers.push("vpn-2");
  }
  // for each tier
  edgeTiers.forEach((tier) => {
    // for each zone
    eachZone(zones, (zone) => {
      // add only unfound subnets
      if (!splatContains(newEdgeNetwork.subnets, "name", `${tier}-${zone}`))
        newEdgeNetwork.subnets.push({
          vpc: `${useManagementVpc ? "management" : "edge"}`,
          name: `${tier}-${zone}`, // name
          zone: parseIntFromZone(zone),
          resource_group: `${useManagementVpc ? "management" : "edge"}-rg`, // rg
          cidr: `10.${parseIntFromZone(zone) + 4}.${
            cidrOrder.indexOf(tier) + 1
          }0.0/24`, // dynamic CIDR block creation
          network_acl:
            tier === "f5-external"
              ? "f5-external-acl"
              : `${useManagementVpc ? "management" : "edge-acl"}`, // acl
          public_gateway: false,
          has_prefix: true,
        });
    });
  });

  let edgeTiersWithZones = [];
  edgeTiers.forEach((tier) => {
    edgeTiersWithZones.push({ name: tier, zones: zones });
  });

  if (edgeTiersExist) {
    // get existing subnets
    let newSubnets = [];
    newEdgeNetwork.subnets.forEach((subnet) => {
      if (subnet.zone <= zones) {
        newSubnets.push(subnet);
      }
    });
    newEdgeNetwork.subnets = newSubnets;
  } else if (useManagementVpc) {
    // if management vpc
    // overwrite with new data
    config.store.json.vpcs[0] = newEdgeNetwork;
    config.store.edge_vpc_name = config.store.json.vpcs[0].name;
    // for each security group
    newSecurityGroups.forEach((group) => {
      // match vpc name and rg
      group.vpc = newEdgeNetwork.name;
      group.resource_group = newEdgeNetwork.resource_group;
    });
    let managementVpcTiers = // management tiers
      config.store.subnetTiers[config.store.json.vpcs[0].name];
    // add edge tiers to management tiers
    config.store.subnetTiers[config.store.json.vpcs[0].name] =
      edgeTiersWithZones.concat(managementVpcTiers);
  } else {
    // add edge rg
    config.store.json.resource_groups.push({
      use_data: false,
      use_prefix: true,
      name: "edge-rg",
    });

    // add to front
    config.store.json.vpcs.unshift(newEdgeNetwork);
    config.store.vpcList.push("edge");
    config.store.subnetTiers.edge = edgeTiersWithZones;
  }
  // set security groups to new list and then add existing to end
  if (!edgeTiersExist)
    config.store.json.security_groups = newSecurityGroups.concat(
      config.store.json.security_groups
    );

  config.update();
}

module.exports = {
  vpcInit,
  vpcCreate,
  vpcDelete,
  vpcOnStoreUpdate,
  vpcSave,
  subnetCreate,
  subnetDelete,
  subnetSave,
  subnetTierCreate,
  subnetTierSave,
  subnetTierDelete,
  naclCreate,
  naclSave,
  naclDelete,
  naclRuleCreate,
  naclRuleSave,
  naclRuleDelete,
  createEdgeVpc,
};
