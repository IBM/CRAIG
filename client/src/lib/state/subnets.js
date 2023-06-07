const {
  transpose,
  containsKeys,
  arraySplatIndex,
  numberToZoneList,
  carve,
  splat,
  getObjectFromArray,
  formatCidrBlock,
  contains,
  splatContains,
} = require("lazy-z");
const { reservedSubnetNameExp } = require("../constants");
const { saveAdvancedSubnetTier } = require("./utils");
const { buildSubnet } = require("../builders");

// this file contains helper functions to reduce the number of lines of code in vpc.js
// while many functions are only called once, there are a lot of different use cases.
// to maintain readability, add new subnet functions here

/**
 * get subnet tier
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
function getSubnetTierData(config, stateData, componentProps) {
  let subnetData = {};
  transpose(stateData, subnetData);
  if (stateData.networkAcl === "") subnetData.networkAcl = null;
  delete subnetData.hide;
  delete subnetData.showDeleteModal;
  return {
    newTierName: containsKeys(stateData, "name")
      ? stateData.name
      : componentProps.data.name,
    oldTierName: componentProps.data.name,
    vpcName: componentProps.vpc_name,
    vpcIndex: arraySplatIndex(
      // vpc index
      config.store.json.vpcs,
      "name",
      componentProps.vpc_name
    ),
    zones: stateData.zones,
    oldTiers: config.store.subnetTiers[componentProps.vpc_name],
    subnetTier: subnetData,
  };
}

/**
 * get update tier data
 * @param {*} tier tier object
 * @param {string} oldTierName
 * @param {string} newTierName
 * @param {number} zones
 * @returns {Object} tier fata object
 */
function getUpdatedTierData(tier, oldTierName, newTierName, zones) {
  let staleTierName = tier.name === oldTierName;
  let tierName =
    staleTierName && oldTierName !== newTierName
      ? newTierName // new tier name
      : tier.name;
  let tierZones =
    staleTierName && tier.zones !== zones
      ? zones // new zones
      : tier.zones; // otherwise, old zones
  return {
    name: tierName,
    zones: tierZones,
  };
}

/**
 * get data for revising subnet from tier
 * @param {object} vpc
 * @param {number} zones
 * @param {string} newTierName
 * @param {string} oldTierName
 * @param {string} vpcName
 * @param {object} config
 * @returns {Object} data object for variable initialization
 */
function getSubnetRevisionData(vpc, newTierName, vpcName, config) {
  return {
    subnets: vpc.subnets,
    prefixes: vpc.address_prefixes,
    isEdgeVpcTier:
      config.store.edge_vpc_name === vpcName &&
      newTierName.match(reservedSubnetNameExp) !== null &&
      !config.store.json._options.dynamic_subnets,
  };
}

/**
 * delete advanced subnet tier
 * @param {Array<object>} oldTiers
 * @param {string} oldName
 * @param {object} vpc
 */
function deleteAdvancedTier(oldTiers, oldName, vpc) {
  // when deleting advanced tier
  let oldTierIndex = arraySplatIndex(
    oldTiers,
    "name",
    oldName // componentProps.data.name
  );
  let oldTier = oldTiers[oldTierIndex];
  oldTier.subnets.forEach((name) => {
    carve(vpc.subnets, "name", name);
  });
}

/**
 * delete legacy subnet tier
 * @param {Array<object>} subnets
 * @param {lazyZState} config
 * @param {string} oldTierName
 * @param {string} oldVpcName
 * @param {number} vpcIndex
 */
function deleteLegacySubnetTier(
  subnets,
  config,
  oldTierName,
  oldVpcName,
  vpcIndex
) {
  subnets.forEach((subnet) => {
    if (
      // do not replace f5 tiers
      !contains(
        [
          "vpn-1",
          "vpn-2",
          "f5-workload",
          "f5-management",
          "f5-external",
          "f5-bastion",
        ],
        subnet.name.replace(/-zone-\d/g, "")
      ) &&
      !subnet.tier
    ) {
      let splatTiers = splat(config.store.subnetTiers[oldVpcName], "name");
      splatTiers.splice(splatTiers.indexOf(oldTierName), 1);

      let newCidr = formatCidrBlock(
        vpcIndex,
        subnet.zone, // zone number
        splatTiers.indexOf(subnet.name.replace(/-zone-\d/g, ""))
      );
      subnet.cidr = newCidr;
      let subnetAddressPrefix = getObjectFromArray(
        config.store.json.vpcs[vpcIndex].address_prefixes,
        "name",
        subnet.name
      );
      subnetAddressPrefix.cidr = newCidr;
    }
  });
}

/**
 * update advanced subnet tier
 * @param {object} tierData
 * @param {lazyZState} config
 * @param {object} stateData
 * @param {object} componentProps
 * @param {string} oldTierName
 * @param {string} vpcName
 * @param {string} newTierName
 * @param {number} vpcIndex
 * @returns {Object} tier data object
 */
function updateAdvancedSubnetTier(
  tierData,
  config,
  stateData,
  componentProps,
  oldTierName,
  vpcName,
  newTierName,
  vpcIndex
) {
  tierData.advanced = true;
  saveAdvancedSubnetTier(
    config,
    stateData,
    componentProps,
    oldTierName,
    tierData,
    vpcName,
    newTierName,
    vpcIndex
  );
  // for each address prefix
  config.store.json.vpcs[vpcIndex].address_prefixes.forEach((prefix) => {
    if (
      !contains(tierData.select_zones, prefix.zone) &&
      prefix.name.startsWith(oldTierName)
    ) {
      // if starts with old tier name and zone not selected remove
      carve(
        config.store.json.vpcs[vpcIndex].address_prefixes,
        "name",
        prefix.name
      );
    } else if (prefix.name.startsWith(oldTierName)) {
      // otherwise rename
      prefix.name = prefix.name.replace(oldTierName, newTierName);
    }
  });
  return tierData;
}

/**
 * push legacy subnets and addresses to vpc
 * @param {object} vpc
 * @param {number} zones
 * @param {boolean} isEdgeVpcTier
 * @param {string} newTierName
 * @param {Array<Object>} newTiers
 * @param {string} vpcName
 * @param {number} vpcIndex
 * @param {object} stateData
 * @param {lazyZState} config
 */
function editSubnets(
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
) {
  let validZones = zones === 0 || !zones ? [] : numberToZoneList(zones);
  let currentZones = vpc.subnets.filter((subnet) =>
    subnet.name.startsWith(oldTierName)
  ).length;
  while (currentZones < zones) {
    // reserve f5 subnet tiers
    let actualTierIndex = isEdgeVpcTier
      ? [
          "vpn-1",
          "vpn-2",
          "f5-management",
          "f5-external",
          "f5-workload",
          "f5-bastion",
        ].indexOf(newTierName)
      : arraySplatIndex(newTiers, "name", newTierName);
    // if increasing number of zones, add new subnet
    currentZones++;
    if (config.store.json._options.dynamic_subnets) {
      vpc.subnets.push({
        vpc: vpcName,
        zone: currentZones,
        cidr: null,
        name: newTierName + "-zone-" + currentZones,
        networkAcl: stateData?.networkAcl,
        resource_group: config.store.json.vpcs[vpcIndex].resource_group,
        has_prefix: false,
      });
    } else {
      vpc.subnets.push(
        buildSubnet(
          vpcName,
          vpcIndex,
          stateData.name,
          actualTierIndex,
          stateData?.networkAcl,
          config.store.json.vpcs[vpcIndex].resource_group,
          currentZones,
          false, //public gateway will update later if should be updated
          stateData.use_prefix, // prefix,
          isEdgeVpcTier
        )
      );
      let newSubnet = vpc.subnets[vpc.subnets.length - 1];
      vpc.address_prefixes.push({
        name: newSubnet.name,
        cidr: newSubnet.cidr,
        vpc: vpcName,
        zone: newSubnet.zone,
      });
    }
  }
  for (let i = vpc.subnets.length - 1; i >= 0; i--) {
    // start from end and loop backwards so deletions do not error
    if (vpc.subnets[i].name.startsWith(oldTierName)) {
      // only update the tier being updated
      let zone = `zone-${vpc.subnets[i].zone}`;
      let zoneSubnetName = `${oldTierName}-${zone}`; // name to search for
      let tierIndex = arraySplatIndex(
        // tier subnet index
        vpc.subnets,
        "name",
        zoneSubnetName
      );
      // if the tier is found and the zone is not valid, remove the subnet
      if (tierIndex >= 0 && !contains(validZones, zone)) {
        carve(vpc.subnets, "name", zoneSubnetName);
        // only update prefix if not using dynamic scaling
        if (
          !config.store.json._options.dynamic_subnets &&
          splatContains(vpc.address_prefixes, "name", zoneSubnetName)
        )
          carve(vpc.address_prefixes, "name", zoneSubnetName);
      } else if (tierIndex >= 0 && oldTierName !== newTierName) {
        // if the tier is found and the old tier name is different from the new one
        // change name for subnet and address prefix
        let newName = `${newTierName}-${zone}`;
        vpc.subnets[tierIndex].name = newName;
        if (!config.store.json._options.dynamic_subnets) {
          let prefixRef = getObjectFromArray(
            vpc.address_prefixes,
            "name",
            zoneSubnetName
          );
          prefixRef.name = newName;
        }
        // tier not found but zone is valid
      }
      // if a subnet is not created
      if (tierIndex >= 0 && zones > 0 && contains(validZones, zone)) {
        // optionally change nacl
        if (stateData.networkAcl !== undefined) {
          vpc.subnets[tierIndex].network_acl = stateData.networkAcl;
        }
        // optionally change gateway
        if (
          contains(
            componentProps.craig.store.json.vpcs[vpcIndex].publicGateways,
            vpc.subnets[i].zone
          )
        ) {
          vpc.subnets[tierIndex].public_gateway =
            stateData.addPublicGateway || false;
        }
      }
    }
  }
}

module.exports = {
  getSubnetTierData,
  getUpdatedTierData,
  getSubnetRevisionData,
  deleteAdvancedTier,
  deleteLegacySubnetTier,
  updateAdvancedSubnetTier,
  editSubnets,
};
