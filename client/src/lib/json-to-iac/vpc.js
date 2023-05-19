const {
  kebabCase,
  snakeCase,
  allFieldsNull,
  getObjectFromArray,
  contains,
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
  cdktfRef,
} = require("./utils");
const { jsonToTf } = require("json-to-tf");
const { formatSgRule, formatSecurityGroup } = require("./security-groups");
const { versionsTf } = require("./constants");
const { routingTableTf } = require("./routing-tables");
const { varDotRegion, varDotPrefix } = require("../constants");

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
 * @param {boolean=} useVarRef use variable reference for tags and rg
 * @returns {object} terraform code
 */

function ibmIsVpc(vpc, config, useVarRef) {
  let data = {
    name: `${vpc.name}-vpc`,
    data: {
      name: kebabName([vpc.name, "vpc"]),
      resource_group: `\${var.${snakeCase(vpc.resource_group)}_id}`,
      default_network_acl_name: vpc.default_network_acl_name
        ? vpc.default_network_acl_name
        : null,
      default_security_group_name: vpc.default_security_group_name
        ? vpc.default_security_group_name
        : null,
      default_routing_table_name: vpc.default_routing_table_name
        ? vpc.default_routing_table_name
        : null,
      tags: getTags(config, useVarRef),
    },
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
 * @param {boolean=} useVarRef use variable reference for tags and rg
 * @returns {string} terraform code
 */
function formatVpc(vpc, config, useVarRef) {
  let data = ibmIsVpc(vpc, config, useVarRef);
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
      name: kebabName([address.vpc, address.name]),
      vpc: vpcRef(address.vpc),
      zone: composedZone(address.zone),
      cidr: address.cidr,
    },
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
 * @param {boolean=} useVarRef use variable reference for tags and rg
 * @returns {object} terraform code
 */

function ibmIsSubnet(subnet, config, useVarRef) {
  let subnetName = kebabCase(`${subnet.vpc}-${subnet.name}`);
  let data = {
    name: subnetName,
    data: {
      vpc: vpcRef(subnet.vpc),
      name: kebabName([subnetName]),
      zone: composedZone(subnet.zone),
      resource_group: `\${var.${snakeCase(subnet.resource_group)}_id}`,
      tags: getTags(config, useVarRef),
      network_acl: tfRef(
        "ibm_is_network_acl",
        snakeCase(subnet.vpc + ` ${subnet.network_acl}_acl`)
      ),
    },
  };

  data.data.ipv4_cidr_block = subnet.has_prefix
    ? `\${ibm_is_vpc_address_prefix.${snakeCase(subnetName)}_prefix.cidr}`
    : subnet.cidr;

  if (subnet.public_gateway) {
    data.data.public_gateway = tfRef(
      "ibm_is_public_gateway",
      `${subnet.vpc} gateway zone ${subnet.zone}`
    );
  }
  if (!subnet.has_prefix) {
    let addressPrefixes = getObjectFromArray(
      config.vpcs,
      "name",
      subnet.vpc
    ).address_prefixes;
    data.data.depends_on = [];
    addressPrefixes.forEach((prefix) => {
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
 * @param {boolean=} useVarRef use variable reference for tags and rg
 * @returns {string} terraform code
 */
function formatSubnet(subnet, config, useVarRef) {
  let data = ibmIsSubnet(subnet, config, useVarRef);
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

function ibmIsNetworkAcl(acl, config, useRules) {
  let aclData = {
    name: `${acl.vpc} ${acl.name} acl`,
    data: {
      name: kebabName([acl.vpc, acl.name, "acl"]),
      vpc: vpcRef(acl.vpc),
      resource_group: `\${var.${snakeCase(acl.resource_group)}_id}`,
      tags: getTags(config),
    },
  };
  if (useRules) {
    aclData.data.rules = [];
    acl.rules.forEach((rule) => {
      let ruleValues = {
        action: rule.action,
        destination: rule.destination,
        direction: rule.direction,
        name: rule.name,
        source: rule.source,
      };
      ["icmp", "tcp", "udp"].forEach((protocol) => {
        let ruleHasProtocolData = !allFieldsNull(rule[protocol]);
        if (ruleHasProtocolData && protocol === "icmp") {
          ruleValues.icmp = [
            {
              type: rule.icmp.type,
              code: rule.icmp.code,
            },
          ];
        } else if (ruleHasProtocolData) {
          ruleValues[protocol] = [
            {
              port_min: rule[protocol].port_min,
              port_max: rule[protocol].port_max,
              source_port_min: rule[protocol].source_port_min,
              source_port_max: rule[protocol].source_port_max,
            },
          ];
        }
      });
      aclData.data.rules.push(ruleValues);
    });
  }
  return aclData;
}

/**
 * format network acl
 * @param {Object} acl
 * @param {Object} config
 * @param {boolean=} useRules create rules within acl block
 * @returns {string} terraform code
 */
function formatAcl(acl, config, useRules) {
  let data = ibmIsNetworkAcl(acl, config, useRules);
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
    source: rule.source,
  };

  ["icmp", "tcp", "udp"].forEach((protocol) => {
    let ruleHasProtocolData = !allFieldsNull(rule[protocol]);
    if (ruleHasProtocolData && protocol === "icmp") {
      ruleValues.icmp = [
        {
          type: rule.icmp.type,
          code: rule.icmp.code,
        },
      ];
    } else if (ruleHasProtocolData) {
      ruleValues[protocol] = [
        {
          port_min: rule[protocol].port_min,
          port_max: rule[protocol].port_max,
          source_port_min: rule[protocol].source_port_min,
          source_port_max: rule[protocol].source_port_max,
        },
      ];
    }
  });
  return {
    name: `${aclAddress} rule ${rule.name}`,
    data: ruleValues,
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
 * @param {boolean=} useVarRef use ref for tags and rg
 * @returns {object} terraform code
 */

function ibmIsPublicGateway(pgw, config, useVarRef) {
  let pgwName = pgw.override_name
    ? `${pgw.vpc}-${pgw.override_name}`
    : `${pgw.vpc}-gateway-zone-${pgw.zone}`;
  return {
    name: pgwName,
    data: {
      name: kebabName([pgwName]),
      vpc: vpcRef(pgw.vpc),
      resource_group: `\${var.${snakeCase(pgw.resource_group)}_id}`,
      zone: composedZone(pgw.zone),
      tags: getTags(config, useVarRef),
    },
  };
}

/**
 * format public gateway
 * @param {Object} pgw
 * @param {Object} config
 * @param {boolean=} useVarRef use ref for tags and rg
 * @returns {string} terraform code
 */
function formatPgw(pgw, config, useVarRef) {
  let data = ibmIsPublicGateway(pgw, config, useVarRef);
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
  config.vpcs.forEach((vpc) => {
    let blockData = formatVpc(vpc, config);
    vpc.address_prefixes.forEach((prefix) => {
      blockData += formatAddressPrefix(prefix, config);
    });
    vpc.acls.forEach((acl) => {
      blockData += formatAcl(acl, config);
      acl.rules.forEach((rule) => {
        blockData += formatAclRule(rule);
      });
    });
    vpc.public_gateways.forEach((gateway) => {
      blockData += formatPgw(gateway, config);
    });
    vpc.subnets.forEach((subnet) => {
      blockData += formatSubnet(subnet, config);
    });
    tf += tfBlock(vpc.name + " vpc", blockData) + "\n";
  });
  return tfDone(tf);
}

/**
 * create vpc module
 * @param {Object} vpc vpc
 * @param {Array<string>} rgs list of resource groups
 * @param {*} config
 * @returns {Object} cdktf module object
 */
function vpcModuleJson(vpc, rgs, config) {
  let vpcModule = vpc.name + "_vpc";
  let moduleObject = {};
  moduleObject[vpcModule] = {
    "//": {
      metadata: {
        uniqueId: vpcModule,
        path: "./" + vpcModule,
      },
    },
    source: "./" + vpcModule,
    region: varDotRegion,
    prefix: varDotPrefix,
    tags: config._options.tags,
  };
  rgs.forEach((rg) => {
    moduleObject[vpcModule][snakeCase(rg) + "_id"] = rgIdRef(
      vpc.resource_group,
      config
    );
  });
  return moduleObject;
}

/**
 * create vpc module outputs tf
 * @param {*} vpc vpc object
 * @param {Array<object>} securityGroups security groups
 * @returns {Object} terraform module output object
 */
function vpcModuleOutputs(vpc, securityGroups) {
  let outputs = {};
  ["id", "crn"].forEach((field) => {
    outputs[field] = {
      value: `\${ibm_is_vpc.${snakeCase(vpc.name + "-vpc")}.${field}}`,
    };
  });
  vpc.subnets.forEach((subnet) => {
    outputs[snakeCase(subnet.name) + `_id`] = {
      value: `\${ibm_is_subnet.${snakeCase(
        `${subnet.vpc}-${subnet.name}`
      )}.id}`,
    };
    outputs[snakeCase(subnet.name) + `_crn`] = {
      value: `\${ibm_is_subnet.${snakeCase(
        `${subnet.vpc}-${subnet.name}`
      )}.crn}`,
    };
  });
  securityGroups.forEach((sg) => {
    if (sg.vpc === vpc.name) {
      outputs[snakeCase(`${sg.name}_id`)] = {
        value: `\${ibm_is_security_group.${snakeCase(
          `${sg.vpc} vpc ${sg.name} sg`
        )}.id}`,
      };
    }
  });
  return outputs;
}

/**
 * create vpc module tf
 * @param {*} files files object
 * @param {*} config config object
 * @returns {Object} terraform module object
 */
function vpcModuleTf(files, config) {
  let cloneConfig = config;
  cloneConfig.vpcs.forEach((vpc) => {
    let main = formatVpc(vpc, cloneConfig, true);
    let variables = {
      tags: {
        description: "List of tags",
        type: "${list(string)}",
      },
      region: {
        description: "IBM Cloud Region where resources will be provisioned",
        type: "${string}",
      },
      prefix: {
        description: "Name prefix that will be prepended to named resources",
        type: "${string}",
      },
    };
    let vpcModule = vpc.name + "_vpc";
    let allRgs = [vpc.resource_group];
    vpc.address_prefixes.forEach((prefix) => {
      main += formatAddressPrefix(prefix, cloneConfig);
    });
    vpc.public_gateways.forEach((gateway) => {
      main += formatPgw(gateway, cloneConfig, true);
    });
    vpc.subnets.forEach((subnet) => {
      main += formatSubnet(subnet, cloneConfig, true);
      if (!contains(allRgs, subnet.resource_group)) {
        allRgs.push(subnet.resource_group);
      }
    });

    allRgs.forEach((rg) => {
      variables[snakeCase(rg) + "_id"] = {
        description: "ID for the resource group " + rg,
        type: "${string}",
      };
    });

    files[vpcModule] = {
      "main.tf": tfBlock(vpc.name + " vpc", main),
      "versions.tf": versionsTf,
      "variables.tf": tfBlock(
        vpc.name + " vpc variables",
        "\n" + jsonToTf(JSON.stringify({ variable: variables })) + "\n"
      ),
    };

    vpc.acls.forEach((acl) => {
      let aclData = formatAcl(acl, cloneConfig, true);
      let data = tfBlock(
        snakeCase(`${acl.vpc} ${acl.name} acl`),
        aclData
      ).replace(/Acl(?=\n)/gs, "ACL");
      files[vpcModule]["acl_" + snakeCase(`${acl.vpc} ${acl.name}.tf`)] = data;
    });

    cloneConfig.security_groups.forEach((sg) => {
      if (sg.vpc === vpc.name) {
        let sgData = formatSecurityGroup(sg, cloneConfig);
        sg.rules.forEach((rule) => (sgData += formatSgRule(rule)));
        files[vpcModule]["sg_" + snakeCase(`${sg.name}`) + ".tf"] = tfBlock(
          "Security Group " + sg.name,
          sgData
        );
      }
    });

    if (cloneConfig.routing_tables) {
      cloneConfig.routing_tables.forEach((rt) => {
        if (rt.vpc === vpc.name) {
          files[vpcModule]["rt_" + snakeCase(rt.name) + ".tf"] = routingTableTf(
            {
              routing_tables: [rt],
              vpcs: cloneConfig.vpcs,
              _options: config._options,
            }
          );
        }
      });
    }

    files[vpcModule]["outputs.tf"] = tfBlock(
      vpc.name + " vpc outputs",
      "\n" +
        jsonToTf(
          JSON.stringify({
            output: vpcModuleOutputs(vpc, cloneConfig.security_groups),
          })
        ) +
        "\n"
    );

    let moduleData =
      "\n" +
      jsonToTf(
        JSON.stringify({
          module: vpcModuleJson(vpc, allRgs, config),
        })
      ) +
      "\n";
    files["main.tf"] += "\n" + tfBlock(`${vpc.name} vpc module`, moduleData);
  });
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
  ibmIsVpcAddressPrefix,
  vpcModuleTf,
  vpcModuleJson,
  vpcModuleOutputs,
};
