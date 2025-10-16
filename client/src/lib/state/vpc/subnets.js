const {
  revision,
  contains,
  arraySplatIndex,
  isArray,
  carve,
} = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");
const { buildSubnet } = require("../../builders");
const { deleteLegacySubnetTier } = require("../subnets");

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
 * @param {string} componentProps.vpc_nam
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name tier name
 * @param {boolean} componentProps.data.advanced
 */
function newSubnetTierSave(config, stateData, componentProps, vpcIndex) {
  let vpc = config.store.json.vpcs[vpcIndex];
  let tier = new revision(vpc).child(
    "subnetTiers",
    componentProps.data.name,
  ).data;
  let foundTierZones = 0;
  let foundZoneNumbers = [];
  let tierSubnets = [];
  ["subnets", "address_prefixes"].forEach((item) => {
    // for each address prefix and subnet
    let nextVpcItems = [];
    vpc[item].forEach((resource) => {
      if (
        componentProps.data.advanced
          ? stateData.zones !== 0 &&
            stateData.subnets &&
            contains(stateData.subnets, resource.name) &&
            contains(stateData.select_zones, String(resource.zone))
          : // if the subnet matches the old name and is in the new zones
            resource.name.match(
              new RegexButWithWords()
                .stringBegin()
                .literal(`${tier.name}-zone-`)
                .digit()
                .stringEnd()
                .done("g"),
            ) !== null &&
            // if tier is advanced, check select zones or zones for resource zone
            (stateData.advanced && !componentProps.data.zones
              ? contains(
                  stateData.select_zones || stateData.zones,
                  resource.zone,
                )
              : isArray(stateData.zones) || isArray(stateData.select_zones)
                ? contains(
                    stateData.select_zones || stateData.zones,
                    String(resource.zone),
                  )
                : resource.zone <= stateData.zones)
      ) {
        // change name and return
        resource.name = resource.name.replace(tier.name, stateData.name);

        // add to list
        if (item === "subnets") {
          foundTierZones++;
          foundZoneNumbers.push(Number(resource.zone));
          tierSubnets.push(resource.name.replace(tier.name, stateData.name));
        }

        // handle setting nacl
        if (stateData.networkAcl && item === "subnets") {
          resource.network_acl = stateData.networkAcl;
        } else if (
          item === "subnets" &&
          !(stateData.advanced && !tier.advanced)
        ) {
          resource.network_acl = null;
        }

        // add tier if unfound
        if (
          ((stateData.advanced && !tier.advanced) || resource.tier) &&
          item === "subnets"
        ) {
          resource.tier = stateData.name;
        }

        // add pgw
        if (
          stateData.addPublicGateway &&
          item === "subnets" &&
          contains(vpc.publicGateways, resource.zone)
        ) {
          resource.public_gateway = stateData.addPublicGateway;
        }
        return nextVpcItems.push(resource);
      } else if (
        // otherwise only return names that do not match the pattern
        resource.name.match(
          new RegexButWithWords()
            .stringBegin()
            .literal(`${tier.name}-zone-`)
            .digit()
            .stringEnd()
            .done("g"),
        ) === null
      ) {
        return nextVpcItems.push(resource);
      }
    });
    vpc[item] = nextVpcItems;
  });

  // add additional zones
  if (
    stateData.advanced &&
    foundZoneNumbers.length < (stateData.select_zones || stateData.zones).length
  ) {
    let zones = stateData.select_zones.filter((zone) => {
      if (!contains(foundZoneNumbers, Number(zone))) {
        return zone;
      }
    });
    zones.forEach((zone) => {
      vpc.subnets.push({
        name: stateData.name + "-zone-" + zone,
        cidr: "",
        network_acl: "",
        public_gateway: false,
        zone: zone,
        vpc: componentProps.vpc_name,
        resource_group: vpc.resource_group,
        has_prefix: true,
        tier: stateData.name,
      });
      tierSubnets.push(stateData.name + "-zone-" + zone);
    });
  } else if (!stateData.advanced && foundTierZones < stateData.zones) {
    let isEdgeVpcTier =
      contains(
        [
          "vpn-1",
          "vpn-2",
          "f5-management",
          "f5-external",
          "f5-workload",
          "f5-bastion",
        ],
        stateData.name,
      ) && config.store.edge_vpc_name === vpc.name;
    for (let i = foundTierZones; i < stateData.zones; i++) {
      vpc.subnets.push(
        buildSubnet(
          vpc.name,
          vpcIndex,
          stateData.name,
          isEdgeVpcTier
            ? [
                "vpn-1",
                "vpn-2",
                "f5-management",
                "f5-external",
                "f5-workload",
                "f5-bastion",
              ].indexOf(stateData.name)
            : arraySplatIndex(
                vpc.subnetTiers,
                "name",
                componentProps.data.name,
              ) + 1,
          stateData?.networkAcl,
          vpc.resource_group,
          i + 1,
          contains(vpc.publicGateways, i + 1)
            ? stateData.addPublicGateway
            : false,
          stateData.use_prefix,
          isEdgeVpcTier,
        ),
      );
      let lastSubnet = vpc.subnets.length - 1;
      vpc.address_prefixes.push({
        vpc: vpc.name,
        zone: i + 1,
        cidr: vpc.subnets[lastSubnet].cidr,
        name: vpc.subnets[lastSubnet].name,
      });
    }
  }

  // update subnets
  ["vsi", "vpn_servers", "virtual_private_endpoints"].forEach((item) => {
    config.store.json[item].forEach((resource) => {
      for (let i = 0; i < resource.subnets.length; i++) {
        if (resource.subnets[i].startsWith(tier.name)) {
          resource.subnets[i] = resource.subnets[i].replace(
            tier.name,
            stateData.name,
          );
        }
      }
    });
  });
  config.store.json.clusters.forEach((cluster) => {
    for (let i = 0; i < cluster.subnets.length; i++) {
      if (cluster.subnets[i].startsWith(tier.name)) {
        cluster.subnets[i] = cluster.subnets[i].replace(
          tier.name,
          stateData.name,
        );
      }
    }
    cluster.worker_pools.forEach((pool) => {
      for (let i = 0; i < pool.subnets.length; i++) {
        if (pool.subnets[i].startsWith(tier.name)) {
          pool.subnets[i] = pool.subnets[i].replace(tier.name, stateData.name);
        }
      }
    });
  });
  config.store.json.dns.forEach((dns) => {
    dns.custom_resolvers.forEach((resolver) => {
      resolver.subnets.forEach((subnet, index) => {
        resolver.subnets[index] = resolver.subnets[index].replace(
          tier.name,
          stateData.name,
        );
      });
    });
  });
  if (stateData.zones === 0) {
    carve(vpc.subnetTiers, "name", componentProps.data.name);
    try {
      carve(
        config.store.subnetTiers[vpc.name],
        "name",
        componentProps.data.name,
      );
    } catch (err) {
      console.error("subnet tier not found on craig object, continuing...");
    }
    deleteLegacySubnetTier(
      vpc.subnets,
      config,
      tier.name,
      vpc.name,
      vpcIndex,
      true,
    );
  } else if (stateData.advanced && !tier.advanced) {
    config.store.json._options.advanced_subnets = true;
    let nextStateData = {
      name: stateData.name,
      zones: undefined,
      advanced: true,
      networkAcl: "-",
      select_zones: stateData.select_zones || stateData.zones,
      subnets: tierSubnets,
    };
    new revision(vpc)
      .child("subnetTiers", componentProps.data.name)
      .update(nextStateData);
  } else {
    if (componentProps.data.advanced) stateData.subnets = tierSubnets;
    new revision(vpc)
      .child("subnetTiers", componentProps.data.name)
      .update(stateData);
  }
  config.store.subnetTiers[vpc.name] = vpc.subnetTiers;
}

module.exports = {
  newSubnetTierSave,
};
