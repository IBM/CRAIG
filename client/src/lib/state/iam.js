const {
  setUnfoundResourceGroup,
  carveChild,
  updateChild,
  pushAndUpdate,
  updateSubChild,
  pushToChildField,
  deleteSubChild
} = require("./store.utils");

/**
 * initialize iam account settings
 * @param {lazyZState} config store
 * @param {object} config.store
 * @param {object} config.store.json
 */
function iamInit(config) {
  config.store.json.iam_account_settings = {
    // these values should be validated in the FE component as most can use dropdowns
    enable: false,
    mfa: null, // must be one of ["NONE", "TOTP", "TOTP4ALL", "LEVEL1", "LEVEL2", "LEVEL3", "null"]
    allowed_ip_addresses: null, // must be comma separated list of ips on submit
    include_history: null,
    if_match: null, // must be NOT_SET or integer > 0
    max_sessions_per_identity: null, // must be NOT_SET or integer > 0
    restrict_create_service_id: null, // must be one of ["NOT_SET", "RESTRICTED", "NOT_RESTRICTED"]
    restrict_create_platform_apikey: null, // must be one of ["NOT_SET", "RESTRICTED", "NOT_RESTRICTED"]
    session_expiration_in_seconds: null, // must be `NOT_SET` or number between 900 and 86400
    session_invalidation_in_seconds: null // must be `NOT_SET` or number between 900 and 7200
  };
}

/**
 * save iam account settings
 * @param {lazyZState} config store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.iam_account_settings
 * @param {object} stateData component state data
 * @param {boolean} stateData.enable
 */
function iamSave(config, stateData) {
  if (stateData.enable === false)
    [
      "mfa",
      "allowed_ip_addresses",
      "include_history",
      "if_match",
      "max_sessions_per_identity",
      "restrict_create_service_id",
      "restrict_create_platform_apikey",
      "session_expiration_in_seconds",
      "session_invalidation_in_seconds"
    ].forEach(field => {
      stateData[field] = null;
    });
  config.store.json.iam_account_settings = stateData;
}

/**
 * init state store
 * @param {configState} config
 */
function accessGroupInit(config) {
  config.store.json.access_groups = [];
}

/**
 * on store update
 * @param {configState} config
 */
function accessGroupOnStoreUpdate(config) {
  // for each access group
  config.store.json.access_groups.forEach(group => {
    // for each policy in that group
    group.policies.forEach(policy => {
      setUnfoundResourceGroup(config, policy.resources);
    });
  });
}
/**
 * create new access group
 * @param {configState} config
 * @param {object} stateData component state data
 * @param {string} stateData.name name of access group
 * @param {string} stateData.description access group description
 */
function accessGroupCreate(config, stateData) {
  pushAndUpdate(config, "access_groups", {
    name: stateData.name,
    description: stateData.description,
    policies: [],
    dynamic_policies: [],
    has_invites: false,
    invites: {
      group: stateData.name,
      ibm_ids: []
    }
  });
}
/**
 * save access group
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupSave(config, stateData, componentProps) {
  stateData.invites.group = stateData.name;
  updateChild(config, "access_groups", stateData, componentProps);
}

/**
 * delete access group
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDelete(config, stateData, componentProps) {
  carveChild(config, "access_groups", componentProps);
}

/**
 * create new access group policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} stateData.resources resource object for access group policy
 * @param {object} componentProps props from component form
 */
function accessGroupPolicyCreate(config, stateData, componentProps) {
  pushToChildField(
    config,
    "access_groups",
    "policies",
    stateData,
    componentProps
  );
}

/**
 * update access group policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupPolicySave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "access_groups",
    "policies",
    stateData,
    componentProps
  );
}

/**
 * delete access group policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupPolicyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "access_groups", "policies", componentProps);
}

/**
 * create access group dynamic policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDynamicPolicyCreate(config, stateData, componentProps) {
  pushToChildField(
    config,
    "access_groups",
    "dynamic_policies",
    stateData,
    componentProps
  );
}

/**
 * save access group dynamic policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDynamicPolicySave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "access_groups",
    "dynamic_policies",
    stateData,
    componentProps
  );
}

/**
 * delete access group dynamic policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDynamicPolicyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "access_groups", "dynamic_policies", componentProps);
}

module.exports = {
  iamInit,
  iamSave,
  accessGroupInit,
  accessGroupOnStoreUpdate,
  accessGroupCreate,
  accessGroupSave,
  accessGroupDelete,
  accessGroupPolicyCreate,
  accessGroupPolicySave,
  accessGroupPolicyDelete,
  accessGroupDynamicPolicyCreate,
  accessGroupDynamicPolicySave,
  accessGroupDynamicPolicyDelete
};
