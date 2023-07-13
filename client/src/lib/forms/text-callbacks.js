const {
  isNullOrEmptyString,
  splatContains,
  isIpv4CidrOrAddress,
  transpose,
  kebabCase,
} = require("lazy-z");
const { hasDuplicateName } = require("./duplicate-name");
const {
  invalidNewResourceName,
  invalidSecurityGroupRuleName,
  hasOverlappingCidr,
  invalidCrns,
} = require("./invalid-callbacks");

/**
 * create helper text for resource group name
 * @param {Object} stateData
 * @param {boolean} stateData.use_prefix
 * @param {Object} componentProps
 * @param {Object} componentProps.craig
 * @param {Object} componentProps.craig.store
 * @param {Object} componentProps.craig.store.json
 * @param {Object} componentProps.craig.store.json._options
 * @param {string} componentProps.craig.store.json._options.prefix
 * @returns {string} composed resource group name
 */
function resourceGroupHelperTextCallback(stateData, componentProps) {
  return (
    (stateData.use_prefix
      ? componentProps.craig.store.json._options.prefix + "-"
      : "") + stateData.name
  );
}

/**
 * create generic name callback for most use cases
 * @return {string} invalid message
 */
function genericNameCallback() {
  return `Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s`;
}

/**
 * create generic callback for duplicate name
 * @param {string} name resource name
 * @returns {string} invalid message
 */
function duplicateNameCallback(name) {
  return `Name "${name}" already in use`;
}

/**
 * get invalid subnet tier text
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} invalid text
 */
function invalidSubnetTierText(stateData, componentProps) {
  if (
    splatContains(
      componentProps.craig.store.subnetTiers[componentProps.vpc_name],
      "name",
      stateData.name
    )
  )
    return duplicateNameCallback(stateData.name);
  else return genericNameCallback();
}

/**
 * get invalid sg rule text
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} invalid text
 */
function invalidSecurityGroupRuleText(stateData, componentProps) {
  if (
    invalidSecurityGroupRuleName(stateData, componentProps) &&
    !invalidNewResourceName(stateData.name)
  ) {
    return duplicateNameCallback(stateData.name);
  } else return genericNameCallback();
}

/**
 * create invalid text
 * @param {string} field json field name
 * @param {*=} craig used for subnet
 * @returns {Function} text should be invalid function
 */
function invalidNameText(field, craig) {
  /**
   * create invalid text for name
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @returns {string} invalid text
   */
  function nameText(stateData, componentProps, overrideField) {
    if (hasDuplicateName(field, stateData, componentProps, overrideField)) {
      return duplicateNameCallback(stateData[overrideField || "name"]);
    } else return genericNameCallback();
  }
  if (field === "vpcs") {
    /**
     * invalid vpc field check
     * @param {string} field name
     * @param {Object} stateData
     * @param {Object} componentProps
     */
    return function (field, stateData, componentProps) {
      if (field === "name") {
        return invalidNameText("vpc_name")(stateData, componentProps);
      } else if (isNullOrEmptyString(stateData[field])) {
        return "";
      } else if (field === "default_network_acl_name") {
        return invalidNameText("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidNameText("security_groups")(
          stateData,
          componentProps,
          field
        );
      } else {
        return invalidNameText("routing_tables")(
          stateData,
          componentProps,
          field
        );
      }
    };
  } else if (field === "subnet") {
    return function (stateData, componentProps) {
      let propsCopy = { craig: craig };
      transpose(componentProps, propsCopy);
      return invalidNameText("subnet_name")(stateData, propsCopy);
    };
  } else return nameText;
}

/**
 * get cos resource helper text
 * @param {*} stateData
 * @returns {string} composed helper text
 */
function cosResourceHelperTextCallback(stateData, componentProps) {
  return `${
    stateData.use_data
      ? ""
      : componentProps.craig.store.json._options.prefix + "-"
  }${stateData.name}${stateData.use_random_suffix ? "-<random-suffix>" : ""}`;
}

/**
 * get helper text for network acl
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {string} composed acl name
 */
function aclHelperTextCallback(stateData, componentProps) {
  return (
    componentProps.craig.store.json._options.prefix +
    "-" +
    componentProps.vpc_name +
    "-" +
    stateData.name +
    "-acl"
  );
}

/**
 * get helper text for cluster
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {string} composed acl name
 */
function clusterHelperTestCallback(stateData, componentProps) {
  return (
    componentProps.craig.store.json._options.prefix +
    "-" +
    stateData.name +
    "-cluster"
  );
}

/**
 * get invalid text for iam account setting
 * @param {string} field
 * @returns {string} invalid text
 */
function iamAccountSettingInvalidText(field) {
  return field === "max_sessions_per_identity"
    ? "Value must be in range [1-10]"
    : "Invalid";
}

/**
 * create access group policy helper text
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} helper text
 */
function accessGroupPolicyHelperTextCallback(stateData, componentProps) {
  return `${componentProps.craig.store.json._options.prefix}-${stateData.name}`;
}

/**
 * create invalid cidr text function
 * @param {*} craig
 * @returns {Function} stateData componentProps function
 */
function invalidCidrText(craig) {
  /**
   * get invalid cidr text
   * @param {*} stateData
   * @param {*} componentProps
   * @returns {string} invalid text string
   */
  return function (stateData, componentProps) {
    if (!stateData.cidr) {
      return "Invalid CIDR block";
    }
    let cidrRange = Number(stateData.cidr.split("/")[1]) > 17;
    if (componentProps.data.cidr === stateData.cidr && stateData.cidr) {
      // by checking if matching here prevent hasOverlappingCidr from running
      // to decrease load times
      return "";
    } else if (isIpv4CidrOrAddress(stateData.cidr) === false) {
      return "Invalid CIDR block";
    } else if (isIpv4CidrOrAddress(stateData.cidr) && cidrRange) {
      let invalidCidr = hasOverlappingCidr(craig)(stateData, componentProps);
      if (invalidCidr.invalid) {
        return `Warning: CIDR overlaps with ` + invalidCidr.cidr;
      } else return "";
    } else {
      return "CIDR ranges of /17 or less are not supported";
    }
  };
}

/**
 * @param {string} field field to get invalid text for
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {string} invalid text string
 */
function invalidCbrRuleText(field, stateData, componentProps) {
  if (field === "api_type_id") {
    return "Invalid api_type_id. Must match the regex expression /^[a-zA-Z0-9_.-:]+$/";
  } else if (field === "description") {
    return "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/";
  } else if (field === "value") {
    return "Invalid value. Must match the regex expression /^[Ss]+$/";
  } else if (field == "operator") {
    return "Invalid operator. Must match the regex expression /^[a-zA-Z0-9]+$/";
  } else {
    return "";
  }
}

/**
 * @param {string} field field to get invalid text for
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {string} invalid text string
 */
function invalidCbrZoneText(field, stateData, componentProps) {
  if (field === "description") {
    return "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/";
  } else {
    return "";
  }
}

/**
 * create text if project name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} invalid text string
 */
function invalidProjectNameText(stateData, componentProps) {
  let name = stateData.name;
  let invalidText = "";

  if (invalidNewResourceName(name)) {
    invalidText = genericNameCallback();
  } else {
    // check if dupe
    let kname = kebabCase(name);
    let isNew = componentProps.data?.last_save === undefined;
    let existingProject = componentProps.projects[kname];

    if (
      isNew &&
      existingProject &&
      existingProject.last_save !== stateData.last_save
    ) {
      invalidText = duplicateNameCallback(name);
    }
  }

  return invalidText;
}
/**
 * return dns description invalid text
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {string} invalid text
 */
function invalidDNSDescriptionText(stateData, componentProps) {
  return "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/.";
}

function invalidCrnText(stateData) {
  return invalidCrns(stateData)
    ? "Enter a valid comma separated list of CRNs"
    : "";
}

module.exports = {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  duplicateNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback,
  invalidSubnetTierText,
  iamAccountSettingInvalidText,
  invalidSecurityGroupRuleText,
  clusterHelperTestCallback,
  accessGroupPolicyHelperTextCallback,
  invalidCidrText,
  invalidCbrRuleText,
  invalidCbrZoneText,
  invalidProjectNameText,
  invalidDNSDescriptionText,
  invalidCrnText,
};
