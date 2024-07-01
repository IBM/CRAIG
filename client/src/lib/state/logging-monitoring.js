const {
  splatContains,
  transpose,
  titleCase,
  splat,
  isNullOrEmptyString,
} = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyStringEnabled,
  resourceGroupsField,
  selectInvalidText,
  kebabCaseInput,
  titleCaseRender,
} = require("./utils");

/**
 * initialize logdna
 * @param {lazyZstate} config
 */
function logdnaInit(config) {
  config.store.json.logdna = {
    enabled: false,
    plan: "lite",
    endpoints: "private",
    platform_logs: false,
    resource_group: "service-rg",
    cos: "atracker-cos",
    bucket: "atracker-bucket",
  };
}

/**
 * on store update
 * @param {lazyZstate} config
 */
function logdnaOnStoreUpdate(config) {
  if (
    !splatContains(
      config.store.json.object_storage,
      "name",
      config.store.json.logdna.cos
    )
  ) {
    config.store.json.logdna.cos = null;
    config.store.json.logdna.bucket = null;
  } else {
    config.updateUnfound("cosBuckets", config.store.json.logdna, "bucket");
  }
  setUnfoundResourceGroup(config, config.store.json.logdna);
  // remove unfound secrets manager
  ["logdna", "sysdig"].forEach((resource) => {
    if (
      !splatContains(
        config.store.json.secrets_manager,
        "name",
        config.store.json[resource].secrets_manager
      )
    ) {
      config.store.json[resource].secrets_manager = null;
    }
  });
  // set secrets manager for observability
  if (config.store.json.logdna.secrets_manager) {
    config.store.json.sysdig.secrets_manager =
      config.store.json.logdna.secrets_manager;
  } else if (config.store.json.sysdig.secrets_manager) {
    config.store.json.logdna.secrets_manager =
      config.store.json.sysdig.secrets_manager;
  }
}

/**
 * logdna save
 * @param {lazyZstate} config
 * @param {object} stateData
 */
function logdnaSave(config, stateData) {
  function getCosFromBucket(name, objectStoreArray) {
    let cos;
    objectStoreArray.forEach((instance) => {
      instance.buckets.forEach((bucket) => {
        if (name === bucket.name) {
          cos = instance.name;
        }
      });
    });
    return cos || null;
  }
  stateData.cos = getCosFromBucket(
    stateData.bucket,
    config.store.json.object_storage
  );
  transpose(stateData, config.store.json.logdna);
}

/**
 * initialize sydig
 * @param {lazyZstate} config
 */
function sysdigInit(config) {
  config.store.json.sysdig = {
    enabled: false,
    plan: "graduated-tier",
    resource_group: "service-rg",
  };
}

/**
 * sysdig save
 * @param {lazyZstate} config
 * @param {object} stateData
 */
function sysdigSave(config, stateData) {
  transpose(stateData, config.store.json.sysdig);
}

/**
 * sysdig on store update
 * @param {lazyZstate} config
 */
function sysdigOnStoreUpdate(config) {
  setUnfoundResourceGroup(config, config.store.json.sysdig);
}

/**
 * return true when no secrets manager
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true when no secrets manager
 */
function noSecretsManager(stateData, componentProps) {
  return (
    componentProps.craig.store.json.secrets_manager.length < 1 &&
    stateData.store_secrets !== true
  );
}

/**
 * shortcut to create secrets manager dropdown
 * @returns {object} secrets manager select object
 */
function observabilitySecretsManager() {
  return {
    type: "select",
    size: "small",
    groups: function (stateData, componentProps) {
      return splat(componentProps.craig.store.json.secrets_manager, "name");
    },
    hideWhen: function (stateData, componentProps) {
      return !stateData.store_secrets;
    },
    invalidText: function (stateData, componentProps) {
      return noSecretsManager(stateData, componentProps)
        ? "No secrets manager instances"
        : "Select a secrets manager";
    },
    invalid: function (stateData) {
      return stateData.store_secrets !== true
        ? false
        : isNullOrEmptyString(stateData.secrets_manager, true);
    },
  };
}

/**
 * intialize LogDna store
 * @param {*} store
 */
function initLogDna(store) {
  store.newField("logdna", {
    init: logdnaInit,
    onStoreUpdate: logdnaOnStoreUpdate,
    save: logdnaSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["plan", "resource_group", "bucket", "secrets_manager"],
      "logdna"
    ),
    schema: {
      name: {
        readOnly: true,
        labelText: "Name",
        size: "small",
        default: "logdna",
        helperText: function (stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-logdna`;
        },
      },
      enabled: {
        type: "toggle",
        labelText: "Enabled",
        default: false,
        size: "small",
      },
      plan: {
        size: "small",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("plan"),
        invalidText: selectInvalidText("plan"),
        groups: ["Lite", "7 Day", "14 Day", "30 Day"],
        onInputChange: kebabCaseInput("plan"),
        onRender: function (stateData) {
          return titleCase(stateData.plan)
            .replace(/3 0/, "30")
            .replace(/1 4/, "14");
        },
      },
      resource_group: resourceGroupsField(true, {
        invalid: function (stateData) {
          return fieldIsNullOrEmptyStringEnabled("resource_group")(stateData);
        },
      }),
      bucket: {
        type: "select",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("bucket"),
        invalidText: selectInvalidText("bucket"),
        groups: function (stateData, componentProps) {
          return componentProps.craig.store.cosBuckets;
        },
      },
      archive: {
        size: "small",
        type: "toggle",
        default: false,
        tooltip: {
          content: "Create an archive with the LogDNA Provider",
          align: "bottom-left",
        },
        labelText: "(Optional) LogDNA Archive",
      },
      platform_logs: {
        type: "toggle",
        default: false,
        labelText: "(Optional) Platform Logging",
        size: "small",
      },
      store_secrets: {
        type: "toggle",
        default: false,
        labelText: "Store Key in Secrets Manager",
        size: "small",
        hideWhen: noSecretsManager,
      },
      secrets_manager: observabilitySecretsManager(),
    },
  });
}

/**
 * intialize sysDig store
 * @param {*} store
 */
function initSysDig(store) {
  store.newField("sysdig", {
    init: sysdigInit,
    onStoreUpdate: sysdigOnStoreUpdate,
    save: sysdigSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["resource_group", "plan", "secrets_manager"],
      "sysdig"
    ),
    schema: {
      enabled: {
        type: "toggle",
        labelText: "Enabled",
        default: false,
      },
      name: {
        readOnly: true,
        labelText: "Name",
        default: "sysdig",
        helperText: function (stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-sysdig`;
        },
      },
      resource_group: resourceGroupsField(false, {
        invalid: function (stateData) {
          return fieldIsNullOrEmptyStringEnabled("resource_group")(stateData);
        },
      }),
      plan: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyStringEnabled("plan"),
        invalidText: selectInvalidText("plan"),
        groups: ["Graduated Tier"],
        onRender: titleCaseRender("plan"),
        onInputChange: kebabCaseInput("plan"),
        tooltip: {
          content: "Each tier level allows for more time-series per month.",
          link: "https://cloud.ibm.com/docs/monitoring?topic=monitoring-pricing_plans#graduated_secure",
          align: "bottom-left",
        },
      },
      platform_logs: {
        type: "toggle",
        default: false,
        labelText: "(Optional) Platform Logging",
      },
      store_secrets: {
        type: "toggle",
        default: false,
        labelText: "Store Key in Secrets Manager",
        hideWhen: noSecretsManager,
      },
      secrets_manager: observabilitySecretsManager(),
    },
  });
}

module.exports = {
  initLogDna,
  initSysDig,
};
