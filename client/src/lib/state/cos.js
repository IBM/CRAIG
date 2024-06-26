const {
  splat,
  splatContains,
  titleCase,
  getObjectFromArray,
} = require("lazy-z");
const { newDefaultCos } = require("./defaults");
const {
  updateSubChild,
  deleteSubChild,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey,
  pushToChildFieldModal,
} = require("./store.utils");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  selectInvalidText,
  resourceGroupsField,
  titleCaseRender,
  kebabCaseInput,
  unconditionalInvalidText,
  hideWhenUseData,
} = require("./utils");
const { cosPlans } = require("../constants");
const { nameField, hideWhenFieldFalse } = require("./reusable-fields");
const { invalidCrnList } = require("../forms/invalid-callbacks");

/**
 * set cosBuckets and cosKeys in slz store
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.cos
 * @param {Function} instanceCallback callback after setting splat
 */
function cosSetStoreBucketsAndKeys(config, instanceCallback) {
  config.store.json.object_storage.forEach((instance) => {
    // instance.plan.toLowerCase(); - cannot select other plans right now
    instance.buckets.forEach((bucket) => {
      bucket.use_random_suffix = instance.use_random_suffix;
      bucket.storage_class = bucket.storage_class.toLowerCase();
    });
    instance.keys.forEach((key) => {
      key.use_random_suffix = instance.use_random_suffix;
    });
    // add all bucket names from instance to buckets
    config.store.cosBuckets = config.store.cosBuckets.concat(
      splat(instance.buckets, "name")
    );
    // add all key names to keys
    config.store.cosKeys = config.store.cosKeys.concat(
      splat(instance.keys, "name")
    );
    // if callback run callback against instance
    if (instanceCallback) {
      instanceCallback(instance);
    }
  });
}

/**
 * initialize object storage
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 */
function cosInit(config) {
  config.store.json.object_storage = newDefaultCos();
  cosSetStoreBucketsAndKeys(config);
}

/**
 * cos on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.object_storage
 * @param {Array<object>} config.store.json.object_storage.buckets
 * @param {string} config.store.json.object_storage.buckets.kms_key
 */
function cosOnStoreUpdate(config) {
  config.store.cosInstances = splat(config.store.json.object_storage, "name");
  config.store.cosBuckets = [];
  config.store.cosKeys = [];
  config.store.json.object_storage.forEach((cos) => {
    if (!splatContains(config.store.json.key_management, "name", cos.kms)) {
      cos.kms = null;
    }
    if (!cos.plan) {
      cos.plan = "standard";
    }
    cos.buckets.forEach((bucket) => {
      if (!cos.kms) {
        bucket.kms_key = null;
      }
    });
  });
  cosSetStoreBucketsAndKeys(config, (instance) => {
    setUnfoundResourceGroup(config, instance);
    // for each bucket, if encryption key is not found set to null
    instance.buckets.forEach((bucket) => {
      setUnfoundEncryptionKey(config, bucket);
    });
  });
}

/**
 * create new cos instance
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 */
function cosCreate(config, stateData) {
  stateData.buckets = [];
  stateData.keys = [];
  config.push(["json", "object_storage"], stateData);
}

/**
 * delete a cos instance
 * @param {lazyZstate} config state store

 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosDelete(config, stateData, componentProps) {
  config.carve(["json", "object_storage"], componentProps.data.name);
}

/**
 * update a cos instance
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosSave(config, stateData, componentProps) {
  config.store.json.vpcs.forEach((vpc) => {
    if (vpc.cos === componentProps.data.name) vpc.cos = stateData.name;
  });
  config.store.json.clusters.forEach((cluster) => {
    if (cluster.cos === componentProps.data.name) cluster.cos = stateData.name;
  });
  config.updateChild(
    ["json", "object_storage"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new cos bucket
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} stateData.showBucket show bucket prop from form
 * @param {object} componentProps props from component form
 */
function cosBucketCreate(config, stateData, componentProps) {
  delete stateData.showBucket;
  pushToChildFieldModal(
    config,
    "object_storage",
    "buckets",
    stateData,
    componentProps
  );
}

/**
 * save a cos bucket
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.atracker
 * @param {string} config.store.json.atracker.collector_bucket_name
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name
 */
function cosBucketSave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "object_storage",
    "buckets",
    stateData,
    componentProps,
    (config) => {
      if (
        config.store.json.atracker.collector_bucket_name ===
        componentProps.data.name
      )
        config.store.json.atracker.collector_bucket_name = stateData.name;
      if (config.store.json.logdna.bucket === componentProps.data.name)
        config.store.json.logdna.bucket = stateData.name;
      config.store.json.vpcs.forEach((vpc) => {
        if (vpc.bucket === componentProps.data.name)
          vpc.bucket = stateData.name;
      });
    }
  );
}

/**
 * delete a cos bucket
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosBucketDelete(config, stateData, componentProps) {
  deleteSubChild(config, "object_storage", "buckets", componentProps);
}

/**
 * create a new cos key
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosKeyCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "object_storage",
    "keys",
    stateData,
    componentProps
  );
}

/**
 * save a cos key
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data original object data
 * @param {string} componentProps.data.name key name before update
 */
function cosKeySave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "object_storage",
    "keys",
    stateData,
    componentProps,
    (config) => {
      if (config.store.json.atracker.cos_key === componentProps.data.name) {
        config.store.json.atracker.cos_key = stateData.name;
      }
    }
  );
}

/**
 * delete a cos key
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosKeyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "object_storage", "keys", componentProps);
}

/**
 * create cos helper text function
 * @param {*} isKey
 * @returns {Function} helpertext function
 */
function cosChildHelperText(isKey) {
  /**
   * helper text for object storage child form names
   * @param {*} stateData
   * @param {*} componentProps
   * @returns {string} helper text
   */
  return function (stateData, componentProps) {
    return `${componentProps.craig.store.json._options.prefix}-${
      componentProps.arrayParentName
    }-${isKey ? "key-" : ""}${stateData.name}${
      componentProps.parent.use_random_suffix ? "-<random-suffix>" : ""
    }`;
  };
}

/**
 * initialize object storage store
 * @param {*} store
 */
function initObjectStorageStore(store) {
  store.newField("object_storage", {
    init: cosInit,
    onStoreUpdate: cosOnStoreUpdate,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "plan"],
      "object_storage"
    ),
    create: cosCreate,
    save: cosSave,
    delete: cosDelete,
    schema: {
      use_data: {
        type: "toggle",
        default: false,
        labelText: "Use Existing Instance",
        tooltip: {
          content:
            "Service credentials and buckets will be created for your environment even when using an existing Object Storage instance.",
          alignModal: "bottom",
        },
      },
      use_random_suffix: {
        type: "toggle",
        default: false,
        labelText: "Append Random Suffix to Names",
        tooltip: {
          content:
            "Object storage bucket names must be unique across an account. Append a random suffix to maintain unique names across deployments.",
          alignModal: "bottom",
        },
      },
      name: nameField("object_storage", {
        /**
         * get cos resource helper text
         * @param {*} stateData
         * @param {*} componentProps
         * @returns {string} composed helper text
         */
        helperText: function cosResourceHelperTextCallback(
          stateData,
          componentProps
        ) {
          return stateData.use_data
            ? stateData.name
            : `${componentProps.craig.store.json._options.prefix}-${
                stateData.name
              }-object-storage${
                stateData.use_random_suffix ? "-<random-suffix>" : ""
              }`;
        },
      }),
      resource_group: resourceGroupsField(false, {
        noHideWhen: true,
      }),
      kms: {
        type: "select",
        default: "",
        labelText: "Key Management Instance",
        invalidText: selectInvalidText("key management instance"),
        invalid: function (stateData) {
          return stateData.kms === "";
        },
        groups: function (stateData, componentProps) {
          return splat(
            componentProps.craig.store.json.key_management,
            "name"
          ).concat("NONE (Insecure)");
        },
        onInputChange: function (stateData) {
          return stateData.kms === "NONE (Insecure)" ? null : stateData.kms;
        },
        onRender: function (stateData) {
          return stateData.kms === null ? "NONE (Insecure)" : stateData.kms;
        },
      },
      plan: {
        type: "select",
        default: "",
        groups: cosPlans.map((plan) => {
          return titleCase(plan)
            .replace("1 2", "12")
            .replace("2 4", "24")
            .replace("4 8", "48")
            .replace("9 6", "96");
        }),
        onRender: titleCaseRender("plan"),
        onInputChange: kebabCaseInput("plan"),
        invalid: fieldIsNullOrEmptyString("plan"),
        invalidText: selectInvalidText("plan"),
        hideWhen: hideWhenUseData,
      },
    },
    subComponents: {
      buckets: {
        create: cosBucketCreate,
        save: cosBucketSave,
        delete: cosBucketDelete,
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "storage_class",
            "activity_tracking_crn",
            "metrics_monitoring_crn",
          ],
          "object_storage",
          "buckets"
        ),
        schema: {
          name: nameField("buckets", {
            helperText: cosChildHelperText(),
          }),
          storage_class: {
            size: "small",
            default: "",
            type: "select",
            invalid: fieldIsNullOrEmptyString("storage_class"),
            invalidText: selectInvalidText("bucket class"),
            labelText: "Bucket Class",
            groups: ["Standard", "Vault", "Storage", "Smart"],
            onInputChange: kebabCaseInput("storage_class"),
            onRender: titleCaseRender("storage_class"),
          },
          kms_key: {
            size: "small",
            labelText: "Encryption Key",
            type: "select",
            default: null,
            invalid: fieldIsNullOrEmptyString("kms_key"),
            invalidText: unconditionalInvalidText(
              "Warning: Unencrypted storage bucket"
            ),
            groups: function (stateData, componentProps) {
              let cosName = componentProps.arrayParentName;
              let { kms } = getObjectFromArray(
                componentProps.craig.store.json.object_storage,
                "name",
                cosName
              );
              let validKeys = [];
              if (kms) {
                getObjectFromArray(
                  componentProps.craig.store.json.key_management,
                  "name",
                  kms
                ).keys.forEach((key) => {
                  if (key.root_key) {
                    validKeys.push(key.name);
                  }
                });
              }
              return (kms ? validKeys : []).concat("NONE (Insecure)");
            },
            onRender: function (stateData) {
              return stateData.kms_key === null
                ? "NONE (Insecure)"
                : stateData.kms_key;
            },
            onInputChange: function (stateData) {
              return stateData.kms_key === "NONE (Insecure)"
                ? null
                : stateData.kms_key;
            },
            tooltip: {
              content: "To follow best practices, encrypt your storage bucket.",
            },
          },
          force_delete: {
            size: "small",
            default: false,
            type: "toggle",
            tooltip: {
              content:
                "Toggling this on will force delete contents of the bucket after the bucket is deleted",
            },
            labelText: "Force Delete Contents",
          },
          activity_tracking: {
            type: "toggle",
            size: "small",
            default: false,
            labelText: "Enable Activity Tracking",
          },
          read_data_events: {
            type: "toggle",
            size: "small",
            default: false,
            labelText: "Read Data Events",
            hideWhen: hideWhenFieldFalse("activity_tracking"),
          },
          write_data_events: {
            type: "toggle",
            size: "small",
            default: false,
            labelText: "Write Data Events",
            hideWhen: hideWhenFieldFalse("activity_tracking"),
          },
          activity_tracking_crn: {
            labelText: "Activity Tracking CRN",
            default: null,
            size: "small",
            hideWhen: function (stateData, componentProps) {
              return (
                hideWhenFieldFalse("activity_tracking")(stateData) ||
                componentProps.craig.store.json.atracker.instance
              );
            },
            invalid: function (stateData, componentProps) {
              return hideWhenFieldFalse("activity_tracking")(stateData) ||
                componentProps.craig.store.json.atracker.instance
                ? false
                : invalidCrnList([stateData.activity_tracking_crn]);
            },
            invalidText: unconditionalInvalidText("Enter a valid resource CRN"),
          },
          metrics_monitoring: {
            type: "toggle",
            size: "small",
            default: false,
            labelText: "Enable Metrics Monitoring",
          },
          usage_metrics_enabled: {
            type: "toggle",
            size: "small",
            default: false,
            labelText: "Usage Metrics",
            hideWhen: hideWhenFieldFalse("metrics_monitoring"),
          },
          request_metrics_enabled: {
            type: "toggle",
            size: "small",
            default: false,
            labelText: "Request Metrics",
            hideWhen: hideWhenFieldFalse("metrics_monitoring"),
          },
          metrics_monitoring_crn: {
            labelText: "Cloud Monitoring CRN",
            default: null,
            size: "small",
            hideWhen: function (stateData, componentProps) {
              return (
                hideWhenFieldFalse("metrics_monitoring")(stateData) ||
                componentProps.craig.store.json.sysdig.enabled
              );
            },
            invalid: function (stateData, componentProps) {
              return hideWhenFieldFalse("metrics_monitoring")(stateData) ||
                componentProps.craig.store.json.sysdig.enabled
                ? false
                : invalidCrnList([stateData.metrics_monitoring_crn]);
            },
            invalidText: unconditionalInvalidText("Enter a valid resource CRN"),
          },
        },
      },
      keys: {
        create: cosKeyCreate,
        save: cosKeySave,
        delete: cosKeyDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "role"],
          "object_storage",
          "keys"
        ),
        schema: {
          name: nameField("cos_keys", {
            helperText: cosChildHelperText(true),
          }),
          role: {
            type: "select",
            default: "",
            invalidText: selectInvalidText("role"),
            invalid: fieldIsNullOrEmptyString("role", false),
            groups: [
              "Object Writer",
              "Object Reader",
              "Content Reader",
              "Reader",
              "Writer",
              "Manager",
            ],
          },
          enable_hmac: {
            type: "toggle",
            default: true,
            labelText: "Enable HMAC",
            tooltip: {
              link: "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-uhc-hmac-credentials-main",
              content:
                "HMAC (hash-based message authentication code) is required for Teleport VSI instances.",
              alignModal: "bottom-left",
            },
          },
        },
      },
    },
  });
}

module.exports = {
  cosKeyCreate,
  cosKeySave,
  cosKeyDelete,
  cosBucketDelete,
  cosBucketSave,
  cosBucketCreate,
  cosCreate,
  cosDelete,
  cosSave,
  cosOnStoreUpdate,
  cosInit,
  initObjectStorageStore,
};
