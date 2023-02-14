const { kebabCase, snakeCase, allFieldsNull, splat } = require("lazy-z");
const { endComment,} = require("./constants");
const {
  rgIdRef,
  vpcRef,
  buildTitleComment,
  kebabName,
  composedZone,
  jsonToTf,
  tfRef,
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
 * @returns {string} terraform code
 */
function formatVpc(vpc, config) {
  let vpcValues = {
    name: kebabName(config, [vpc.name, "vpc"]),
    resource_group: rgIdRef(vpc.resource_group, config),
    default_network_acl_name: vpc.default_network_acl_name,
    default_security_group_name: vpc.default_security_group_name,
    default_routing_table_name: vpc.default_routing_table_name,
    tags: true,
  };
  if (vpc.classic_access) {
    vpcValues.classic_access = true;
  }
  if (vpc.manual_address_prefix_management) {
    vpcValues.address_prefix_management = '"manual"';
  }
  return jsonToTf("ibm_is_vpc", `${vpc.name}-vpc`, vpcValues, config);
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
 * @returns {string} terraform code
 */
function formatAddressPrefix(address, config) {
  return jsonToTf(
    "ibm_is_vpc_address_prefix",
    `${address.vpc}-${address.name}-prefix`,
    {
      name: kebabName(config, [address.vpc, address.name]),
      vpc: vpcRef(address.vpc),
      zone: composedZone(config, address.zone),
      cidr: `"${address.cidr}"`,
    },
    config
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
 * @returns {string} terraform code
 */
function formatSubnet(subnet, config) {
  let subnetName = kebabCase(`${subnet.vpc}-${subnet.name}`);
  let subnetValues = {
    vpc: vpcRef(subnet.vpc),
    name: kebabName(config, [subnetName]),
    zone: composedZone(config, subnet.zone),
    resource_group: rgIdRef(subnet.resource_group, config),
    tags: true,
    network_acl: tfRef(
      "ibm_is_network_acl",
      snakeCase(subnet.vpc + ` ${subnet.network_acl}_acl`)
    ),
    ipv4_cidr_block: subnet.has_prefix
      ? `ibm_is_vpc_address_prefix.${snakeCase(subnetName)}_prefix.cidr`
      : `"${subnet.cidr}"`,
  };
  if (subnet.public_gateway) {
    subnetValues.public_gateway = tfRef(
      "ibm_is_public_gateway",
      `${subnet.vpc} gateway zone ${subnet.zone}`
    );
  }
  return jsonToTf("ibm_is_subnet", subnetName, subnetValues, config);
}

/**
 * format network acl
 * @param {Object} acl
 * @param {string} acl.name
 * @param {string} acl.resource_group
 * @param {string} acl.vpc
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform code
 */
function formatAcl(acl, config) {
  return jsonToTf(
    "ibm_is_network_acl",
    `${acl.vpc} ${acl.name} acl`,
    {
      name: kebabName(config, [acl.vpc, acl.name, "acl"]),
      vpc: vpcRef(acl.vpc),
      resource_group: rgIdRef(acl.resource_group, config),
      tags: true,
    },
    config
  );
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
 * @returns {string} terraform formatted acl rule
 */
function formatAclRule(rule) {
  let aclAddress = `${rule.vpc} ${rule.acl} acl`;
  let ruleValues = {
    network_acl: tfRef("ibm_is_network_acl", `${rule.vpc} ${rule.acl} acl`),
    action: `"${rule.action}"`,
    destination: `"${rule.destination}"`,
    direction: `"${rule.direction}"`,
    name: `"${rule.name}"`,
    source: `"${rule.source}"`,
  };

  ["icmp", "tcp", "udp"].forEach((protocol) => {
    let ruleHasProtocolData = !allFieldsNull(rule[protocol]);
    if (ruleHasProtocolData && protocol === "icmp") {
      ruleValues._icmp = {
        type: rule.icmp.type,
        code: rule.icmp.code,
      };
    } else if (ruleHasProtocolData) {
      ruleValues[`_${protocol}`] = {
        port_min: rule[protocol].port_min,
        port_max: rule[protocol].port_max,
        source_port_min: rule[protocol].source_port_min,
        source_port_max: rule[protocol].source_port_max,
      };
    }
  });
  return jsonToTf(
    "ibm_is_network_acl_rule",
    `${aclAddress} rule ${rule.name}`,
    ruleValues
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
 * @returns {string} terraform code
 */
function formatPgw(pgw, config) {
  let pgwName = pgw.override_name
    ? `${pgw.vpc}-${pgw.override_name}`
    : `${pgw.vpc}-gateway-zone-${pgw.zone}`;
  return jsonToTf(
    "ibm_is_public_gateway",
    pgwName,
    {
      name: kebabName(config, [pgwName]),
      vpc: vpcRef(pgw.vpc),
      resource_group: rgIdRef(pgw.resource_group, config),
      zone: composedZone(config, pgw.zone),
      tags: true
    },
    config
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
  let vpcNames = splat(config.vpcs, "name");
  config.vpcs.forEach((vpc) => {
    tf +=
      buildTitleComment(vpc.name, "vpc").replace(/Vpc/g, "VPC") +
      formatVpc(vpc, config);
    vpc.address_prefixes.forEach((prefix) => {
      tf += formatAddressPrefix(prefix, config);
    });
    vpc.acls.forEach((acl) => {
      tf += formatAcl(acl, config);
      acl.rules.forEach((rule) => {
        tf += formatAclRule(rule);
      });
    });
    vpc.public_gateways.forEach((gateway) => {
      tf += formatPgw(gateway, config);
    });
    vpc.subnets.forEach((subnet) => {
      tf += formatSubnet(subnet, config);
    });
    tf += endComment;
    if (
      // add newlines when multiple vpcs and is not last
      vpcNames.length > 1 &&
      vpcNames.indexOf(vpc.name) !== vpcNames.length - 1
    ) {
      tf += "\n\n";
    }
  });
  return tf;
}

module.exports = {
  formatVpc,
  formatAddressPrefix,
  formatSubnet,
  formatAcl,
  formatAclRule,
  formatPgw,
  vpcTf,
};
