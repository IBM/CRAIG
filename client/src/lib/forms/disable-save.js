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
  anyAreEmpty,
  nullOrEmptyStringFields,
} = require("lazy-z");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidSubnetTierName,
  invalidSecurityGroupRuleName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  isValidUrl,
  invalidCbrRule,
  invalidCbrZone,
  validRecord,
  invalidDescription,
  invalidDnsZoneName,
  validSshKey,
  invalidEncryptionKeyEndpoint,
} = require("./invalid-callbacks");
const { hasDuplicateName } = require("./duplicate-name");

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
 * reduct unit test writing check for number input invalidation
 * @param {*} value
 * @param {*} minRange
 * @param {*} maxRange
 * @returns {boolean} true if any invalid number/range
 */
function invalidNumberCheck(value, minRange, maxRange) {
  let isInvalidNumber = false;
  if (!isNullOrEmptyString(value)) {
    if (!isWholeNumber(value) || !isInRange(value, minRange, maxRange)) {
      isInvalidNumber = true;
    }
  }
  return isInvalidNumber;
}

/**
 * check to see if scc form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if save should be disabled
 */
function disableSccSave(stateData) {
  return (
    !/^[A-z][a-zA-Z0-9-\._,\s]*$/i.test(stateData.collector_description) ||
    !/^[A-z][a-zA-Z0-9-\._,\s]*$/i.test(stateData.scope_description)
  );
}

/**
 * check to see if atracker form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if should be disabled
 */
function disableAtrackerSave(stateData) {
  return (
    stateData.enabled &&
    (nullOrEmptyStringFields(stateData, ["bucket", "cos_key"]) ||
      isEmpty(stateData.locations))
  );
}

/**
 * check to see if dynamic policies form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableDynamicPoliciesSave(stateData, componentProps) {
  return (
    invalidName("dynamic_policies")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, [
      "identity_provider",
      "expiration",
      "conditions",
    ]) ||
    invalidIdentityProviderURI(stateData, componentProps)
  );
}

/**
 * check to see if object storage form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableObjectStorageSave(stateData, componentProps) {
  return (
    invalidName("object_storage")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["kms", "resource_group"])
  );
}

/**
 * check to see if buckets form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableBucketsSave(stateData, componentProps) {
  return (
    invalidName("buckets")(stateData, componentProps) ||
    badField("kms_key", stateData)
  );
}

/**
 * check to see if encryption keys form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableEncryptionKeysSave(stateData, componentProps) {
  return (
    invalidName("encryption_keys")(stateData, componentProps) ||
    invalidEncryptionKeyRing(stateData) ||
    invalidEncryptionKeyEndpoint(stateData)
  );
}

/**
 * check to see if volumes form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableVolumesSave(stateData, componentProps) {
  return (
    invalidName("volume")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["encryption_key"]) ||
    (!isNullOrEmptyString(stateData.capacity) &&
      !isInRange(Number(stateData.capacity), 10, 16000))
  );
}

/**
 * check to see if key management form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableKeyManagementSave(stateData, componentProps) {
  return (
    invalidName("key_management")(stateData, componentProps) ||
    badField("resource_group", stateData)
  );
}

/**
 * check to see if secrets manager form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableSecretsManagerSave(stateData, componentProps) {
  return (
    invalidName("secrets_manager")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["encryption_key", "resource_group"])
  );
}

/**
 * check to see if vpcs form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableVpcsSave(stateData, componentProps) {
  return (
    nullOrEmptyStringFields(stateData, ["bucket", "resource_group"]) ||
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
    invalidName("vpcs")("default_routing_table_name", stateData, componentProps)
  );
}

/**
 * check to see if ssh keys form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableSshKeysSave(stateData, componentProps) {
  if (componentProps.arrayParentName) {
    return (
      invalidSshPublicKey(stateData, componentProps).invalid ||
      invalidName("power_vs_ssh_keys")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group)
    );
  } else
    return (
      invalidName("ssh_keys")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      (stateData.use_data
        ? false // do not check invalid public key if using data, return false
        : invalidSshPublicKey(stateData, componentProps).invalid)
    );
}

/**
 * check to see if ACLs form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableAclsSave(stateData, componentProps) {
  return (
    !containsKeys(stateData, "resource_group") ||
    badField("resource_group", stateData) ||
    invalidName("acls")(stateData, componentProps)
  );
}

/**
 * check to see if ACL rules form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableAclRulesSave(stateData, componentProps) {
  return (
    invalidName("acl_rules")(stateData, componentProps) ||
    !isIpv4CidrOrAddress(stateData.source) ||
    !isIpv4CidrOrAddress(stateData.destination) ||
    invalidPort(stateData)
  );
}

/**
 * check to see if sg rules form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableSgRulesSave(stateData, componentProps) {
  return (
    invalidSecurityGroupRuleName(stateData, componentProps) ||
    !isIpv4CidrOrAddress(stateData.source) ||
    invalidPort(stateData)
  );
}

/**
 * check to see if vpn gateways form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableVpnGatewaysSave(stateData, componentProps) {
  return (
    invalidName("vpn_gateways")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["resource_group", "vpc", "subnet"])
  );
}

/**
 * check to see if subnet tier form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableSubnetTierSave(stateData, componentProps) {
  return (
    invalidSubnetTierName(stateData, componentProps) ||
    badField("networkAcl", stateData) ||
    (stateData.advanced === true && stateData.select_zones.length === 0)
  );
}

/**
 * check to see if subnet form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @param {lazyZstate=} craig used for subnets, component props do not have craig
 * @returns {boolean} true if should be disabled
 */
function disableSubnetSave(stateData, componentProps, craig) {
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
}

/**
 * check to see if iam account settings form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if should be disabled
 */
function disableIamAccountSettingsSave(stateData) {
  return (
    nullOrEmptyStringFields(stateData, [
      "mfa",
      "restrict_create_platform_apikey",
      "restrict_create_service_id",
      "max_sessions_per_identity",
    ]) || invalidIpCommaList(stateData.allowed_ip_addresses)
  );
}

/**
 * check to see if security groups form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableSecurityGroupsSave(stateData, componentProps) {
  return (
    invalidName("security_groups")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["resource_group", "vpc"])
  );
}

/**
 * check to see if event streams form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableEventStreamsSave(stateData, componentProps) {
  if (stateData.plan !== "enterprise") {
    return (
      invalidName("event_streams")(stateData, componentProps) ||
      badField("resource_group", stateData)
    );
  } else {
    return (
      invalidName("event_streams")(stateData, componentProps) ||
      nullOrEmptyStringFields(stateData, [
        "resource_group",
        "endpoints",
        "throughput",
        "storage_size",
      ]) ||
      invalidIpCommaList(stateData.private_ip_allowlist)
    );
  }
}

/**
 * check to see if vpe form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableVpeSave(stateData, componentProps) {
  return (
    invalidName("virtual_private_endpoints")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, [
      "resource_group",
      "security_groups",
      "service",
      "subnets",
      "vpc",
    ]) ||
    anyAreEmpty(stateData.security_groups, stateData.subnets)
  );
}

/**
 * check to see if vsi form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableVsiSave(stateData, componentProps) {
  return (
    invalidName("vsi")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, [
      "resource_group",
      "vpc",
      "image_name",
      "profile",
      "encryption_key",
    ]) ||
    !isInRange(parseInt(stateData.vsi_per_subnet), 1, 10) ||
    anyAreEmpty(
      stateData.security_groups,
      stateData.subnets,
      stateData.ssh_keys
    )
  );
}

/**
 * check to see if f5 vsi template form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if should be disabled
 */
function disableF5VsiTemplateSave(stateData) {
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
    nullOrEmptyStringFields(
      stateData,
      ["template_version", "template_source"].concat(
        extraFields[stateData["license_type"]]
      )
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
}

/**
 * check to see if f5 vsi form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if should be disabled
 */
function disableF5VsiSave(stateData) {
  return isEmpty(stateData?.ssh_keys || []);
}

/**
 * check to see if routing tables form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableRoutingTablesSave(stateData, componentProps) {
  return (
    invalidName("routing_tables")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["vpc"])
  );
}

/**
 * check to see if routes form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableRoutesSave(stateData, componentProps) {
  return (
    invalidName("routes")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, [
      "zone",
      "action",
      "next_hop",
      "destination",
    ]) ||
    !isIpv4CidrOrAddress(stateData.destination) ||
    !isIpv4CidrOrAddress(stateData.next_hop) ||
    contains(stateData.next_hop, "/")
  );
}

/**
 * check to see if cbr rules form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableCbrRulesSave(stateData, componentProps) {
  return (
    invalidName("cbr_rules")(stateData, componentProps) ||
    invalidFieldCheck(["description", "api_type_id"], invalidCbrRule, stateData)
  );
}

/**
 * check to see if contexts form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableContextsSave(stateData, componentProps) {
  return (
    invalidName("contexts")(stateData, componentProps) ||
    invalidCbrRule("value", stateData, componentProps)
  );
}

/**
 * check to see if resource attributes form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableResourceAttributesSave(stateData, componentProps) {
  return (
    invalidName("resource_attributes")(stateData, componentProps) ||
    invalidCbrRule("value", stateData, componentProps)
  );
}

/**
 * check to see if tags form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableTagsSave(stateData, componentProps) {
  return (
    invalidName("tags")(stateData, componentProps) ||
    invalidFieldCheck(["value", "operator"], invalidCbrRule, stateData)
  );
}

/**
 * check to see if cbr zones form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableCbrZonesSave(stateData, componentProps) {
  return (
    invalidName("cbr_zones")(stateData, componentProps) ||
    invalidFieldCheck(["description", "account_id"], invalidCbrZone, stateData)
  );
}

/**
 * check to see if addresses form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableAddressesSave(stateData, componentProps) {
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
}

/**
 * check to see if exclusions form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableExclusionsSave(stateData, componentProps) {
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
}

/**
 * check to see if dns form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableDnsSave(stateData, componentProps) {
  return (
    invalidName("dns")(stateData, componentProps) ||
    badField("resource_group", stateData)
  );
}

/**
 * check to see if zones form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableZonesSave(stateData, componentProps) {
  return (
    invalidDnsZoneName(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["vpcs", "label"]) ||
    isEmpty(stateData.vpcs) ||
    invalidDescription(stateData.description, componentProps)
  );
}

/**
 * check to see if records form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableRecordsSave(stateData, componentProps) {
  return (
    invalidName("records")(stateData, componentProps) ||
    nullOrEmptyStringFields(stateData, ["type", "dns_zone", "rdata"]) ||
    !validRecord(stateData, componentProps)
  );
}

/**
 * check to see if custom resolvers form save should be disabled
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if should be disabled
 */
function disableCustomResolversSave(stateData, componentProps) {
  return (
    invalidName("custom_resolvers")(stateData, componentProps) ||
    badField("vpc", stateData) ||
    isEmpty(stateData.subnets) ||
    invalidDescription(stateData.description, componentProps)
  );
}

/**
 * check to see if logna form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if should be disabled
 */
function disableLogdnaSave(stateData) {
  return stateData.enabled === true
    ? nullOrEmptyStringFields(stateData, ["plan", "resource_group", "bucket"])
    : false;
}

/**
 * check to see if sysdig form save should be disabled
 * @param {Object} stateData
 * @returns {boolean} true if should be disabled
 */
function disableSysdigSave(stateData) {
  return stateData.enabled === false
    ? false
    : nullOrEmptyStringFields(stateData, ["resource_group", "plan"]);
}

/**
 * disable power vs workspace
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if disabled
 */
function disablePowerWorkspaceSave(stateData, componentProps) {
  return (
    invalidName("power")(stateData, componentProps) ||
    isEmpty(stateData.imageNames || [])
  );
}

/**
 * disable power vs network
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if disabled
 */
function disablePowerNetworkSave(stateData, componentProps) {
  return (
    hasDuplicateName("network", stateData, componentProps) ||
    invalidCidrBlock(stateData.pi_cidr) ||
    contains(stateData.pi_dns[0], "/") ||
    !isIpv4CidrOrAddress(stateData.pi_dns[0])
  );
}

/**
 * disable power vs cloud connection
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if disabled
 */
function disablePowerCloudConnectionSave(stateData, componentProps) {
  return (
    invalidName("cloud_connections")(stateData, componentProps) ||
    (stateData.pi_cloud_connection_transit_enabled &&
      isEmpty(stateData.transit_gateways))
  );
}

/**
 * disable power instance save
 * @param {*} stateData
 * @param {*} componentProps
 * @return {boolean} true if disabled
 */
function disablePowerInstanceSave(stateData, componentProps) {
  let hasInvalidIps = false;
  if (stateData.network) {
    stateData.network.forEach((nw) => {
      if (
        (!isNullOrEmptyString(nw.ip_address) &&
          !isIpv4CidrOrAddress(nw.ip_address)) ||
        contains(nw.ip_address, "/")
      )
        hasInvalidIps = true;
    });
  }

  /**
   *
   */
  function disableWhenStorageInvalid() {
    let shouldDisableBasedOnStorage = false;
    [
      "pi_affinity_volume",
      "pi_affinity_instance",
      "pi_anti_affinity_instance",
      "pi_anti_affinity_volume",
    ].forEach((item) => {
      if (!stateData[item]) stateData[item] = null;
    });
    if (stateData.storage_option === "Affinity") {
      shouldDisableBasedOnStorage =
        isNullOrEmptyString(stateData.pi_affinity_volume) &&
        isNullOrEmptyString(stateData.pi_affinity_instance);
    } else if (stateData.storage_option === "Anti-Affinity") {
      shouldDisableBasedOnStorage =
        isNullOrEmptyString(stateData.pi_anti_affinity_volume) &&
        isNullOrEmptyString(stateData.pi_anti_affinity_instance);
    }
    return shouldDisableBasedOnStorage;
  }

  return (
    invalidName("power_instances")(stateData, componentProps) ||
    invalidFieldCheck(
      [
        "workspace",
        "ssh_key",
        "image",
        "pi_sys_type",
        "pi_health_status",
        "pi_storage_tier",
      ],
      badField,
      stateData
    ) ||
    isEmpty(stateData.network) ||
    hasInvalidIps ||
    Number.isNaN(parseFloat(stateData.pi_processors)) ||
    Number.isNaN(parseFloat(stateData.pi_memory)) ||
    parseFloat(stateData.pi_processors) < 0.25 ||
    parseFloat(stateData.pi_processors) > 7 ||
    parseFloat(stateData.pi_memory) <= 0 ||
    (stateData.storage_option === "Storage Type" &&
      isNullOrEmptyString(stateData.pi_storage_type)) ||
    (stateData.storage_option === "Storage Pool" &&
      isNullOrEmptyString(stateData.pi_storage_pool)) ||
    disableWhenStorageInvalid()
  );
}

/**
 * disable save for power volumes
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean}
 */
function disablePowerVolumeSave(stateData, componentProps) {
  return (
    invalidName("power_volumes")(stateData, componentProps) ||
    badField("workspace", stateData) ||
    !isInRange(parseInt(stateData.pi_volume_size), 1, 2000)
  );
}

const disableSaveFunctions = {
  scc: disableSccSave,
  atracker: disableAtrackerSave,
  access_groups: invalidName("access_groups"),
  policies: invalidName("policies"),
  dynamic_policies: disableDynamicPoliciesSave,
  object_storage: disableObjectStorageSave,
  appid_key: invalidName("appid_key"),
  buckets: disableBucketsSave,
  cos_keys: invalidName("cos_keys"),
  encryption_keys: disableEncryptionKeysSave,
  volumes: disableVolumesSave,
  key_management: disableKeyManagementSave,
  secrets_manager: disableSecretsManagerSave,
  resource_groups: invalidName("resource_groups"),
  vpcs: disableVpcsSave,
  ssh_keys: disableSshKeysSave,
  acls: disableAclsSave,
  acl_rules: disableAclRulesSave,
  sg_rules: disableSgRulesSave,
  vpn_gateways: disableVpnGatewaysSave,
  subnetTier: disableSubnetTierSave,
  subnet: disableSubnetSave,
  iam_account_settings: disableIamAccountSettingsSave,
  security_groups: disableSecurityGroupsSave,
  event_streams: disableEventStreamsSave,
  virtual_private_endpoints: disableVpeSave,
  vsi: disableVsiSave,
  f5_vsi_template: disableF5VsiTemplateSave,
  f5_vsi: disableF5VsiSave,
  routing_tables: disableRoutingTablesSave,
  routes: disableRoutesSave,
  cbr_rules: disableCbrRulesSave,
  contexts: disableContextsSave,
  resource_attributes: disableResourceAttributesSave,
  tags: disableTagsSave,
  cbr_zones: disableCbrZonesSave,
  addresses: disableAddressesSave,
  exclusions: disableExclusionsSave,
  dns: disableDnsSave,
  zones: disableZonesSave,
  records: disableRecordsSave,
  custom_resolvers: disableCustomResolversSave,
  logdna: disableLogdnaSave,
  sysdig: disableSysdigSave,
  network: disablePowerNetworkSave,
  cloud_connections: disablePowerCloudConnectionSave,
  power: disablePowerWorkspaceSave,
  power_instances: disablePowerInstanceSave,
  power_volumes: disablePowerVolumeSave,
};

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
  ];
  if (containsKeys(disableSaveFunctions, field)) {
    return disableSaveFunctions[field](stateData, componentProps, craig);
  } else if (contains(stateDisableSaveComponents, field)) {
    return (
      field === "vpn_server_routes"
        ? componentProps.craig.vpn_servers.routes
        : contains(["worker_pools", "opaque_secrets"], field)
        ? componentProps.craig.clusters[field]
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
  invalidPort,
  forceShowForm,
  disableSshKeysSave,
  disableSshKeyDelete,
  disableEncryptionKeysSave,
  invalidCidrBlock,
  invalidNumberCheck,
};
