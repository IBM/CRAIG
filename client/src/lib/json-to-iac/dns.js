const {
  jsonToTfPrint,
  kebabName,
  rgIdRef,
  tfRef,
  tfBlock,
  tfDone,
} = require("./utils");
const { snakeCase } = require("lazy-z");

/**
 * create dns service instance
 * @param {*} dns
 * @param {string} dns.name
 * @param {string} dns.resource_group
 * @param {string} dns.plan
 * @param {*} config
 * @returns {object} terraform
 */

function ibmResourceInstanceDnsServices(dns, config) {
  return {
    name: dns.name + "_dns_instance",
    data: {
      name: kebabName([dns.name, "dns-instance"]),
      resource_group_id: rgIdRef(dns.resource_group, config),
      location: "global",
      service: "dns-svcs",
      plan: dns.plan,
    },
  };
}

/**
 * create dns service instance
 * @param {*} dns
 * @param {string} dns.name
 * @param {string} dns.resource_group
 * @param {string} dns.plan
 * @param {*} config
 * @returns {string} terraform string
 */
function formatDnsService(dns, config) {
  let data = ibmResourceInstanceDnsServices(dns, config);
  return jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    data.name,
    data.data
  );
}

/**
 * format dns zone
 * @param {*} zone
 * @param {string}  zone.instance instance name
 * @param {string} zone.name zone name
 * @param {string} zone.description description
 * @param {string} zone.label label
 * @returns {object} terraform
 */

function ibmDnsZone(zone) {
  return {
    name: `${zone.instance} dns instance ${zone.name.replace(".", "_dot_")}`,
    data: {
      name: zone.name,
      instance_id: tfRef(
        "ibm_resource_instance",
        zone.instance + " dns instance",
        "guid"
      ),
      description: zone.description,
      label: zone.label,
    },
  };
}

/**
 * format dns zone
 * @param {*} zone
 * @param {string}  zone.instance instance name
 * @param {string} zone.name zone name
 * @param {string} zone.description description
 * @param {string} zone.label label
 * @returns {string} terraform string
 */
function formatDnsZone(zone) {
  let data = ibmDnsZone(zone);
  return jsonToTfPrint("resource", "ibm_dns_zone", data.name, data.data);
}

/**
 * create dns record tf
 * @param {*} record
 * @param {string} record.dns_zone name of dns zone
 * @param {string} record.instance name of dns instance
 * @param {string} record.name name of record
 * @param {string} record.type record type
 * @param {string} record.type record type
 * @param {string} record.rdata
 * @param {number=} record.ttl
 * @param {number=} record.weight
 * @param {number=} record.priority
 * @param {number=} record.port
 * @param {string=} record.service
 * @param {string=} record.protocol
 * @returns {Object} terraform
 */
function ibmDnsResourceRecord(record) {
  let snakeZone = record.dns_zone.replace(".", "_dot_");
  let zoneName = `${record.instance} dns instance ${snakeZone}`;
  let data = {
    name: `${zoneName}_${record.name}`,
    data: {
      instance_id: tfRef(
        "ibm_resource_instance",
        record.instance + " dns instance",
        "guid"
      ),
      zone_id: tfRef("ibm_dns_zone", zoneName, "zone_id"),
      type: record.type,
      name: record.name,
      rdata: record.rdata,
    },
  };
  ["ttl", "weight", "priority", "port", "service", "protocol"].forEach(
    (field) => {
      if (record[field]) {
        data.data[field] = record[field];
      }
    }
  );
  return data;
}

/**
 * create dns record tf
 * @param {*} record
 * @param {string} record.dns_zone name of dns zone
 * @param {string} record.instance name of dns instance
 * @param {string} record.name name of record
 * @param {string} record.type record type
 * @param {string} record.type record type
 * @param {string} record.rdata
 * @param {number=} record.ttl
 * @param {number=} record.weight
 * @param {number=} record.priority
 * @param {number=} record.port
 * @param {string=} record.service
 * @param {string=} record.protocol
 * @returns {string} terraform
 */
function formatDnsRecord(record) {
  let data = ibmDnsResourceRecord(record);
  return jsonToTfPrint(
    "resource",
    "ibm_dns_resource_record",
    data.name,
    data.data
  );
}

/**
 * format dns permitted network
 * @param {*} nw
 * @param {string} nw.instance
 * @param {string} nw.dns_zone
 * @param {string} nw.vpc
 * @returns {Object} terraform
 */

function ibmDnsPermittedNetwork(nw) {
  let snakeZone = nw.dns_zone.replace(".", "_dot_");
  let zoneName = `${nw.instance} dns instance ${snakeZone}`;
  return {
    name: zoneName + " permitted network " + nw.vpc,
    data: {
      instance_id: tfRef(
        "ibm_resource_instance",
        nw.instance + " dns instance",
        "guid"
      ),
      zone_id: tfRef("ibm_dns_zone", zoneName, "zone_id"),
      vpc_crn: `\${module.${snakeCase(nw.vpc) + "_vpc"}.crn}`,
      type: "vpc",
    },
  };
}

/**
 * format dns permitted network
 * @param {*} nw
 * @param {string} nw.instance
 * @param {string} nw.dns_zone
 * @param {string} nw.vpc
 * @returns {string} terraform
 */
function formatDnsPermittedNetwork(nw) {
  let data = ibmDnsPermittedNetwork(nw);
  return jsonToTfPrint(
    "resource",
    "ibm_dns_permitted_network",
    data.name,
    data.data
  );
}

/**
 * format custom resolver
 * @param {*} resolver
 * @param {string} resolver.instance
 * @param {string} resolver.name
 * @param {string} resolver.description
 * @param {boolean} resolver.high_availability
 * @param {boolean} resolver.enabled
 * @param {Array<Object>} resolver.locations
 * @param {string} resolver.locations.name subnet name
 * @param {booolean} resolver.locations.enabled
 * @returns {Object} terraform
 */

function ibmDnsCustomResolver(resolver) {
  let data = {
    name: `${resolver.instance} dns instance resolver ${resolver.name}`,
    data: {
      name: resolver.name,
      instance_id: tfRef(
        "ibm_resource_instance",
        resolver.instance + " dns instance",
        "guid"
      ),
      description: resolver.description,
      high_availability: resolver.high_availability,
      enabled: resolver.enabled,
      locations: [],
    },
  };
  resolver.subnets.forEach((subnet) => {
    data.data.locations.push({
      subnet_crn: `\${module.${snakeCase(resolver.vpc)}_vpc.${snakeCase(
        subnet
      )}_crn}`,
      enabled: true,
    });
  });
  return data;
}

/**
 * format custom resolver
 * @param {*} resolver
 * @param {string} resolver.instance
 * @param {string} resolver.name
 * @param {string} resolver.description
 * @param {boolean} resolver.high_availability
 * @param {boolean} resolver.enabled
 * @param {Array<Object>} resolver.locations
 * @param {string} resolver.locations.name subnet name
 * @param {booolean} resolver.locations.enabled
 * @returns {string} terraform
 */
function formatDnsCustomResolver(resolver) {
  let data = ibmDnsCustomResolver(resolver);
  return jsonToTfPrint(
    "resource",
    "ibm_dns_custom_resolver",
    data.name,
    data.data
  );
}

/**
 * create dns terraform
 * @param {*} config craig json
 * @returns {string} dns terraform string
 */
function dnsTf(config) {
  let tf = "";
  config.dns.forEach((dns) => {
    tf +=
      tfBlock(dns.name + " dns service", formatDnsService(dns, config)) + "\n";
    dns.zones.forEach((zone) => {
      let zoneTf = "";
      zoneTf += formatDnsZone(zone);
      dns.records.forEach((record) => {
        if (record.dns_zone === zone.name) {
          zoneTf += formatDnsRecord(record);
        }
      });
      zone.permitted_networks.forEach((nw) => {
        zoneTf += formatDnsPermittedNetwork({
          vpc: nw,
          instance: dns.name,
          dns_zone: zone.name,
        });
      });
      tf += tfBlock(dns.name + " dns zone " + zone.name, zoneTf) + "\n";
    });
    if (dns.custom_resolvers.length > 0) {
      let resolverTf = "";
      dns.custom_resolvers.forEach((resolver) => {
        resolverTf += formatDnsCustomResolver(resolver);
      });
      tf += tfBlock(dns.name + " dns custom resolvers", resolverTf);
      tf += "\n";
    }
  });
  return tfDone(tf);
}

module.exports = {
  formatDnsService,
  formatDnsZone,
  formatDnsRecord,
  formatDnsPermittedNetwork,
  formatDnsCustomResolver,
  dnsTf,
};
