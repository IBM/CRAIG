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
    } else if (
      field === "classic_vlans" &&
      stateData.name &&
      stateData.name.length +
        1 +
        componentProps.craig.store.json._options.prefix.length >
        20
    ) {
      return "Classic VLAN names must be 20 or fewer characters including the environment prefix";
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
    let cidrField = stateData.cidr ? "cidr" : "pi_cidr";
    if (!stateData[cidrField]) {
      return "Invalid CIDR block";
    }
    let cidrRange = Number(stateData[cidrField].split("/")[1]) > 17;
    if (
      componentProps.data &&
      componentProps.data[cidrField] === stateData[cidrField] &&
      stateData[cidrField]
    ) {
      // by checking if matching here prevent hasOverlappingCidr from running
      // to decrease load times
      return "";
    } else if (isIpv4CidrOrAddress(stateData[cidrField]) === false) {
      return "Invalid CIDR block";
    } else if (isIpv4CidrOrAddress(stateData[cidrField]) && cidrRange) {
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

function invalidCrnText(stateData) {
  return invalidCrns(stateData)
    ? "Enter a valid comma separated list of CRNs"
    : "";
}

module.exports = {
  genericNameCallback,
  duplicateNameCallback,
  invalidNameText,
  invalidSubnetTierText,
  invalidSecurityGroupRuleText,
  invalidCidrText,
  invalidProjectNameText,
  invalidCrnText,
};
