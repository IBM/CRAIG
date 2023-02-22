const {
  splat,
  carve,
  transpose,
  contains,
  revision,
  arraySplatIndex,
  containsKeys,
  numberToZoneList,
  parseIntFromZone,
  formatCidrBlock,
  buildNetworkingRule
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { newDefaultVpcs, newVpc } = require("./defaults");
const { pushAndUpdate, setUnfoundResourceGroup } = require("./store.utils");
const { buildSubnet } = require("../builders");
const { reservedSubnetNameExp } = require("../constants");
const { formatNetworkingRule, updateNetworkingRule } = require("./utils");

/**
 * initialize vpc store
 * @param {lazyZstate} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function vpcInit(config) {
  config.store.json.vpcs = newDefaultVpcs();
  config.store.subnets = {};
  config.store.subnetTiers = {
    management: [
      {
        name: "vsi",
        zones: 3
      },
      { name: "vpe", zones: 3 },
      { name: "vpn", zones: 1 }
    ],
    workload: [
      {
        name: "vsi",
        zones: 3
      },
      { name: "vpe", zones: 3 }
    ]
  };
  config.store.networkAcls = {};
  config.store.vpcList = ["management", "workload"];
}

/**
 * create a new vpc
 * @param {lazyZState} config state store
 * @param {object} config.store
 * @param {object} config.store.subnetTiers tiers
 * @param {object} stateData component state data
 */
function vpcCreate(config, stateData) {
  let vpc = newVpc();
  transpose(stateData, vpc);
  config.store.subnetTiers[vpc.name] = [];
  pushAndUpdate(config, "vpcs", vpc);
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
  config.store.json.vpcs.forEach(network => {
    config.store.networkAcls[network.name] = splat(network.acls, "name");
    let subnetList = []; // create a new list
    // for each zone
    network.subnets.forEach(subnet => {
      // add the names of the subnets to the list
      subnetList = subnetList.concat(subnet.name);
      if (
        !contains(config.store.networkAcls[network.name], subnet.network_acl)
      ) {
        subnet.network_acl = null;
      }
    });
    // set subnets object vpc name to list
    config.store.subnets[network.name] = subnetList;
    // set acls object to the list of acls
    setUnfoundResourceGroup(config, network);
  });
  config.store.vpcList = splat(config.store.json.vpcs, "name");
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
    "name"
  ].forEach(field => {
    if (vpc[field] === "") {
      vpc[field] = null;
    }
  });
  if (vpc.name !== oldName) {
    // add to empty array to prevent reference to original object
    config.store.subnetTiers[stateData.name] = [];
    config.store.subnetTiers[oldName].forEach(tier => {
      config.store.subnetTiers[vpc.name].push(tier);
    });
    delete config.store.subnetTiers[oldName];
  }

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
 * @param {object} componentProps.subnet
 * @param {string} componentProps.subnet.name subnet name
 * @param {string} componentProps.name vpc name
 */
function subnetSave(config, stateData, componentProps) {
  let subnetName = componentProps.subnet.name;
  if (stateData.acl_name === "") {
    stateData.acl_name = null;
  }
  new revision(config.store.json)
    .child("vpcs", componentProps.name, "name")
    .child("subnets", subnetName, "name")
    .update(stateData);
}

/**
 * delete a subnet
 * @param {lazyZState} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Object} stateData arbitrary parameters
 * @param {object} componentProps
 * @param {object} componentProps.subnet
 * @param {string} componentProps.subnet.name subnet name
 * @param {string} componentProps.name vpc name
 */

function subnetDelete(config, stateData, componentProps) {
  let subnetName = componentProps.subnet.name;
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
  }
  // add tier to subnetTiers
  config.store.subnetTiers[vpcName].push({
    name: stateData.name,
    zones: stateData.zones
  });
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
 * @param {object} componentProps
 * @param {string} componentProps.vpc_name
 * @param {object} componentProps.tier
 * @param {string} componentProps.tier.name tier name
 */
function subnetTierSave(config, stateData, componentProps) {
  // set acl to null
  if (stateData.networkAcl === "") stateData.networkAcl = null;
  delete stateData.hide; // delete hidden from state
  delete stateData.showDeleteModal; // remove show delete modal
  let newTierName = componentProps.tier.name,
    oldTierName = componentProps.tier.name,
    vpcName = componentProps.vpc_name, // vpc name
    zones = stateData.zones, // zones
    vpcIndex = arraySplatIndex(
      // vpc index
      config.store.json.vpcs,
      "name",
      vpcName
    ),
    oldTiers = config.store.subnetTiers[componentProps.vpc_name], // old subnet tiers;
    newTiers = []; // new subnet tiers
  if (containsKeys(stateData, "name")) {
    newTierName = stateData.name;
  }
  // for each subnet tier
  oldTiers.forEach(tier => {
    // if not being deleted
    if (
      (tier.name === oldTierName && zones !== 0) || // if zones is not 0 and tier name is old name
      tier.name !== oldTierName // or if tiername is different
    ) {
      let staleTierName = tier.name === oldTierName; // tier name is the same
      // if the tier name is the old name, and the old name has changed
      let tierName =
        staleTierName && oldTierName !== newTierName
          ? newTierName // new tier name
          : tier.name; // otherwise old name
      // if the tier name is old name and zones have changed
      let tierZones =
        staleTierName && tier.zones !== zones
          ? zones // new zones
          : tier.zones; // otherwise, old zones
      newTiers.push({
        name: tierName,
        zones: tierZones
      });
    }
  });

  // edit subnets
  new revision(config.store.json)
    .child("vpcs", vpcName, "name") // get vpc
    .child("subnets") // get subnets
    .then(subnets => {
      // valid zones for subnet tier
      let validZones = zones === 0 ? [] : numberToZoneList(zones);
      // is edge vpc tier
      let isEdgeVpcTier =
        config.store.edge_vpc_name === vpcName &&
        newTierName.match(reservedSubnetNameExp) !== null;
      // if additional zones, add new subnets

      // get the current amount of zones a subnet has
      let currentZones = subnets.filter(subnet =>
        subnet.name.startsWith(oldTierName)
      ).length;
      // add subnets until they have the correct number of zones
      while (currentZones < zones) {
        // reserve f5 subnet tiers
        let actualTierIndex = isEdgeVpcTier
          ? [
              "vpn-1",
              "vpn-2",
              "f5-management",
              "f5-external",
              "f5-workload",
              "f5-bastion"
            ].indexOf(newTierName)
          : arraySplatIndex(newTiers, "name", newTierName);
        // if increasing number of zones, add new subnet
        subnets.push(
          buildSubnet(
            vpcName,
            vpcIndex,
            stateData.name,
            actualTierIndex,
            stateData?.networkAcl,
            config.store.json.vpcs[vpcIndex].resource_group,
            ++currentZones, // should be 1 more than what the current zone is
            false, //public gateway will update later if should be updated
            stateData.use_prefix, // prefix,
            isEdgeVpcTier
          )
        );
      }
      for (let i = subnets.length - 1; i >= 0; i--) {
        // start from end and loop backwards so deletions do not error
        if (subnets[i].name.startsWith(oldTierName)) {
          // only update the tier being updated
          let zone = `zone-${subnets[i].zone}`;
          let zoneSubnetName = `${oldTierName}-${zone}`; // name to search for
          let tierIndex = arraySplatIndex(
            // tier subnet index
            subnets,
            "name",
            zoneSubnetName
          );
          // if the tier is found and the zone is not valid, remove the subnet
          if (tierIndex >= 0 && !contains(validZones, zone)) {
            carve(subnets, "name", zoneSubnetName);
          } else if (tierIndex >= 0 && oldTierName !== newTierName) {
            // if the tier is found and the old tier name is different from the new one
            // change name
            subnets[tierIndex].name = `${newTierName}-${zone}`;
            // tier not found but zone is valid
          }
          let zoneInt = parseIntFromZone(zone);
          // if a subnet is not created
          if (tierIndex >= 0 && zones > 0 && contains(validZones, zone)) {
            // optionally change nacl
            if (stateData.networkAcl !== undefined) {
              subnets[tierIndex].network_acl = stateData.networkAcl;
            }
            // optionally change gateway
            if (
              stateData.addPublicGateway !== undefined &&
              componentProps.config.store.json.vpcs[vpcIndex].public_gateways[
                zoneInt - 1 // and a public gateway exists in the subnet's zone ( -1 for indexing)
              ]
            ) {
              subnets[tierIndex].public_gateway = stateData.addPublicGateway;
            }
          }
        }
      }

      // if deleting a tier
      if (zones === 0) {
        subnets.forEach(subnet => {
          if (
            // do not replace f5 tiers
            !contains(
              [
                "vpn-1",
                "vpn-2",
                "f5-workload",
                "f5-management",
                "f5-external",
                "f5-bastion"
              ],
              subnet.name.replace(/-zone-\d/g, "")
            )
          )
            subnet.cidr = formatCidrBlock(
              vpcIndex,
              subnet.zone, // zone number
              subnets.indexOf(subnet)
            );
        });
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
    .then(data => {
      data.acls.push({
        name: stateData.name,
        resource_group: data.resource_group,
        vpc: componentProps.vpc_name,
        rules: []
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
    .child("vpcs", componentProps.arrayParentName, "name") // get vpc
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
    .child("vpcs", componentProps.arrayParentName, "name")
    .child("acls", componentProps.data.name)
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
  formatNetworkingRule(config, networkRule, componentProps);
  // new revision
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name") // get vpc
    .child("acls", componentProps.parent_name) // get acls
    .child("rules", componentProps.data.name) // get rule
    .then(data => {
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
  // new revision
  new revision(config.store.json)
    .child("vpcs", componentProps.vpc_name, "name") // get vpc name
    .child("acls", componentProps.parent_name) // get network acls
    .child("rules") // get rules
    .deleteArrChild(componentProps.data.name); // delete rule
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
  naclRuleDelete
};
