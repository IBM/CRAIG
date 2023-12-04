const { lazyZstate } = require("lazy-z/lib/store");
const { shouldDisableComponentSave } = require("./utils");
const { invalidCbrZone } = require("../forms/invalid-callbacks");
const { invalidCbrZoneText } = require("../forms/text-callbacks");
const {
  carveChild,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
} = require("./store.utils");
const { invalidName, invalidNameText } = require("../forms");

/**
 * initialize cbr zones in store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function cbrZonesInit(config) {
  config.store.json.cbr_zones = [];
}

/**
 * save cbr zones
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 */
function cbrZoneCreate(config, stateData, componentProps) {
  config.push(["json", "cbr_zones"], stateData);
}

/**
 * create a new cbr zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function cbrZoneSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "cbr_zones"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete cbr zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cbrZoneDelete(config, stateData, componentProps) {
  config.carve(["json", "cbr_zones"], componentProps.data.name);
}

/**
 * create new cbr zone address
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.addresses
 * @param {object} stateData component state data
 */
function cbrZoneAddressCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "cbr_zones",
    "addresses",
    stateData,
    componentProps
  );
}

/**
 * update cbr zone address
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.addresses
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneAddressSave(config, stateData, componentProps) {
  updateSubChild(config, "cbr_zones", "addresses", stateData, componentProps);
}

/**
 * delete a cbr zone address
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.addresses
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneAddressDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_zones", "addresses", componentProps);
}

/**
 * create new cbr zone exclusion
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.exclusions
 * @param {object} stateData component state data
 */
function cbrZoneExclusionCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "cbr_zones",
    "exclusions",
    stateData,
    componentProps
  );
}

/**
 * update cbr zone exclusion
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.exclusions
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneExclusionSave(config, stateData, componentProps) {
  updateSubChild(config, "cbr_zones", "exclusions", stateData, componentProps);
}

/**
 * delete a cbr zone exclusion
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.cbr_zones
 * @param {Array<string>} config.store.json.cbr_zones.exclusions
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function cbrZoneExclusionDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cbr_zones", "exclusions", componentProps);
}

function initCbrZones(store) {
  store.newField("cbr_zones", {
    init: cbrZonesInit,
    create: cbrZoneCreate,
    save: cbrZoneSave,
    delete: cbrZoneDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "description", "account_id"],
      "cbr_zones"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("cbr_zones"),
        invalidText: invalidNameText("cbr_zones"),
      },
      description: {
        default: "",
        invalid: function (stateData) {
          return invalidCbrZone("description", stateData);
        },
        invalidText: invalidCbrZoneText("description"),
      },
      account_id: {
        default: "",
        invalid: function (stateData) {
          return invalidCbrZone("account_id", stateData);
        },
      },
    },
    subComponents: {
      addresses: {
        create: cbrZoneAddressCreate,
        delete: cbrZoneAddressDelete,
        save: cbrZoneAddressSave,
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "account_id",
            "location",
            "service_name",
            "service_type",
            "service_instance",
            "value",
          ],
          "cbr_zones",
          "addresses"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("addresses"),
            invalidText: invalidNameText("addresses"),
          },
          account_id: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("account_id", stateData);
            },
          },
          location: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("location", stateData);
            },
          },
          service_name: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_name", stateData);
            },
          },
          service_type: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_type", stateData);
            },
          },
          service_instance: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_instance", stateData);
            },
          },
          type: {
            default: "ipAddress",
          },
          value: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("value", stateData);
            },
          },
        },
      },
      exclusions: {
        create: cbrZoneExclusionCreate,
        delete: cbrZoneExclusionDelete,
        save: cbrZoneExclusionSave,
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "account_id",
            "location",
            "service_name",
            "service_type",
            "service_instance",
            "value",
          ],
          "cbr_zones",
          "exclusions"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("exclusions"),
            invalidText: invalidNameText("exclusions"),
          },
          account_id: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("account_id", stateData);
            },
          },
          location: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("location", stateData);
            },
          },
          service_name: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_name", stateData);
            },
          },
          service_type: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_type", stateData);
            },
          },
          service_instance: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_instance", stateData);
            },
          },
          type: {
            default: "ipAddress",
          },
          value: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("value", stateData);
            },
          },
        },
      },
    },
  });
}

module.exports = {
  cbrZonesInit,
  cbrZoneCreate,
  cbrZoneSave,
  cbrZoneDelete,
  cbrZoneAddressCreate,
  cbrZoneAddressSave,
  cbrZoneAddressDelete,
  cbrZoneExclusionCreate,
  cbrZoneExclusionSave,
  cbrZoneExclusionDelete,
  initCbrZones,
};
