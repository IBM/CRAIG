const {
  getObjectFromArray,
  snakeCase,
  titleCase,
  kebabCase,
  eachKey,
  isString,
  parseIntFromZone,
} = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");
const { endComment } = require("./constants");
const constants = require("./constants");
const jsonToTf = require("json-to-tf");
/**
 * get a resource group id using name
 * @param {string} groupName name of resource group
 * @param {object} config json data template
 * @param {Array<object>} config.resource_groups
 * @returns {string} composed resource group
 */
function rgIdRef(groupName, config) {
  if (groupName === null) {
    return "ERROR: Unfound Ref";
  }
  let rg = getObjectFromArray(config.resource_groups, "name", groupName);
  let rgId = `ibm_resource_group.${snakeCase(groupName)}.id`;
  if (rg.use_data) {
    rgId = "data." + rgId;
  }
  return rgId;
}

/**
 * get string for tag value
 * @param {Object} config
 * @param {Object} config._options
 * @param {Array<string>} config._options.tags
 * @returns {string} stringified tags
 */
function getTags(config) {
  return JSON.stringify(config._options.tags);
}

/**
 * get id for cos instance
 * @param {Object} cos
 * @param {boolean} cos.use_data
 * @param {string} cos.name
 * @returns {string} composed cos id
 */
function getCosId(cos) {
  return `${cos.use_data ? "data." : ""}ibm_resource_instance.${snakeCase(
    cos.name
  )}_object_storage.id`;
}

/**
 * create a header for terraform
 * @param {string} name name of resource block
 * @returns {string} title comment block
 */
function buildTitleComment(name) {
  return (
    constants.titleComment
      .replace("TITLE", titleCase(name))
      .replace(
        new RegexButWithWords()
          .literal("F")
          .whitespace()
          .literal("5")
          .done("g"),
        "F5"
      )
      .replace(/And/i, "and")
      .replace(/Iam/g, "IAM")
      .replace(/Vpe/g, "VPE")
      .replace(/Ssh(?=\s)/g, "SSH")
      .replace(/Vpc(?=\s)/g, "VPC")
      .replace(/Vsi(?=\s)/g, "VSI")
      .replace(/Vpn(?=\s)/g, "VPN") + "\n"
  );
}

/**
 * get kms instance data
 * @param {string} kmsName instance to look up
 * @param {Object} config config object
 * @param {Array<Object>} config.key_management
 * @returns {{name: string, guid: string}} kms references
 */
function getKmsInstanceData(kmsName, config) {
  let kmsInstance = getObjectFromArray(config.key_management, "name", kmsName);
  let baseName = `${
    kmsInstance.use_data ? "data." : ""
  }ibm_resource_instance.${snakeCase(kmsInstance.name)}.`;
  return {
    name: baseName + "name",
    guid: baseName + "guid",
    type: kmsInstance.use_hs_crypto ? "hs-crypto" : "kms"
  };
}

/**
 * format vpc id
 * @param {string} vpcName
 * @param {string=} value value to get defaults to id
 * @returns {string} formatted id
 */
function vpcRef(vpcName, value) {
  return `ibm_is_vpc.${snakeCase(vpcName)}_vpc.${value || "id"}`;
}

/**
 * create name in kebab case
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {Array<string>} segments array of substrings
 * @param {string=} addText additional text
 * @returns {string} kebab-case-name
 */
function kebabName(config, segments, addText) {
  return (
    '"' +
    kebabCase(config._options.prefix + "-" + segments.join("-")) +
    (addText || "") +
    '"'
  );
}

/**
 * get data prefix for resources
 * @param {boolean} useData
 * @returns {string} prefix for data
 */
function useData(useData) {
  return useData ? "data." : "";
}

/**
 * create terraform reference
 * @param {string} type type of resource ex `ibm_resource_instance`
 * @param {string} name name of resource ex `slz-management-rg`
 * @param {string=} value value to get from reference ex `guid`. defaults to `id`
 * @param {boolean=} useData is data reference
 * @returns {string} terraform formatted reference
 */
function tfRef(type, name, value, data) {
  return `${useData(data)}${type}.${snakeCase(name)}.${value || "id"}`;
}

/**
 * create terraform array reference
 * @param {string} type type of resource ex `ibm_resource_instance`
 * @param {string} name name of resource ex `slz-management-rg`
 * @param {string=} value value to get from reference ex `guid`. defaults to `id`
 * @param {boolean=} useData is data reference
 * @returns {string} terraform formatted reference
 */
function tfArrRef(type, name, value, data) {
  return `[${useData(data)}${type}.${snakeCase(name)}.${value || "id"}]`;
}

/**
 * shortcut for references to `ibm_resource_instance`
 * @param {string} name name of resource ex `slz-management-rg`
 * @param {string=} value value to get from reference ex `id`
 * @param {boolean=} useData is data reference
 * @returns {string}
 */
function resourceRef(name, value, data) {
  return tfRef("ibm_resource_instance", name, value, data);
}

/**
 * shortcut for references to object storage `ibm_resource_instance`
 * @param {string} name name of resource ex `slz-management-rg`
 * @param {string=} value value to get from reference ex `id`
 * @param {boolean=} useData is data reference
 * @returns {string}
 */
function cosRef(name, value, data) {
  return resourceRef(name + " object storage", value, data);
}

/**
 * shortcut for references to object storage bucket
 * @param {string} cos name of resource ex `slz-management-rg`
 * @param {string} bucket name of bucket
 * @param {string=} value value to get from reference ex `id` defaults to `bucket_name`
 * @param {boolean=} useData is data reference
 * @returns {string}
 */
function bucketRef(cos, bucket, value, data) {
  if (!cos || !bucket) return `ERROR: Unfound ref`;
  return tfRef(
    "ibm_cos_bucket",
    cos + " object storage " + bucket + " bucket",
    value || "bucket_name",
    data
  );
}

/**
 * shortcut for references to `ibm_is_subnet`
 * @param {string} subnet name of resource ex `slz-management-rg`
 * @param {string} vpc vpc name
 * @param {string=} value value to get from reference ex `guid`. defaults to `id`
 * @param {boolean=} useData is data reference
 * @returns {string}
 */
function subnetRef(vpc, subnet, value, data) {
  return tfRef("ibm_is_subnet", `${vpc} ${subnet}`, value, data);
}

/**
 * shortcut for references to `ibm_kms_key`
 * @param {string} key name of resource ex `slz-management-rg`
 * @param {string} kms vpc name
 * @param {string=} value get value, defaults to `key_id`
 * @returns {string}
 */
function encryptionKeyRef(kms, key, value) {
  return tfRef("ibm_kms_key", `${kms} ${key} key`, value || "key_id");
}

/**
 * fill template with values
 * @param {string} template string template
 * @param {Object} values key value pais of objects
 * @param {Object} config
 * @returns {string} formatted values
 */
function fillTemplate(template, values) {
  let newValues = template;
  eachKey(values, key => {
    newValues = newValues.replace(
      new RegExp(`\\$${key.toUpperCase()}`, "g"),
      values[key]
    );
  });
  return newValues;
}

/**
 * get subnet zone number from name
 * @param {string} subnet
 * @returns {number} 1, 2, or 3
 */
function subnetZone(subnet) {
  return parseIntFromZone(subnet);
}

/**
 * get composed zone
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {number} zone
 * @returns {string} composed zone
 */
function composedZone(config, zone) {
  return `"${config._options.region}-${zone}"`;
}

/**
 * json to tf
 * @param {string} type resource type
 * @param {string} name resource name
 * @param {Object} values arbitrary key value pairs
 * @param {Object} config config
 * @param {boolean} useData use data
 * @returns {string} terraform formatted code
 */

function jsonToIac(type, name, values, config, useData) {
  return (
    "\n" +
    jsonToTf(type, name, values, useData).replace(
      /\$region/g,
      config?._options ? `"${config._options.region}"` : ""
    )
  );
}

function tfBlock(title, blockData) {
  return buildTitleComment(title) + blockData + endComment + "\n";
}

/**
 * replace trailing newline
 * @param {string} tf terraform sta
 * @returns {string} terraform data with additional newlines removed
 */
function tfDone(tf) {
  return tf.replace(/\n\n$/g, "\n");
}

/**
 * return name for resource that can be imported from data
 * @param {Object} resource
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} appendText text to add
 * @returns {string} data resource name
 */
function dataResourceName(resource, config, appendText) {
  return `"${resource.use_data ? "" : config._options.prefix + "-"}${
    resource.name
  }${appendText ? appendText : ""}"`;
}

/**
 * transpose an object where each string value has quotes around it
 * @param {Object} source
 * @returns {Object}
 */
function stringifyTranspose(source) {
  let newObj = {};
  eachKey(source, key => {
    if (isString(source[key])) newObj[key] = `"${source[key]}"`;
    else if (typeof source[key] !== "object") newObj[key] = source[key];
  });
  return newObj;
}

module.exports = {
  stringifyTranspose,
  dataResourceName,
  jsonToIac,
  composedZone,
  subnetZone,
  fillTemplate,
  tfRef,
  resourceRef,
  rgIdRef,
  getTags,
  getCosId,
  buildTitleComment,
  getKmsInstanceData,
  vpcRef,
  kebabName,
  useData,
  subnetRef,
  cosRef,
  encryptionKeyRef,
  bucketRef,
  tfArrRef,
  tfBlock,
  tfDone
};
