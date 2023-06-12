const { kebabCase } = require("lazy-z");
const {
  tfRef,
  kebabName,
  tfBlock,
  getTags,
  jsonToTfPrint,
} = require("./utils");
const { varDotRegion } = require("../constants");

/**
 * format iam account settings terraform
 * @param {Object} iamSettings
 * @param {boolean} iamSettings.enable
 * @returns {object} terraform formatted code
 */

function ibmIamAccountSettings(iamSettings) {
  let iamSettingsCopy = Object.assign({}, iamSettings); // need a copy of iamSettings before deleting,
  delete iamSettingsCopy.enable; // otherwise unable to see iam code as enable is deleted
  return {
    name: "iam_account_settings",
    data: iamSettingsCopy, // pass iamSettings without enable key
  };
}

/**
 * format iam account settings terraform
 * @param {Object} iamSettings
 * @param {boolean} iamSettings.enable
 * @returns {string} terraform formatted code
 */
function formatIamAccountSettings(iamSettings) {
  if (iamSettings.enable) {
    return jsonToTfPrint(
      "resource",
      "ibm_iam_account_settings",
      "iam_account_settings",
      ibmIamAccountSettings(iamSettings).data
    );
  } else return "";
}

/**
 * create access group terraform
 * @param {Object} group
 * @param {string} group.name
 * @param {Object} config
 * @returns {object} terraform string
 */

function ibmIamAccessGroup(group, config) {
  return {
    name: `${group.name}_access_group`,
    data: {
      name: kebabName([group.name, "ag"]),
      description: group.description,
      tags: getTags(config),
    },
  };
}

/**
 * create access group terraform
 * @param {Object} group
 * @param {string} group.name
 * @param {Object} config
 * @returns {string} terraform string
 */
function formatAccessGroup(group, config) {
  return jsonToTfPrint(
    "resource",
    "ibm_iam_access_group",
    `${group.name}_access_group`,
    ibmIamAccessGroup(group, config).data
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
 * @returns {object} terraform
 */
function ibmIamAccessGroupPolicy(policy) {
  let policyValues = {
    access_group_id: tfRef(
      "ibm_iam_access_group",
      policy.group + " access group"
    ),
    roles: policy.roles,
  };
  if (policy.resources) {
    policyValues.resources = [policy.resources];
    if (policyValues.resources[0].region) {
      policyValues.resources[0].region = varDotRegion;
    }
  }
  if (policy.resource_attributes) {
    policyValues.resource_attributes = [policy.resource_attributes];
  }
  if (policy.resource_tags) {
    policyValues.resource_tags = [policy.resource_tags];
  }
  return {
    name: `${policy.group} ${policy.name} policy`,
    data: policyValues,
  };
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
  return jsonToTfPrint(
    "resource",
    "ibm_iam_access_group_policy",
    `${policy.group} ${policy.name} policy`,
    ibmIamAccessGroupPolicy(policy).data
  );
}

/**
 * format access group dynamic policy
 * @param {Object} policy
 * @param {string} policy.group
 * @param {string} policy.name
 * @param {number} policy.expiration
 * @param {string} policy.identity_provider,
 * @param {Object} policy.conditions
 * @returns {string} terraform
 */

function ibmIamAccessGroupDynamicRule(policy) {
  return {
    name: `${policy.group} ${policy.name} dynamic rule`,
    data: {
      name: kebabCase(`${policy.group} ${policy.name} dynamic rule`),
      access_group_id: tfRef(
        "ibm_iam_access_group",
        policy.group + " access group"
      ),
      expiration: policy.expiration,
      identity_provider: policy.identity_provider,
      conditions: [policy.conditions],
    },
  };
}

/**
 * format access group dynamic policy
 * @param {Object} policy
 * @param {string} policy.group
 * @param {string} policy.name
 * @param {number} policy.expiration
 * @param {string} policy.identity_provider,
 * @param {Object} policy.conditions
 * @returns {string} terraform
 */
function formatAccessGroupDynamicRule(policy) {
  return jsonToTfPrint(
    "resource",
    "ibm_iam_access_group_dynamic_rule",
    `${policy.group} ${policy.name} dynamic rule`,
    ibmIamAccessGroupDynamicRule(policy).data
  );
}

/**
 * invite access group members terraform
 * @param {Object} invite
 * @param {string} invite.group
 * @param {Array<string>} invite.ibm_ids
 * @returns {Object} terraform
 */
function ibmIamAccessGroupMembers(invite) {
  return {
    name: `${invite.group} invites`,
    data: {
      access_group_id: tfRef(
        "ibm_iam_access_group",
        invite.group + " access group"
      ),
      ibm_ids: invite.ibm_ids,
    },
  };
}

/**
 * invite access group members terraform
 * @param {Object} invite
 * @param {string} invite.group
 * @param {Array<string>} invite.ibm_ids
 * @returns {string} terraform formatted string
 */
function formatGroupMembers(invite) {
  return jsonToTfPrint(
    "resource",
    "ibm_iam_access_group_members",
    `${invite.group} invites`,
    ibmIamAccessGroupMembers(invite).data
  );
}

function iamTf(config) {
  let tf = "";
  if (config.iam_account_settings.enable) {
    tf +=
      tfBlock(
        "IAM Account Settings",
        formatIamAccountSettings(config.iam_account_settings)
      ) + "\n";
  }
  config.access_groups.forEach((group) => {
    let blockData = formatAccessGroup(group, config);
    group.policies.forEach(
      (policy) => (blockData += formatAccessGroupPolicy(policy))
    );
    group.dynamic_policies.forEach(
      (policy) => (blockData += formatAccessGroupDynamicRule(policy))
    );
    if (group.has_invites) blockData += formatGroupMembers(group.invites);
    tf += tfBlock(`${group.name} access group`, blockData);
  });
  return tf;
}

module.exports = {
  formatIamAccountSettings,
  formatAccessGroup,
  formatAccessGroupPolicy,
  formatAccessGroupDynamicRule,
  formatGroupMembers,
  iamTf,
  ibmIamAccountSettings,
  ibmIamAccessGroup,
  ibmIamAccessGroupDynamicRule,
  ibmIamAccessGroupPolicy,
  ibmIamAccessGroupMembers,
};
