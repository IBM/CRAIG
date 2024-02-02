const { splatContains, transpose, titleCase } = require("lazy-z");
const { setUnfoundResourceGroup } = require("./store.utils");
const { getCosFromBucket } = require("../forms/utils");
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
 * intialize LogDna store
 * @param {*} store
 */
function initLogDna(store) {
  store.newField("logdna", {
    init: logdnaInit,
    onStoreUpdate: logdnaOnStoreUpdate,
    save: logdnaSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["plan", "resource_group", "bucket"],
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
      ["resource_group", "plan"],
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
    },
  });
}

module.exports = {
  initLogDna,
  initSysDig,
};
