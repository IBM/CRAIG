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
  splat
} = require("lazy-z");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidSubnetTierName,
  invalidSecurityGroupRuleName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  isValidUrl
} = require("./invalid-callbacks");

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
  fields.forEach(field => {
    if (badField(field, stateData)) {
      hasBadFields = true;
    }
  });
  return hasBadFields;
}

/**
 * check multiple fields against the same regex expression
 * @param {Array} fields list of fields
 * @param {Function} check test fields with this
 * @param {Object} stateData
 * @returns
 */
function fieldCheck(fields, check, stateData) {
  let hasBadFields = false;
  fields.forEach(field => {
    if (!check(stateData[field])) {
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
    ).forEach(type => {
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
 * @returns {boolean} true if match
 */

function disableSave(field, stateData, componentProps) {
  if (field === "scc") {
    return (
      !/^[A-z][a-zA-Z0-9-\._,\s]*$/i.test(stateData.collector_description) ||
      !/^[A-z][a-zA-Z0-9-\._,\s]*$/i.test(stateData.scope_description)
    );
  } else if (field === "atracker") {
    return (
      fieldsAreBad(["bucket", "cos_key"], stateData) ||
      isEmpty(stateData.locations)
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
      isEmpty(stateData.connections)
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
      badField("networkAcl", stateData)
    );
  } else if (field === "subnet") {
    return badField("network_acl", stateData);
  } else if (field === "iam_account_settings") {
    return (
      fieldsAreBad(
        [
          "mfa",
          "restrict_create_platform_apikey",
          "restrict_create_service_id",
          "max_sessions_per_identity"
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
          "kube_version"
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
      isEmpty(stateData.security_groups) ||
      isEmpty(stateData.subnets)
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
      isEmpty(stateData.security_groups) ||
      isEmpty(stateData.subnets) ||
      isEmpty(stateData.ssh_keys)
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
        "license_sku_keyword_2"
      ]
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
          "tgactive_url"
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
      !isIpv4CidrOrAddress(stateData.next_hop)
    );
  } else return false;
}

/**
 * show non toggle array form
 * depending on the submission field name the code looks determines if the form should be open based on the data passed by componentProps
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should show
 */
function forceShowForm(stateData, componentProps) {
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
  ["vsi", "teleport_vsi", "f5_vsi"].forEach(vsi => {
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
  disableSshKeyDelete
};
