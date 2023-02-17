const { kebabCase } = require("lazy-z");
const { endComment } = require("./constants");
const {
  jsonToTf,
  tfRef,
  stringifyTranspose,
  buildTitleComment,
  kebabName
} = require("./utils");

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
      name: kebabName(config, [group.name, "ag"]),
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
      policy.group + " access group"
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
  let policyValues = {
    name: kebabCase(`"${policy.group} ${policy.name} dynamic rule"`),
    access_group_id: tfRef(
      "ibm_iam_access_group",
      policy.group + " access group"
    ),
    expiration: policy.expiration,
    identity_provider: `"${policy.identity_provider}"`,
    _conditions: stringifyTranspose(policy.conditions)
  };
  return jsonToTf(
    "ibm_iam_access_group_dynamic_rule",
    `${policy.group} ${policy.name} dynamic rule`,
    policyValues
  );
}

/**
 * invite access group members terraform
 * @param {Object} invite
 * @param {string} invite.group
 * @param {Array<string>} invite.ibm_ids
 * @returns {string} terraform formatted string
 */
function formatGroupMembers(invite) {
  return jsonToTf("ibm_iam_access_group_members", `${invite.group} invites`, {
    access_group_id: tfRef(
      "ibm_iam_access_group",
      invite.group + " access group"
    ),
    ibm_ids: JSON.stringify(invite.ibm_ids)
  });
}

function iamTf(config) {
  let tf = "";
  if (config.iam_account_settings.enable) {
    tf +=
      buildTitleComment("Iam Account", "settings") +
      formatIamAccountSettings(config.iam_account_settings) +
      endComment +
      "\n\n";
  }
  config.access_groups.forEach(group => {
    tf +=
      buildTitleComment(group.name, "access group") +
      formatAccessGroup(group, config);
    group.policies.forEach(policy => (tf += formatAccessGroupPolicy(policy)));
    group.dynamic_policies.forEach(
      policy => (tf += formatAccessGroupDynamicRule(policy))
    );
    if (group.has_invites) tf += formatGroupMembers(group.invites);
    tf += endComment + "\n\n";
  });
  return tf.replace(/\n$/i, "");
}

module.exports = {
  formatIamAccountSettings,
  formatAccessGroup,
  formatAccessGroupPolicy,
  formatAccessGroupDynamicRule,
  formatGroupMembers,
  iamTf
};
