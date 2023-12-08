const {
  setUnfoundResourceGroup,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
} = require("./store.utils");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  isRangeInvalid,
  unconditionalInvalidText,
} = require("./utils");
const { invalidIpCommaList } = require("../forms/invalid-callbacks");
const { iamAccountSettingInvalidText } = require("../forms/text-callbacks");
const { isNullOrEmptyString } = require("lazy-z");
const { invalidName, invalidNameText } = require("../forms");

function initIamStore(store) {
  store.newField("iam_account_settings", {
    init: iamInit,
    save: iamSave,
    shouldDisableSave: shouldDisableComponentSave(
      [
        "mfa",
        "allowed_ip_addresses",
        "max_sessions_per_identity",
        "restrict_create_service_id",
        "restrict_create_platform_apikey",
        "session_expiration_in_seconds",
        "session_invalidation_in_seconds",
      ],
      "iam_account_settings"
    ),
    schema: {
      enable: {
        default: false,
      },
      mfa: {
        default: null,
        invalid: fieldIsNullOrEmptyString("mfa", true),
        invalidText: iamAccountSettingInvalidText("mfa"),
      },
      allowed_ip_addresses: {
        default: null,
        invalidText: unconditionalInvalidText(
          "Enter a comma separated list of IP addresses or CIDR blocks"
        ),
        invalid: function (stateData) {
          return stateData.allowed_ip_addresses
            ? invalidIpCommaList(stateData.allowed_ip_addresses)
            : false;
        },
      },
      include_history: {
        default: false,
      },
      if_match: {
        default: null,
      },
      max_sessions_per_identity: {
        default: null,
        invalid: function (stateData) {
          return (
            stateData.max_sessions_per_identity < 1 ||
            stateData.max_sessions_per_identity > 10
          );
        },
        invalidText: unconditionalInvalidText("Value must be in range [1-10]"),
      },
      restrict_create_service_id: {
        default: null,
        invalid: fieldIsNullOrEmptyString("restrict_create_service_id", true),
        invalidText: unconditionalInvalidText("Invalid"),
      },
      restrict_create_platform_apikey: {
        default: null,
        invalid: fieldIsNullOrEmptyString(
          "restrict_create_platform_apikey",
          true
        ),
        invalidText: unconditionalInvalidText("Invalid"),
      },
      session_expiration_in_seconds: {
        default: null,
        invalid: function (stateData) {
          return isRangeInvalid(
            stateData.session_expiration_in_seconds,
            900,
            86400
          );
        },
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 900 and 86400"
        ),
      },
      session_invalidation_in_seconds: {
        default: null,
        invalid: function (stateData) {
          return isRangeInvalid(
            stateData.session_invalidation_in_seconds,
            900,
            86400
          );
        },
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 900 and 86400"
        ),
      },
    },
  });
}
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
    include_history: false,
    if_match: null, // must be NOT_SET or integer > 0
    max_sessions_per_identity: null, // must be NOT_SET or integer > 0
    restrict_create_service_id: null, // must be one of ["NOT_SET", "RESTRICTED", "NOT_RESTRICTED"]
    restrict_create_platform_apikey: null, // must be one of ["NOT_SET", "RESTRICTED", "NOT_RESTRICTED"]
    session_expiration_in_seconds: null, // must be `NOT_SET` or number between 900 and 86400
    session_invalidation_in_seconds: null, // must be `NOT_SET` or number between 900 and 7200
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
  if (stateData.enable === false) {
    [
      "mfa",
      "allowed_ip_addresses",
      "if_match",
      "max_sessions_per_identity",
      "restrict_create_service_id",
      "restrict_create_platform_apikey",
      "session_expiration_in_seconds",
      "session_invalidation_in_seconds",
    ].forEach((field) => {
      stateData[field] = null;
    });
    stateData["include_history"] = false;
  }
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
  config.store.json.access_groups.forEach((group) => {
    // for each policy in that group
    group.policies.forEach((policy) => {
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
  config.push(["json", "access_groups"], {
    name: stateData.name,
    description: stateData.description,
    policies: [],
    dynamic_policies: [],
    has_invites: false,
    invites: {
      group: stateData.name,
      ibm_ids: [],
    },
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
  config.updateChild(
    ["json", "access_groups"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete access group
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function accessGroupDelete(config, stateData, componentProps) {
  config.carve(["json", "access_groups"], componentProps.data.name);
}

/**
 * create new access group policy
 * @param {lazyZstate} config store
 * @param {object} stateData component state data
 * @param {object} stateData.resources resource object for access group policy
 * @param {object} componentProps props from component form
 * @param {string} componentProps.arrayParentName name of the parent object where child will be stored
 */
function accessGroupPolicyCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
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
 * @param {string} componentProps.arrayParentName name of the parent object where child will be stored
 */
function accessGroupDynamicPolicyCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
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

function initAccessGroups(store) {
  store.newField("access_groups", {
    init: accessGroupInit,
    create: accessGroupCreate,
    save: accessGroupSave,
    delete: accessGroupDelete,
    onStoreUpdate: accessGroupOnStoreUpdate,
    shouldDisableSave: shouldDisableComponentSave(["name"], "access_groups"),
    schema: {
      name: {
        default: "",
        invalid: invalidName("access_groups"),
        invalidText: invalidNameText("access_groups"),
      },
    },
    subComponents: {
      policies: {
        create: accessGroupPolicyCreate,
        delete: accessGroupPolicyDelete,
        save: accessGroupPolicySave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name"],
          "access_groups",
          "policies"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("policies"),
            invalidText: invalidNameText("policies"),
          },
        },
      },
      dynamic_policies: {
        create: accessGroupDynamicPolicyCreate,
        delete: accessGroupDynamicPolicyDelete,
        save: accessGroupDynamicPolicySave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "identity_provider"],
          "access_groups",
          "dynamic_policies"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("dynamic_policies"),
            invalidText: invalidNameText("dynamic_policies"),
          },
          identity_provider: {
            default: "",
            invalid: function (stateData) {
              return stateData.identity_provider.length < 6;
            },
          },
        },
      },
    },
  });
}

module.exports = {
  iamInit,
  iamSave,
  initIamStore,
  initAccessGroups,
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
  accessGroupDynamicPolicyDelete,
};
