const {
  kebabCase,
  snakeCase,
  allFieldsNull,
  getObjectFromArray
} = require("lazy-z");
const {
  rgIdRef,
  vpcRef,
  tfDone,
  kebabName,
  composedZone,
  tfRef,
  tfBlock,
  getTags,
  jsonToTfPrint,
  cdktfRef
} = require("./utils");

/**
 * format vpc terraform
 * @param {Object} vpc
 * @param {string} vpc.name
 * @param {string} vpc.resource_group
 * @param {boolean=} vpc.classic_access
 * @param {boolean=} vpc.manual_address_prefix_management
 * @param {string=} vpc.default_network_acl_name
 * @param {string=} vpc.default_routing_table_name
 * @param {string=} vpc.default_security_group_name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object} terraform code
 */

function ibmIsVpc(vpc, config) {
  let data = {
    name: `${vpc.name}-vpc`,
    data: {
      name: kebabName(config, [vpc.name, "vpc"]),
      resource_group: rgIdRef(vpc.resource_group, config),
      default_network_acl_name: vpc.default_network_acl_name
        ? vpc.default_network_acl_name
        : null,
      default_security_group_name: vpc.default_security_group_name
        ? vpc.default_security_group_name
        : null,
      default_routing_table_name: vpc.default_routing_table_name
        ? vpc.default_routing_table_name
        : null,
      tags: getTags(config)
    }
  };
  if (vpc.classic_access) {
    data.data.classic_access = true;
  }
  if (vpc.manual_address_prefix_management) {
    data.data.address_prefix_management = "manual";
  }
  return data;
}

/**
 * format vpc terraform
 * @param {Object} vpc
 * @param {Object} config
 * @returns {string} terraform code
 */
function formatVpc(vpc, config) {
  let data = ibmIsVpc(vpc, config);
  return jsonToTfPrint("resource", "ibm_is_vpc", data.name, data.data);
}

/**
 * format vpc address prefix
 * @param {Object} address
 * @param {string} address.name
 * @param {string} address.cidr
 * @param {string} address.vpc vpc name
 * @param {number} address.zone
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {object} terraform code
 */

function ibmIsVpcAddressPrefix(address, config) {
  return {
    name: `${address.vpc}-${address.name}-prefix`,
    data: {
      name: kebabName(config, [address.vpc, address.name]),
      vpc: vpcRef(address.vpc),
      zone: composedZone(config, address.zone),
      cidr: address.cidr
    }
  };
}

/**
 * format vpc address prefix
 * @param {Object} address
 * @param {Object} config
 * @returns {string} terraform code
 */
function formatAddressPrefix(address, config) {
  let prefix = ibmIsVpcAddressPrefix(address, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_vpc_address_prefix",
    prefix.name,
    prefix.data
  );
}

/**
 * format vpc subnet
 * @param {Object} subnet
 * @param {string} subnet.vpc
 * @param {string} subnet.name
 * @param {number} subnet.zone
 * @param {string} subnet.resource_group
 * @param {string} subnet.cidr
 * @param {string} subnet.network_acl
 * @param {boolean} subnet.public_gateway
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {object} terraform code
 */

function ibmIsSubnet(subnet, config) {
  let subnetName = kebabCase(`${subnet.vpc}-${subnet.name}`);
  let data = {
    name: subnetName,
    data: {
      vpc: vpcRef(subnet.vpc),
      name: kebabName(config, [subnetName]),
      zone: composedZone(config, subnet.zone),
      resource_group: rgIdRef(subnet.resource_group, config),
      tags: getTags(config),
      network_acl: tfRef(
        "ibm_is_network_acl",
        snakeCase(subnet.vpc + ` ${subnet.network_acl}_acl`)
      ),
      ipv4_cidr_block: subnet.has_prefix
        ? `\${ibm_is_vpc_address_prefix.${snakeCase(subnetName)}_prefix.cidr}`
        : subnet.cidr
    }
  };

  if (subnet.public_gateway) {
    data.data.public_gateway = tfRef(
      "ibm_is_public_gateway",
      `${subnet.vpc} gateway zone ${subnet.zone}`
    );
  }
  if (!subnet.has_prefix) {
    let addressPrefixes = getObjectFromArray(config.vpcs, "name", subnet.vpc)
      .address_prefixes;
    data.data.depends_on = [];
    addressPrefixes.forEach(prefix => {
      data.data.depends_on.push(
        cdktfRef(
          `ibm_is_vpc_address_prefix.${snakeCase(
            `${subnet.vpc} ${prefix.name}`
          )}_prefix`
        )
      );
    });
  }
  return data;
}

/**
 * format vpc subnet
 * @param {Object} subnet
 * @param {Object} config
 * @returns {string} terraform code
 */
function formatSubnet(subnet, config) {
  let data = ibmIsSubnet(subnet, config);
  return jsonToTfPrint("resource", "ibm_is_subnet", data.name, data.data);
}

/**
 * format network acl
 * @param {Object} acl
 * @param {string} acl.name
 * @param {string} acl.resource_group
 * @param {string} acl.vpc
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {object} terraform code
 */

function ibmIsNetworkAcl(acl, config) {
  return {
    name: `${acl.vpc} ${acl.name} acl`,
    data: {
      name: kebabName(config, [acl.vpc, acl.name, "acl"]),
      vpc: vpcRef(acl.vpc),
      resource_group: rgIdRef(acl.resource_group, config),
      tags: getTags(config)
    }
  };
}

/**
 * format network acl
 * @param {Object} acl
 * @param {Object} config
 * @returns {string} terraform code
 */
function formatAcl(acl, config) {
  let data = ibmIsNetworkAcl(acl, config);
  return jsonToTfPrint("resource", "ibm_is_network_acl", data.name, data.data);
}

/**
 * create network acl rule
 * @param {Object} rule
 * @param {string} rule.acl
 * @param {string} rule.vpc
 * @param {string} rule.action
 * @param {string} rule.destination
 * @param {string} rule.direction
 * @param {string} rule.name
 * @param {string} rule.source
 * @param {Object} rule.icmp
 * @param {number} rule.icmp.type
 * @param {number} rule.icmp.code
 * @param {Object} rule.tcp
 * @param {number} rule.tcp.port_min
 * @param {number} rule.tcp.port_max
 * @param {number} rule.tcp.source_port_min
 * @param {number} rule.tcp.source_port_max
 * @param {Object} rule.udp
 * @param {number} rule.udp.port_min
 * @param {number} rule.udp.port_max
 * @param {number} rule.udp.source_port_min
 * @param {number} rule.udp.source_port_max
 * @returns {object} terraform formatted acl rule
 */

function ibmIsNetworkAclRule(rule) {
  let aclAddress = `${rule.vpc} ${rule.acl} acl`;
  let ruleValues = {
    network_acl: tfRef("ibm_is_network_acl", `${rule.vpc} ${rule.acl} acl`),
    action: rule.action,
    destination: rule.destination,
    direction: rule.direction,
    name: rule.name,
    source: rule.source
  };

  ["icmp", "tcp", "udp"].forEach(protocol => {
    let ruleHasProtocolData = !allFieldsNull(rule[protocol]);
    if (ruleHasProtocolData && protocol === "icmp") {
      ruleValues.icmp = [
        {
          type: rule.icmp.type,
          code: rule.icmp.code
        }
      ];
    } else if (ruleHasProtocolData) {
      ruleValues[protocol] = [
        {
          port_min: rule[protocol].port_min,
          port_max: rule[protocol].port_max,
          source_port_min: rule[protocol].source_port_min,
          source_port_max: rule[protocol].source_port_max
        }
      ];
    }
  });
  return {
    name: `${aclAddress} rule ${rule.name}`,
    data: ruleValues
  };
}

/**
 * create network acl rule
 * @param {Object} rule
 * @returns {string} terraform formatted acl rule
 */
function formatAclRule(rule) {
  let data = ibmIsNetworkAclRule(rule);
  return jsonToTfPrint(
    "resource",
    "ibm_is_network_acl_rule",
    data.name,
    data.data
  );
}

/**
 * format public gateway
 * @param {Object} pgw
 * @param {string} pgw.override_name
 * @param {string} pgw.resource_group
 * @param {string} pgw.vpc
 * @param {number} pgw.zone
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {object} terraform code
 */

function ibmIsPublicGateway(pgw, config) {
  let pgwName = pgw.override_name
    ? `${pgw.vpc}-${pgw.override_name}`
    : `${pgw.vpc}-gateway-zone-${pgw.zone}`;
  return {
    name: pgwName,
    data: {
      name: kebabName(config, [pgwName]),
      vpc: vpcRef(pgw.vpc),
      resource_group: rgIdRef(pgw.resource_group, config),
      zone: composedZone(config, pgw.zone),
      tags: getTags(config)
    }
  };
}

/**
 * format public gateway
 * @param {Object} pgw
 * @param {Object} config
 * @returns {string} terraform code
 */
function formatPgw(pgw, config) {
  let data = ibmIsPublicGateway(pgw, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_public_gateway",
    data.name,
    data.data
  );
}

/**
 * create vpc tf
 * @param {Object} config
 * @param {Array<Object>} config.vpcs
 * @param {Array<Object>} config.vpcs.address_prefixes
 * @param {Array<Object>} config.vpcs.acls
 * @param {Array<Object>} config.vpcs.acls.rules
 * @param {Array<Object>} config.vpcs.public_gateways
 * @param {Array<Object>} config.vpcs.subnets
 * @returns {string} terraform for one or more vpcs
 */
function vpcTf(config) {
  let tf = "";
  config.vpcs.forEach(vpc => {
    let blockData = formatVpc(vpc, config);
    vpc.address_prefixes.forEach(prefix => {
      blockData += formatAddressPrefix(prefix, config);
    });
    vpc.acls.forEach(acl => {
      blockData += formatAcl(acl, config);
      acl.rules.forEach(rule => {
        blockData += formatAclRule(rule);
      });
    });
    vpc.public_gateways.forEach(gateway => {
      blockData += formatPgw(gateway, config);
    });
    vpc.subnets.forEach(subnet => {
      blockData += formatSubnet(subnet, config);
    });
    tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
  });
  return tfDone(tf);
}

module.exports = {
  formatVpc,
  formatAddressPrefix,
  formatSubnet,
  formatAcl,
  formatAclRule,
  formatPgw,
  vpcTf,
  ibmIsVpc,
  ibmIsPublicGateway,
  ibmIsSubnet,
  ibmIsNetworkAclRule,
  ibmIsNetworkAcl,
  ibmIsVpcAddressPrefix
};
