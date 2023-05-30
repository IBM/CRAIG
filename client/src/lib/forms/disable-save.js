const {
  isNullOrEmptyString,
  isEmpty,
  isIpv4CidrOrAddress,
  containsKeys,
  validPortRange,
  isInRange,
  distinct,
  contains,
  flatten,
  splat,
  isWholeNumber,
  areNotWholeNumbers,
  anyAreEmpty,
  haveValidRanges,
} = require("lazy-z");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidSubnetTierName,
  invalidSecurityGroupRuleName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  invalidCrnList,
  isValidUrl,
  invalidCbrRule,
  invalidCbrZone,
  validRecord,
  invalidDNSDescription,
  invalidDnsZoneName,
} = require("./invalid-callbacks");
const { commaSeparatedIpListExp } = require("../constants");

/**
 * check if a field is null or empty string, reduce unit test writing
 * @param {string} field
 * @param {Object} stateData
 * @returns {boolean} true if null or empty string
 */
function badField(field, stateData) {
  return isNullOrEmptyString(stateData[field]);
}

/**
 * reduct unit test writing check if any fields from list are null or empty string
 * @param {*} fields
 * @param {*} stateData
 * @returns {boolean} true if any null or empty string
 */
function fieldsAreBad(fields, stateData) {
  let hasBadFields = false;
  fields.forEach((field) => {
    if (badField(field, stateData)) {
      hasBadFields = true;
    }
  });
  return hasBadFields;
}

/**
 * check multiple fields against the same validating regex expression
 * @param {Array} fields list of fields
 * @param {Function} check test fields with this
 * @param {Object} stateData
 * @returns {boolean}
 */
function fieldCheck(fields, check, stateData) {
  let hasBadFields = false;
  fields.forEach((field) => {
    if (!check(stateData[field])) {
      hasBadFields = true;
    }
  });
  return hasBadFields;
}

/**
 * check multiple fields against the same invalidating regex expression
 * @param {Array} fields  list of fields to check
 * @param {function} check the check to run
 * @param {Object} stateData
 * @returns {boolean} true if any are invalid
 */
function invalidFieldCheck(fields, check, stateData) {
  let hasBadFields = false;
  fields.forEach((field) => {
    if (check(field, stateData)) {
      hasBadFields = true;
    }
  });
  return hasBadFields;
}

/**
 * test if a rule has an invalid port
 * @param {*} rule
 * @param {boolean=} isSecurityGroup
 * @returns {boolean} true if port is invalid
 */
function invalidPort(rule, isSecurityGroup) {
  let hasInvalidPort = false;
  if (rule.ruleProtocol !== "all") {
    (rule.ruleProtocol === "icmp"
      ? ["type", "code"]
      : isSecurityGroup
      ? ["port_min", "port_max"]
      : ["port_min", "port_max", "source_port_min", "source_port_max"]
    ).forEach((type) => {
      if (rule.rule[type] && !hasInvalidPort) {
        hasInvalidPort = !validPortRange(type, rule.rule[type]);
      }
    });
  }
  return hasInvalidPort;
}

/**
 * disable save
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @param {lazyZstate=} craig used for subnets, component props do not have craig
 * @returns {boolean} true if match
 */

function disableSave(field, stateData, componentProps, craig) {
  if (field === "scc") {
    return (
      !/^[A-z][a-zA-Z0-9-\._,\s]*$/i.test(stateData.collector_description) ||
      !/^[A-z][a-zA-Z0-9-\._,\s]*$/i.test(stateData.scope_description)
    );
  } else if (field === "atracker") {
    return (
      stateData.enabled &&
      (fieldsAreBad(["bucket", "cos_key"], stateData) ||
        isEmpty(stateData.locations))
    );
  } else if (field === "access_groups") {
    return invalidName("access_groups")(stateData, componentProps);
  } else if (field === "policies") {
    return invalidName("policies")(stateData, componentProps);
  } else if (field === "dynamic_policies") {
    return (
      invalidName("dynamic_policies")(stateData, componentProps) ||
      fieldsAreBad(
        ["identity_provider", "expiration", "conditions"],
        stateData
      ) ||
      invalidIdentityProviderURI(stateData, componentProps)
    );
  } else if (field === "object_storage") {
    return (
      invalidName("object_storage")(stateData, componentProps) ||
      fieldsAreBad(["kms", "resource_group"], stateData)
    );
  } else if (field === "appid") {
    return (
      invalidName("appid")(stateData, componentProps) ||
      badField("resource_group", stateData)
    );
  } else if (field === "appid_key") {
    return invalidName("appid_keys")(stateData, componentProps);
  } else if (field === "buckets") {
    return (
      invalidName("buckets")(stateData, componentProps) ||
      badField("kms_key", stateData)
    );
  } else if (field === "cos_keys") {
    return invalidName("cos_keys")(stateData, componentProps);
  } else if (field === "encryption_keys") {
    return (
      invalidName("encryption_keys")(stateData, componentProps) ||
      invalidEncryptionKeyRing(stateData)
    );
  } else if (field === "volumes") {
    return (
      invalidName("volume")(stateData, componentProps) ||
      fieldsAreBad(["encryption_key", "capacity"], stateData) ||
      !isInRange(Number(stateData.capacity), 10, 16000)
    );
  } else if (field === "key_management") {
    return (
      invalidName("key_management")(stateData, componentProps) ||
      badField("resource_group", stateData)
    );
  } else if (field === "secrets_manager") {
    return (
      invalidName("secrets_manager")(stateData, componentProps) ||
      fieldsAreBad(["encryption_key", "resource_group"], stateData)
    );
  } else if (field === "resource_groups") {
    return invalidName("resource_groups")(stateData, componentProps);
  } else if (field === "vpcs") {
    return (
      fieldsAreBad(["bucket", "resource_group"], stateData) ||
      invalidName("vpcs")("name", stateData, componentProps) ||
      invalidName("vpcs")(
        "default_network_acl_name",
        stateData,
        componentProps
      ) ||
      invalidName("vpcs")(
        "default_security_group_name",
        stateData,
        componentProps
      ) ||
      invalidName("vpcs")(
        "default_routing_table_name",
        stateData,
        componentProps
      )
    );
  } else if (field === "ssh_keys") {
    return (
      invalidName("ssh_keys")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      (stateData.use_data
        ? false // do not check invalid public key if using data, return false
        : invalidSshPublicKey(stateData, componentProps).invalid)
    );
  } else if (field === "transit_gateways") {
    return (
      invalidName("transit_gateways")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      isEmpty(stateData.connections) ||
      invalidCrnList(stateData.crns)
    );
  } else if (field === "acls") {
    return (
      !containsKeys(stateData, "resource_group") ||
      badField("resource_group", stateData) ||
      invalidName("acls")(stateData, componentProps)
    );
  } else if (field === "acl_rules") {
    return (
      invalidName("acl_rules")(stateData, componentProps) ||
      !isIpv4CidrOrAddress(stateData.source) ||
      !isIpv4CidrOrAddress(stateData.destination) ||
      invalidPort(stateData)
    );
  } else if (field === "sg_rules") {
    return (
      invalidSecurityGroupRuleName(stateData, componentProps) ||
      !isIpv4CidrOrAddress(stateData.source) ||
      invalidPort(stateData)
    );
  } else if (field === "vpn_gateways") {
    return (
      invalidName("vpn_gateways")(stateData, componentProps) ||
      fieldsAreBad(["resource_group", "vpc", "subnet"], stateData)
    );
  } else if (field === "subnetTier") {
    return (
      invalidSubnetTierName(stateData, componentProps) ||
      badField("networkAcl", stateData) ||
      (stateData.advanced === true && stateData.select_zones.length === 0)
    );
  } else if (field === "subnet") {
    if (stateData.tier && isIpv4CidrOrAddress(stateData.cidr || "") === false) {
      return true;
    } else if (stateData.tier) {
      let invalidCidrRange = Number(stateData.cidr.split("/")[1]) <= 12;
      return (
        invalidCidrRange ||
        stateData.cidr.indexOf("/") === -1 ||
        invalidName("subnet", craig)(stateData, componentProps) ||
        badField("network_acl", stateData)
      );
    } else return badField("network_acl", stateData);
  } else if (field === "iam_account_settings") {
    return (
      fieldsAreBad(
        [
          "mfa",
          "restrict_create_platform_apikey",
          "restrict_create_service_id",
          "max_sessions_per_identity",
        ],
        stateData
      ) || invalidIpCommaList(stateData.allowed_ip_addresses)
    );
  } else if (field === "security_groups") {
    return (
      invalidName("security_groups")(stateData, componentProps) ||
      fieldsAreBad(["resource_group", "vpc"], stateData)
    );
  } else if (field === "clusters") {
    if (stateData.kube_type === "openshift") {
      if (
        fieldsAreBad(["cos"], stateData) ||
        stateData.subnets.length * stateData.workers_per_subnet < 2
      )
        return true;
    }
    return (
      invalidName("clusters")(stateData, componentProps) ||
      fieldsAreBad(
        [
          "resource_group",
          "vpc",
          "subnets",
          "encryption_key",
          "flavor",
          "kube_version",
        ],
        stateData
      ) ||
      isEmpty(stateData.subnets)
    );
  } else if (field === "worker_pools") {
    return (
      invalidName("worker_pools")(stateData, componentProps) ||
      fieldsAreBad(["flavor"], stateData) ||
      !stateData.subnets ||
      isEmpty(stateData.subnets)
    );
  } else if (field === "event_streams") {
    if (stateData.plan !== "enterprise") {
      return (
        invalidName("event_streams")(stateData, componentProps) ||
        badField("resource_group", stateData)
      );
    } else {
      return (
        invalidName("event_streams")(stateData, componentProps) ||
        fieldsAreBad(
          ["resource_group", "endpoints", "throughput", "storage_size"],
          stateData
        ) ||
        invalidIpCommaList(stateData.private_ip_allowlist)
      );
    }
  } else if (field === "virtual_private_endpoints") {
    return (
      invalidName("virtual_private_endpoints")(stateData, componentProps) ||
      fieldsAreBad(
        ["resource_group", "security_groups", "service", "subnets", "vpc"],
        stateData
      ) ||
      anyAreEmpty(stateData.security_groups, stateData.subnets)
    );
  } else if (field === "vsi") {
    return (
      invalidName(field)(stateData, componentProps) ||
      fieldsAreBad(
        ["resource_group", "vpc", "image_name", "profile", "encryption_key"],
        stateData
      ) ||
      stateData.vsi_per_subnet > 10 ||
      stateData.vsi_per_subnet < 1 ||
      anyAreEmpty(
        stateData.security_groups,
        stateData.subnets,
        stateData.ssh_keys
      )
    );
  } else if (field === "f5_vsi_template") {
    let extraFields = {
      none: [],
      byol: ["byol_license_basekey"],
      regkeypool: ["license_username", "license_host", "license_pool"],
      utilitypool: [
        "license_username",
        "license_host",
        "license_pool",
        "license_unit_of_measure",
        "license_sku_keyword_1",
        "license_sku_keyword_2",
      ],
    };
    return (
      fieldsAreBad(
        ["template_version", "template_source"].concat(
          extraFields[stateData["license_type"]]
        ),
        stateData
      ) ||
      fieldCheck(
        [
          "do_declaration_url",
          "as3_declaration_url",
          "ts_declaration_url",
          "phone_home_url",
          "tgstandby_url",
          "tgrefresh_url",
          "tgactive_url",
        ],
        isValidUrl,
        stateData
      )
    );
  } else if (field === "f5_vsi") {
    return isEmpty(stateData?.ssh_keys || []);
  } else if (field === "routing_tables") {
    return (
      invalidName("routing_tables")(stateData, componentProps) ||
      fieldsAreBad(["vpc"], stateData)
    );
  } else if (field === "routes") {
    return (
      invalidName("routes")(stateData, componentProps) ||
      fieldsAreBad(["zone", "action", "next_hop", "destination"], stateData) ||
      !isIpv4CidrOrAddress(stateData.destination) ||
      !isIpv4CidrOrAddress(stateData.next_hop) ||
      contains(stateData.next_hop, "/")
    );
  } else if (field === "load_balancers") {
    return (
      invalidName("load_balancers")(stateData, componentProps) ||
      fieldsAreBad(
        [
          "resource_group",
          "type",
          "vpc",
          "security_groups",
          "deployment_vsi",
          "algorith",
          "pool_protocol",
          "pool_health_protocol",
          "listener_protocol",
          "listener_port",
          "health_retries",
          "health_timeout",
          "health_delay",
          "port",
        ],
        stateData
      ) ||
      areNotWholeNumbers(
        stateData.listener_port,
        stateData.health_retries,
        stateData.health_timeout,
        stateData.health_delay,
        stateData.port
      ) ||
      stateData.health_delay <= stateData.health_timeout ||
      (!isNullOrEmptyString(stateData.connection_limit) &&
        (!isWholeNumber(stateData.connection_limit) ||
          !isInRange(stateData.connection_limit, 1, 15000))) ||
      !haveValidRanges(
        [stateData.port, 1, 65535],
        [stateData.listener_port, 1, 65535],
        [stateData.health_timeout, 5, 3000],
        [stateData.health_delay, 5, 3000],
        [stateData.health_retries, 5, 3000]
      ) ||
      anyAreEmpty(stateData.target_vsi, stateData.security_groups)
    );
  } else if (field === "cbr_rules") {
    return (
      invalidName("cbr_rules")(stateData, componentProps) ||
      invalidFieldCheck(
        ["description", "api_type_id"],
        invalidCbrRule,
        stateData
      )
    );
  } else if (field === "contexts") {
    return (
      invalidName("contexts")(stateData, componentProps) ||
      invalidCbrRule("value", stateData, componentProps)
    );
  } else if (field === "resource_attributes") {
    return (
      invalidName("resource_attributes")(stateData, componentProps) ||
      invalidCbrRule("value", stateData, componentProps)
    );
  } else if (field === "tags") {
    return (
      invalidName("tags")(stateData, componentProps) ||
      invalidFieldCheck(["value", "operator"], invalidCbrRule, stateData)
    );
  } else if (field == "cbr_zones") {
    return (
      invalidName("cbr_zones")(stateData, componentProps) ||
      invalidFieldCheck(
        ["description", "account_id"],
        invalidCbrZone,
        stateData
      )
    );
  } else if (field === "addresses") {
    return (
      invalidName("addresses")(stateData, componentProps) ||
      invalidFieldCheck(
        [
          "account_id",
          "location",
          "service_name",
          "service_type",
          "service_instance",
          "value",
        ],
        invalidCbrZone,
        stateData
      )
    );
  } else if (field === "exclusions") {
    return (
      invalidName("exclusions")(stateData, componentProps) ||
      invalidFieldCheck(
        [
          "account_id",
          "location",
          "service_name",
          "service_type",
          "service_instance",
          "value",
        ],
        invalidCbrZone,
        stateData
      )
    );
  } else if (field === "vpn_servers") {
    return (
      invalidName("vpn_servers")(stateData, componentProps) ||
      fieldsAreBad(
        [
          "resource_group",
          "vpc",
          "security_groups",
          "certificate_crn",
          "method",
          "port",
          "client_ip_pool",
        ],
        stateData
      ) ||
      validPortRange("port_min", stateData.port) === false ||
      invalidCrnList(
        [stateData.certificate_crn].concat(
          stateData.method === "username" ? [] : stateData.client_ca_crn
        )
      ) ||
      invalidCidrBlock(stateData.client_ip_pool) ||
      (!isNullOrEmptyString(stateData.client_dns_server_ips) &&
        stateData.client_dns_server_ips.match(commaSeparatedIpListExp) ===
          null) ||
      isEmpty(stateData.subnets)
    );
  } else if (field === "vpn_server_routes") {
    return (
      invalidName("vpn_server_routes")(stateData, componentProps) ||
      invalidCidrBlock(stateData.destination)
    );
  } else if (field === "dns") {
    return (
      invalidName("dns")(stateData, componentProps) ||
      badField("resource_group", stateData)
    );
  } else if (field === "zones") {
    return (
      invalidDnsZoneName(stateData, componentProps) ||
      fieldsAreBad(["vpcs", "label"], stateData) ||
      isEmpty(stateData.vpcs) ||
      invalidDNSDescription(stateData, componentProps)
    );
  } else if (field === "records") {
    return (
      invalidName("records")(stateData, componentProps) ||
      fieldsAreBad(["type", "dns_zone", "rdata"], stateData) ||
      !validRecord(stateData, componentProps)
    );
  } else if (field === "custom_resolvers") {
    return (
      invalidName("custom_resolvers")(stateData, componentProps) ||
      badField("vpc", stateData) ||
      isEmpty(stateData.subnets) ||
      invalidDNSDescription(stateData, componentProps)
    );
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
  if (componentProps.innerFormProps.data.enable === false) {
    return false;
  }
  return disableSave(
    componentProps.submissionFieldName,
    componentProps.innerFormProps.data,
    componentProps.innerFormProps
  );
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
  invalidPort,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
};
