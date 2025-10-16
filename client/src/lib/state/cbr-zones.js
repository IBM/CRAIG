const { lazyZstate } = require("lazy-z/lib/store");
const {
  shouldDisableComponentSave,
  unconditionalInvalidText,
  cbrSaveType,
  cbrValuePlaceholder,
  cbrTitleCase,
} = require("./utils");
const { invalidCbrZone } = require("../forms/invalid-callbacks");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
} = require("./store.utils");
const { isNullOrEmptyString, isIpv4CidrOrAddress } = require("lazy-z");
const { ipRangeExpression } = require("../constants");
const { nameField } = require("./reusable-fields");

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
    stateData,
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
    componentProps,
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
    componentProps,
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

function cbrZonesOnStoreUpdate(config) {
  if (config.store.json.cbr_zones) {
    config.store.json.cbr_zones.forEach((zone) => {
      if (!zone.addresses) {
        zone.addresses = [];
      }
      if (!zone.exclusions) {
        zone.exclusions = [];
      }
    });
  } else config.store.json.cbr_zones = [];
}

/**
 * @param {string} field field to get invalid text for
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {string} invalid text string
 */
function invalidCbrZoneText(field) {
  if (field === "description") {
    return "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/";
  } else {
    return `Invalid ${field}. Value must match regular expression /^[0-9a-z-]+$/.`;
  }
}

/**
 * returns invalid text for cbr zone value based on type
 * @param {*} type
 * @param {*} value
 * @returns {Object} invalidText string
 */
function cbrValueInvalidText(type, value) {
  let invalidText = "";
  if (isNullOrEmptyString(value)) {
    invalidText = `Invalid value for type ${type}. Cannot be empty string.`;
  } else if (type === "ipAddress") {
    if (!isIpv4CidrOrAddress(value) || value.includes("/")) {
      invalidText = `Invalid value for type ${type}. Value must be a valid IPV4 Address.`;
    }
  } else if (type === "ipRange") {
    if (value.match(ipRangeExpression) === null) {
      invalidText = `Invalid value for type ${type}. Value must be a range of IPV4 Addresses.`;
    }
  }
  return invalidText;
}

function initCbrZones(store) {
  store.newField("cbr_zones", {
    init: cbrZonesInit,
    onStoreUpdate: cbrZonesOnStoreUpdate,
    create: cbrZoneCreate,
    save: cbrZoneSave,
    delete: cbrZoneDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "description", "account_id"],
      "cbr_zones",
    ),
    schema: {
      name: nameField("cbr_zones"),
      description: {
        default: "",
        type: "textArea",
        labelText: "Description",
        invalid: function (stateData) {
          return (
            stateData.description && invalidCbrZone("description", stateData)
          );
        },
        invalidText: unconditionalInvalidText(
          "Invalid description. Must be 0-300 characters and match the regex expression /^[\x20-\xFE]*$/",
        ),
        placeholder: "(Optional) Zone Description",
      },
      account_id: {
        default: "",
        labelText: "Account ID",
        optional: true,
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
          "addresses",
        ),
        schema: {
          name: nameField("addresses"),
          account_id: {
            default: "",
            labelText: "Account ID",
            invalid: function (stateData) {
              return invalidCbrZone("account_id", stateData);
            },
          },
          location: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("location", stateData);
            },
            invalidText: invalidCbrZoneText("location"),
          },
          service_name: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_name", stateData);
            },
            invalidText: invalidCbrZoneText("service_name"),
          },
          service_type: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_type", stateData);
            },
            invalidText: invalidCbrZoneText("service_type"),
          },
          service_instance: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_instance", stateData);
            },
            invalidText: invalidCbrZoneText("service_instance"),
          },
          type: {
            default: "ipAddress",
            type: "select",
            groups: ["IP Address", "IP Range", "Subnet", "Vpc", "Service Ref"],
            onRender: cbrTitleCase("type"),
            onInputChange: cbrSaveType("type"),
          },
          value: {
            default: "",
            placeholder: function (stateData) {
              return cbrValuePlaceholder(stateData.type);
            },
            invalid: function (stateData) {
              return invalidCbrZone("value", stateData);
            },
            invalidText: function (stateData) {
              return cbrValueInvalidText(stateData.type, stateData.value);
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
          "exclusions",
        ),
        schema: {
          name: nameField("exclusions"),
          account_id: {
            default: "",
            labelText: "Account ID",
            invalid: function (stateData) {
              return invalidCbrZone("account_id", stateData);
            },
          },
          location: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("location", stateData);
            },
            invalidText: invalidCbrZoneText("location"),
          },
          service_name: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_name", stateData);
            },
            invalidText: invalidCbrZoneText("service_name"),
          },
          service_type: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_type", stateData);
            },
            invalidText: invalidCbrZoneText("service_type"),
          },
          service_instance: {
            default: "",
            invalid: function (stateData) {
              return invalidCbrZone("service_instance", stateData);
            },
            invalidText: invalidCbrZoneText("service_instance"),
          },
          type: {
            default: "ipAddress",
            type: "select",
            groups: ["IP Address", "IP Range", "Subnet", "Vpc", "Service Ref"],
            onRender: cbrTitleCase("type"),
            onInputChange: cbrSaveType("type"),
          },
          value: {
            default: "",
            placeholder: function (stateData) {
              return cbrValuePlaceholder(stateData.type);
            },
            invalid: function (stateData) {
              return invalidCbrZone("value", stateData);
            },
            invalidText: function (stateData) {
              return cbrValueInvalidText(stateData.type, stateData.value);
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
  invalidCbrZoneText,
  cbrValueInvalidText,
};
