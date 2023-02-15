const { eachKey, isString } = require("lazy-z");
const { jsonToTf, tfRef, stringifyTranspose } = require("./utils");

/**
 * format iam account settings terraform
 * @param {Object} iamSettings
 * @param {boolean} iamSettings.enable
 * @returns {string} terraform formatted code
 */
function formatIamAccountSettings(iamSettings) {
  let iamValues = stringifyTranspose(iamSettings);
  if (iamSettings.enable) {
    delete iamValues.enable;
    return jsonToTf(
      "ibm_iam_account_settings",
      "iam_account_settings",
      iamValues
    );
  } else return "";
}

/**
 * create access group terraform
 * @param {Object} group
 * @param {string} group.name
 * @param {Object} config
 * @param {string} terraform string
 */
function formatAccessGroup(group, config) {
  return jsonToTf(
    "ibm_iam_access_group",
    `${group.name}_access_group`,
    {
      name: `"${group.name}"`,
      description: `"${group.description}"`,
      tags: true
    },
    config
  );
}

/**
 * format access group policy
 * @param {Object} policy
 * @param {string} policy.name
 * @param {string} policy.group
 * @param {Array<string>} policy.roles
 * @param {Object=} policy.resources
 * @param {Object=} policy.resources.attributes
 * @param {Array<Object>=} policy.resource_attributes
 * @param {Array<Object>=} policy.resource_tags
 * @returns {string} terraform string
 */
function formatAccessGroupPolicy(policy) {
  let policyValues = {
    access_group_id: tfRef(
      "ibm_iam_access_group",
      policy.group + "access group"
    ),
    roles: JSON.stringify(policy.roles)
  };
  if (policy.resources) {
    policyValues._resources = stringifyTranspose(policy.resources);
    if (policy.resources.attributes) {
      policyValues._resources["_attributes ="] = stringifyTranspose(
        policy.resources.attributes
      );
    }
  }
  if (policy.resource_attributes) {
    policyValues["-resource_attributes"] = [];
    policy.resource_attributes.forEach(attr => {
      policyValues["-resource_attributes"].push(stringifyTranspose(attr));
    });
  }
  if (policy.resource_tags) {
    policyValues["-resource_tags"] = [];
    policy.resource_tags.forEach(attr => {
      policyValues["-resource_tags"].push(stringifyTranspose(attr));
    });
  }
  return jsonToTf(
    "ibm_iam_access_group_policy",
    `${policy.group} ${policy.name} policy`,
    policyValues
  );
}

module.exports = {
  formatIamAccountSettings,
  formatAccessGroup,
  formatAccessGroupPolicy
};
