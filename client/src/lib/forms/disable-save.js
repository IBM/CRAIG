const {
  isIpv4CidrOrAddress,
  distinct,
  contains,
  flatten,
  splat,
  isNullOrEmptyString,
} = require("lazy-z");
const { validSshKey } = require("./invalid-callbacks");

/**
 * disable save
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @param {lazyZstate=} craig used for subnets, component props do not have craig
 * @returns {boolean} true if match
 */
function disableSave(field, stateData, componentProps, craig) {
  let stateDisableSaveComponents = [
    "vpn_servers",
    "vpn_server_routes",
    "transit_gateways",
    "classic_gateways",
    "load_balancers",
    "classic_vlans",
    "classic_ssh_keys",
    "clusters",
    "worker_pools",
    "opaque_secrets",
    "icd",
    "options",
    "atracker",
    "resource_groups",
    "key_management",
    "encryption_keys",
    "power",
    "network",
    "cloud_connections",
    "event_streams",
    "power_instances",
    "power_volumes",
    "acl_rules",
    "acls",
    "subnetTier",
    "subnet",
    "vpcs",
    "vsi",
    "volumes",
    "sg_rules",
    "security_groups",
    "ssh_keys",
    "cbr_zones",
    "addresses",
    "exclusions",
    "cbr_rules",
    "contexts",
    "resource_attributes",
    "tags",
    "virtual_private_endpoints",
    "vpn_gateways",
    "secrets_manager",
    "gre_tunnels",
    "dns",
    "zones",
    "records",
    "custom_resolvers",
    "prefix_filters",
    "routing_tables",
    "routes",
    "cis",
    "domains",
    "dns_records",
    "iam_account_settings",
    "access_groups",
    "policies",
    "dynamic_policies",
    "logdna",
    "sysdig",
    "keys",
    "appid",
    "vtl",
    "buckets",
    "object_storage",
    "cos_keys",
    "scc_v2",
    "profile_attachments",
    "f5_vsi_template",
    "f5_vsi",
    "scc",
    "cis_glbs",
    "origins",
    "glbs",
    "health_checks",
    "connections",
    "fortigate_vnf",
    "classic_security_groups",
    "classic_sg_rules",
    "classic_vsi",
    "classic_bare_metal",
  ];
  let isPowerSshKey = field === "ssh_keys" && componentProps.arrayParentName;
  if (contains(stateDisableSaveComponents, field) || isPowerSshKey) {
    return (
      contains(["network", "cloud_connections"], field)
        ? componentProps.craig.power[field]
        : isPowerSshKey
        ? componentProps.craig.power.ssh_keys
        : field === "classic_ssh_keys"
        ? componentProps.craig.classic_ssh_keys
        : field === "volumes"
        ? componentProps.craig.vsi.volumes
        : field === "acl_rules" &&
          (componentProps.isModal || componentProps.craig)
        ? componentProps.craig.vpcs.acls.rules
        : field === "acl_rules"
        ? componentProps.innerFormProps.craig.vpcs.acls.rules
        : field === "subnet" && craig // only used for icse-react-assets subnet form
        ? craig.vpcs.subnets
        : field === "subnet"
        ? componentProps.craig.vpcs.subnets
        : field === "subnetTier"
        ? componentProps.craig.vpcs.subnetTiers
        : field === "acls"
        ? componentProps.craig.vpcs[field]
        : contains(["zones", "records", "custom_resolvers"], field)
        ? componentProps.craig.dns[field]
        : field === "vpn_server_routes"
        ? componentProps.craig.vpn_servers.routes
        : field === "encryption_keys"
        ? componentProps.craig.key_management.keys
        : contains(["worker_pools", "opaque_secrets"], field)
        ? componentProps.craig.clusters[field]
        : field === "sg_rules"
        ? componentProps.craig.security_groups.rules
        : contains(["addresses", "exclusions"], field)
        ? componentProps.craig.cbr_zones[field]
        : contains(["contexts", "resource_attributes", "tags"], field)
        ? componentProps.craig.cbr_rules[field]
        : contains(["gre_tunnels", "prefix_filters"], field)
        ? componentProps.craig.transit_gateways[field]
        : contains(["routes"], field)
        ? componentProps.craig.routing_tables[field]
        : contains(["domains", "dns_records"], field)
        ? componentProps.craig.cis[field]
        : field === "buckets" ||
          componentProps?.formName === "Service Credentials"
        ? componentProps.craig.object_storage[
            field === "buckets" ? field : "keys"
          ]
        : field === "keys"
        ? componentProps.craig.appid.keys
        : contains(["policies", "dynamic_policies"], field)
        ? componentProps.craig.access_groups[field]
        : field === "profile_attachments"
        ? componentProps.craig.scc_v2.profile_attachments
        : contains(["f5_vsi_template", "f5_vsi"], field)
        ? componentProps.craig.f5[
            field === "f5_vsi_template" ? "template" : "vsi"
          ]
        : contains(["origins", "glbs", "health_checks"], field)
        ? componentProps.craig.cis_glbs[field]
        : field === "connections"
        ? componentProps.craig.vpn_gateways.connections
        : field === "classic_sg_rules"
        ? componentProps.craig.classic_security_groups.classic_sg_rules
        : componentProps.craig[field]
    ).shouldDisableSave(stateData, componentProps);
  } else return false;
}

/**
 * check if a cidr is invalid
 * @param {*} value
 * @returns {boolean} true when not a valid cidr
 */
function invalidCidrBlock(value) {
  return isIpv4CidrOrAddress(value || "") === false || !contains(value, "/");
}

/**
 * show non toggle array form
 * depending on the submission field name the code looks determines if the form should be open based on the data passed by componentProps
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should show
 */
function forceShowForm(stateData, componentProps) {
  let openForm = false;
  if (componentProps.innerFormProps.data.enable === false) {
    return openForm;
  }

  if (componentProps.submissionFieldName === "power") {
    componentProps.innerFormProps.data.ssh_keys.forEach((key) => {
      if (!openForm) {
        openForm = !validSshKey(key.public_key);
      }
    });
  }

  if (componentProps.submissionFieldName === "vpn_gateways") {
    componentProps.innerFormProps.data.connections.forEach((connection) => {
      openForm = isNullOrEmptyString(connection.peer_address, true);
    });
  }

  if (!openForm) {
    openForm = disableSave(
      componentProps.submissionFieldName,
      componentProps.innerFormProps.data,
      componentProps.innerFormProps
    );
  }

  return openForm;
}

/**
 * disable ssh key delete
 * @param {*} componentProps
 * @param {*} componentProps.innerFormProps
 * @param {*} componentProps.innerFormProps.data
 * @param {string} componentProps.innerFormProps.data.name
 * @returns {boolean} true if should be disabled
 */
function disableSshKeyDelete(componentProps) {
  let allVsiSshKeys = [];
  ["vsi", "teleport_vsi", "f5_vsi"].forEach((vsi) => {
    allVsiSshKeys = distinct(
      allVsiSshKeys.concat(
        flatten(splat(componentProps.craig.store.json[vsi], "ssh_keys"))
      )
    );
  });
  return contains(allVsiSshKeys, componentProps.innerFormProps.data.name);
}

module.exports = {
  disableSave,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
};
