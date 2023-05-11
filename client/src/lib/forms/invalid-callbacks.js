const {
  splat,
  getObjectFromArray,
  isNullOrEmptyString,
  contains,
  containsKeys,
  splatContains,
  isIpv4CidrOrAddress,
  transpose,
  isEmpty
} = require("lazy-z");
const {
  newResourceNameExp,
  sshKeyValidationExp,
  commaSeparatedIpListExp,
  urlValidationExp,
  crnRegex,
  projectDescriptionRegex,
  ipRangeExpression
} = require("../constants");
const { hasDuplicateName } = require("./duplicate-name");

/**
 * check to see if a resource has a valid name
 * @param {string} str name
 * @returns {boolean} true if name is invalid
 */
function invalidNewResourceName(str) {
  return str ? str.match(newResourceNameExp) === null : true;
}

/**
 * invalid tags
 * @param {Array<string>} tags
 * @returns {boolean} true if any tags in list are invalid
 */
function invalidTagList(tags) {
  if (tags.length === 0) return false;
  let invalid = false;
  tags.forEach(tag => {
    if (tag.match(newResourceNameExp) === null || tag.length > 128) {
      invalid = true;
    }
  });
  return invalid;
}

/**
 * create invalid bool for resource
 * @param {string} field json field name
 * @param {*} craig subnet craig data
 * @returns {Function} text should be invalid function
 */
function invalidName(field, craig) {
  /**
   * create invalid for resource
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @param {string=} overrideField field to override
   * @returns {string} invalid text
   */
  function nameCheck(stateData, componentProps, overrideField) {
    let stateField = overrideField || "name";
    if (containsKeys(stateData, "scope_description")) {
      // easiest way to get scc
      return (
        stateData[stateField] === "" ||
        invalidNewResourceName(stateData[stateField])
      );
    } else {
      return (
        hasDuplicateName(field, stateData, componentProps, overrideField) ||
        stateData[stateField] === "" ||
        (!stateData.use_data && invalidNewResourceName(stateData[stateField]))
      );
    }
  }

  if (field === "vpcs") {
    /**
     * invalid vpc field check
     * @param {string} field name
     * @param {Object} stateData
     * @param {Object} componentProps
     */
    return function(field, stateData, componentProps) {
      if (field === "name") {
        return invalidName("vpc_name")(stateData, componentProps);
      } else if (isNullOrEmptyString(stateData[field])) {
        return false;
      } else if (field === "default_network_acl_name") {
        return invalidName("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidName("security_groups")(stateData, componentProps, field);
      } else {
        return invalidName("routing_tables")(stateData, componentProps, field);
      }
    };
  } else if (field === "subnet") {
    return function(stateData, componentProps) {
      let propsCopy = { craig: craig };
      transpose(componentProps, propsCopy);
      return invalidName("subnet_name")(stateData, propsCopy);
    };
  } else return nameCheck;
}

/**
 * invalid encryption key ring name
 * @param {Object} stateData
 * @param {string} stateData.key_ring
 * @return {boolean} true if invalid
 */
function invalidEncryptionKeyRing(stateData) {
  return (
    stateData.key_ring !== "" && invalidNewResourceName(stateData.key_ring)
  );
}

/**
 * validate sshKey
 * @param {string} str
 * @returns {boolean} true if it is a valid sshKey
 */
function validSshKey(str) {
  if (str === null) {
    return false;
  } else {
    return str.match(sshKeyValidationExp) !== null;
  }
}

/**
 * check if ssh key is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Object} invalid boolean invalidText string
 */
function invalidSshPublicKey(stateData, componentProps) {
  let invalid = {
    invalid: false,
    invalidText:
      "Provide a unique SSH public key that does not exist in the IBM Cloud account in your region"
  };
  if (!validSshKey(stateData.public_key)) {
    invalid.invalid = true;
  } else if (
    // if public key already used
    contains(
      splat(componentProps.craig.store.json.ssh_keys, "public_key"),
      stateData.public_key
    )
  ) {
    let key = getObjectFromArray(
      componentProps.craig.store.json.ssh_keys,
      "public_key",
      stateData.public_key
    );
    if (componentProps.data.name === key.name) {
      return invalid; // This is the current key, escape
    } else {
      // duplicate key
      invalid.invalid = true;
      invalid.invalidText = "SSH Public Key in use";
    }
  }
  return invalid;
}

/**
 * check if subnet tier name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidSubnetTierName(stateData, componentProps) {
  return (
    (splatContains(
      componentProps.craig.store.subnetTiers[componentProps.vpc_name],
      "name",
      stateData.name
    ) &&
      stateData.name !== componentProps.data.name) ||
    invalidNewResourceName(stateData.name)
  );
}

/**
 * check if iam account setting is invalid
 * @param {string} field
 * @param {Object} stateData
 * @returns {boolean} true if invalid
 */
function invalidIamAccountSettings(field, stateData) {
  return (
    field === "max_sessions_per_identity" &&
    (stateData.max_sessions_per_identity < 1 ||
      stateData.max_sessions_per_identity > 10)
  );
}

function invalidF5Vsi(field, stateData, componentProps) {
  let hasOwnValidation = ["tmos_admin_password"];
  let optionalFields = [
    "app_id",
    "license_password",
    "license_unit_of_measure"
  ];
  if (
    field.includes("url") || // all url fields have their own validation
    contains(hasOwnValidation, field) ||
    contains(optionalFields, field)
  ) {
    return false; // ignore these, have their own validation
  } else {
    return isNullOrEmptyString(stateData[field]); // just cannot be empty
  }
}

/**
 * check if security group rule name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidSecurityGroupRuleName(stateData, componentProps) {
  let duplicateRuleName = false;
  let ruleRef = componentProps.isModal
    ? componentProps.rules
    : componentProps.innerFormProps.rules;
  if (stateData.name !== componentProps.data.name) {
    duplicateRuleName = splatContains(ruleRef, "name", stateData.name);
  }
  return duplicateRuleName || invalidNewResourceName(stateData.name);
}

/**
 * make ip from 32 bit number
 * @param {int} num 32 bit number
 * @returns {string} ip address string
 */
function makeIP(num) {
  return [
    // for each number (octet) between the "." (16 bits) shift (>>) to the correct position for big-endian
    // then do bitwise and (&) to ensure unsigned value since 0xFF is 255 or max value for octet
    (num >> 24) & 0xff,
    (num >> 16) & 0xff,
    (num >> 8) & 0xff,
    num & 0xff
  ].join(".");
}

/**
 * get 32 bit unsigned int of ip address and the mask in hex for both blocks then get first and last address
 * @param {string} cidr cidr block string
 * @returns {object} first and last address of given cidr block in hex
 */
function getFirstLastAddress(cidr) {
  // split address from cidr prefix and get 32 bit unsigned int of ip
  var mCidr = cidr.match(/\d+/g);
  var block32 = mCidr.slice(0, 4).reduce(function(a, o) {
    return ((+a << 8) >>> 0) + +o;
  });
  // calculate mask from cidr prefix
  var mask = (~0 << (32 - +mCidr[4])) >>> 0;
  // get first and last address from int representation and mask bit manipulation
  var firstAddress = (block32 & mask) >>> 0;
  var lastAddress = (block32 | ~mask) >>> 0;
  return { firstAddress, lastAddress };
}

/**
 * generate all ips from first to last and store in array for cidr block
 * @param {string} firstHex first address in hex format
 * @param {string} lastHex last address in hex format
 * @returns {Array<string>} array of all ips in a cidr block range
 */
function generateIpRange(firstHex, lastHex) {
  var ips = [];
  for (let i = firstHex; i <= lastHex; i++) {
    ips.push(makeIP(i));
  }
  return ips;
}

/**

/**
 * check to see if two IPV4 CIDR blocks contain overlapping addresses
 * @param {string} cidrA cidr block
 * @param {string} cidrB cidr block
 * @returns {boolean} true if two CIDR blocks contain one or more of the same addresses, false otherwise
 */
function cidrBlocksOverlap(cidrA, cidrB) {
  if (cidrA === cidrB) {
    return true;
  }

  // split cidr to get prefixes
  cidrATokens = cidrA.split("/");
  cidrBTokens = cidrB.split("/");

  // find smaller cidr block (bigger prefix means smaller range)
  if (cidrATokens[1] < cidrBTokens[1]) {
    var smallerBlock = cidrB;
    var largerBlock = cidrA;
  } else {
    var smallerBlock = cidrA;
    var largerBlock = cidrB;
  }

  // get first and last address in hex
  var smallCidr = getFirstLastAddress(smallerBlock);
  var bigCidr = getFirstLastAddress(largerBlock);

  // generate all ips from first to last and store in array for cidr blocks
  var smallerIps = generateIpRange(
    smallCidr.firstAddress,
    smallCidr.lastAddress
  );
  var biggerIps = generateIpRange(bigCidr.firstAddress, bigCidr.lastAddress);

  // loop through all ips and check if they are in the larger cidr block
  for (let i = 0; i < smallerIps.length; i++) {
    if (contains(biggerIps, smallerIps[i])) {
      return true;
    }
  }
  return false;
}

/**
 * check if string of comma separated ips is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidIpCommaList(ipList) {
  if (isNullOrEmptyString(ipList)) {
    return false;
  } else return ipList.match(commaSeparatedIpListExp) === null;
}

function invalidIdentityProviderURI(stateData, componentProps) {
  return !(stateData.identity_provider.length >= 6);
}

/**
 * url value is valid and not empty
 * @param {str} url
 * @returns {boolean} true when url is valid (ie, null, "null", or a valid url), otherwise false
 */
function isValidUrl(url) {
  if (isNullOrEmptyString(url) || url === "null") return true;
  return url.match(urlValidationExp) !== null;
}

/**
 * check to see if a subnet has overlapping cidr within deployment
 * @param {*} craig
 * @returns {Function} statedata component props function
 */
function hasOverlappingCidr(craig) {
  /**
   * check to see if a subnet has overlapping cidr within deployment
   * @param {*} stateData
   * @param {*} componentProps
   * @returns {boolean} true if overlapping
   */
  return function(stateData, componentProps) {
    let allCidrs = [];
    let cidrData = {
      invalid: false,
      cidr: stateData.cidr
    };
    craig.store.json.vpcs.forEach(vpc => {
      vpc.subnets.forEach(subnet => {
        if (subnet.name !== componentProps.data.name)
          allCidrs.push(subnet.cidr);
      });
    });
    if (contains(allCidrs, stateData.cidr)) {
      cidrData.invalid = true;
    } else {
      allCidrs.forEach(cidr => {
        if (!cidrData.invalid) {
          cidrData.invalid = cidrBlocksOverlap(cidr, stateData.cidr);
          if (cidrData.invalid) {
            cidrData.cidr = cidr;
          }
        }
      });
    }
    return cidrData;
  };
}

/**
 * check to see if a subnet has overlapping cidr within deployment
 * @param {*} craig
 * @returns {Function} statedata component props function
 */
function invalidCidr(craig) {
  /**
   * check to see if a subnet has overlapping cidr within deployment
   * @param {*} stateData
   * @param {*} componentProps
   * @returns {boolean} true if overlapping
   */
  return function(stateData, componentProps) {
    if (!stateData.cidr) return true;
    let cidrRange = Number(stateData.cidr.split("/")[1]) > 17;
    if (componentProps.data.cidr === stateData.cidr && stateData.cidr) {
      // by checking if matching here prevent hasOverlappingCidr from running
      // to decrease load times
      return false;
    }
    if (isIpv4CidrOrAddress(stateData.cidr) && cidrRange) {
      return hasOverlappingCidr(craig)(stateData, componentProps).invalid;
    } else if (cidrRange <= 17 && isIpv4CidrOrAddress(stateData.cidr)) {
      return true;
    } else return isIpv4CidrOrAddress(stateData.cidr) === false;
  };
}

/*
 * test if list of crns is valid
 * @param {Array} crnList list of crns
 * @returns true if list of crns is valid
 */
function invalidCrnList(crnList) {
  if (crnList === undefined || isEmpty(crnList)) {
    return false;
  }
  let isInvalid = false;
  crnList.forEach(crn => {
    if (crn.match(crnRegex) === null) {
      isInvalid = true;
    }
  });

  return isInvalid;
}

/**
 * check if project description is invalid
 * @param {string} description project description
 * @returns {boolean} true if invalid
 */
function invalidProjectDescription(description) {
  return (
    description.length > 99 ||
    description.match(projectDescriptionRegex) === null
  );
}

/**
 * @param {string} field field to check invalid
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if invalid
 */
function invalidCbrRule(field, stateData, componentProps) {
  if (field === "api_type_id")
    return (
      isNullOrEmptyString(stateData.api_type_id) ||
      stateData.api_type_id.match(/^[a-zA-Z0-9_.\-:]+$/) === null
    );
  else if (field === "description") {
    return (
      stateData.description.length > 300 ||
      stateData.description.match(/^[\x20-\xFE]*$/) === null
    );
  } else if (field === "value") {
    return stateData.value.match(/^[\S\s]+$/) === null;
  } else if (field === "operator") {
    return (
      !isNullOrEmptyString(stateData.operator) &&
      stateData.operator.match(/^[a-zA-Z0-9]+$/) === null
    );
  } else {
    return isNullOrEmptyString(stateData[field]); // dropdown should have a selection
  }
}

/**
 * @param {string} field field to check invalid
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if invalid
 */
function invalidCbrZone(field, stateData, componentProps) {
  if (field === "description") {
    return (
      stateData.description.length > 300 ||
      stateData.description.match(/^[\x20-\xFE]*$/) === null
    );
  } else if (field === "value") {
    if (stateData.type === "ipAddress")
      return (
        !isIpv4CidrOrAddress(stateData.value) || stateData.value.includes("/")
      );
    else if (stateData.type === "ipRange")
      return stateData.value.match(ipRangeExpression) === null;
    else return stateData.value.match(/^[0-9a-z\-]+$/) === null;
  } else {
    return (
      !isNullOrEmptyString(stateData[field]) &&
      stateData[field].match(/^[0-9a-z\-]+$/) === null
    );
  }
}

module.exports = {
  invalidName,
  invalidNewResourceName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidTagList,
  invalidCrnList,
  validSshKey,
  invalidSubnetTierName,
  invalidIamAccountSettings,
  invalidSecurityGroupRuleName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  invalidF5Vsi,
  isValidUrl,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidCbrRule,
  invalidCbrZone,
  invalidProjectDescription
};
