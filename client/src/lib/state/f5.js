const {
  contains,
  eachKey,
  isEmpty,
  eachZone,
  transpose,
  revision,
  isNullOrEmptyString,
} = require("lazy-z");
const { newF5Vsi } = require("../builders");
const {
  hasUnfoundVpc,
  setValidSshKeys,
  setUnfoundEncryptionKey,
  setUnfoundResourceGroup,
} = require("./store.utils");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  unconditionalInvalidText,
} = require("./utils");
const { isValidUrl } = require("../forms");
const { RegexButWithWords } = require("regex-but-with-words");

const tmosAdminPasswordValidationExp = new RegexButWithWords()
  .stringBegin()
  .look.ahead((exp) => {
    exp.any().anyNumber().set("a-z");
  })
  .look.ahead((exp) => {
    exp.any().anyNumber().set("A-Z");
  })
  .look.ahead((exp) => {
    exp.any().anyNumber().set("0-9");
  })
  .any(15, "*")
  .stringEnd()
  .done("g");

/**
 * initialize f5
 * @param {lazyZState} config landing zone store
 */
function f5Init(config) {
  config.store.json.f5_vsi = [];
}

/**
 * F5 On Store Update Function
 * @param {lazyZState} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {string} config.store.json.f5_vsi.vpc
 * @param {string} config.store.json.f5_vsi.subnet
 * @param {object} config.store.subnets map of vpc subnets
 */
function f5OnStoreUpdate(config) {
  config.store.json.f5_vsi.forEach((instance) => {
    if (hasUnfoundVpc(config, instance)) {
      // if vpc no longer exists reinitialize fields
      instance.vpc = null;
      instance.subnet = null;
      instance.template.vpc = null;
      instance.network_interfaces = [];
    }

    setUnfoundEncryptionKey(config, instance, "encryption_key");
    setValidSshKeys(config, instance);
    setUnfoundResourceGroup(config, instance);
  });
}

/**
 * create f5 vsi deployments across zones
 * @param {lazyZState} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.ssh_keys
 * @param {Array<string>} config.store.encryptionKeys
 * @param {string} config.store.edge_pattern pattern for edge network configuration
 * @param {object} stateData component state data
 * @param {boolean} stateData.useManagement use management vpc
 * @param {number} stateData.zones number of zones
 */
function f5VsiCreate(config, stateData) {
  let useManagement = stateData.edgeType === "management";
  let zones = stateData.zones;
  config.store.json.f5_vsi = [];
  config.store.f5_on_management = useManagement;
  // add encryption key if not
  if (!contains(config.store.encryptionKeys, "vsi-volume-key")) {
    config.store.json.key_management[0].keys.push({
      key_ring: "ring",
      name: "vsi-volume-key",
      root_key: true,
      force_delete: null,
      endpoint: "public",
      rotation: 1,
      dual_auth_delete: false,
    });
    config.store.encryptionKeys.push("vsi-volume-key");
  }
  if (isEmpty(config.store.json.ssh_keys)) {
    config.store.json.ssh_keys.push({
      name: "ssh-key",
      public_key: "<user-determined-value>",
    });
  }
  eachZone(zones || 3, (zone) => {
    config.store.json.f5_vsi.push(
      newF5Vsi(config.store.edge_pattern, zone, useManagement, stateData)
    );
  });
}

/**
 * save f5 vsi deployment configuration
 * @param {lazyZState} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {string} config.store.edge_pattern pattern for edge network configuration
 * @param {boolean} config.store.f5_on_management use management vpc
 * @param {object} stateData component state data
 * @param {number} stateData.zones number of zones
 */
function f5VsiSave(config, stateData) {
  config.store.json.f5_vsi = [];
  eachZone(stateData.zones, (zone) => {
    config.store.json.f5_vsi.push(
      newF5Vsi(
        config.store.edge_pattern,
        zone,
        config.store.f5_on_management,
        stateData
      )
    );
  });
}

/**
 * save a single f5 vsi instance
 * @param {lazyZState} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 * @param {string} stateData.boot_volume_encryption_key_name
 */
function f5TemplateSave(config, stateData, componentProps) {
  eachKey(stateData, (key) => {
    if (key === "tmos_admin_password" && stateData.tmos_admin_password === "") {
      stateData.tmos_admin_password = null;
    } else if (stateData[key] === "") {
      stateData[key] = "null";
    }
  });
  config.store.json.f5_vsi.forEach((vsi) => {
    transpose(stateData, vsi.template);
  });
}

/**
 * save a single f5 vsi instance
 * @param {lazyZState} config  store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.f5_vsi
 * @param {object} stateData component state data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 * @param {string} stateData.encryption_key
 */
function f5InstanceSave(config, stateData) {
  new revision(config.store.json)
    .child("f5_vsi", stateData.name)
    .then((data) => {
      data.resource_group = stateData.resource_group;
      data.encryption_key = stateData.encryption_key;
    });
}

/**
 * shortcut function to check if a field is null or empty string based
 * on license type
 * @param {string} licenseType
 * @param {string} field
 * @returns {Function}
 */
function licenseTypeFieldCheck(licenseType, field) {
  return function (stateData) {
    // check overlapping fields for regkeypool and utility pool
    let licenseTypeCheck =
      contains(["regkeypool", "utilitypool"], licenseType) &&
      contains(["license_host", "license_pool", "license_username"], field)
        ? true
        : stateData.license_type === licenseType;
    return licenseTypeCheck
      ? isNullOrEmptyString(stateData[field], true)
      : false;
  };
}

/**
 * shortcut function to test if field is url
 * @param {string} field
 * @returns {Function}
 */
function fieldIsValidUrl(field) {
  return function (stateData) {
    return !isValidUrl(stateData[field]);
  };
}

/**
 * hide field when license is not the correct type
 * @param {Array<string>} types list to hide
 * @returns {Function}
 */
function hideWhenNotLicenseType(types) {
  return function (stateData) {
    return !contains(types, stateData.license_type);
  };
}

/**
 * init f5 store
 * @param {*} store
 */
function initF5Store(store) {
  store.newField("f5", {
    init: f5Init,
    onStoreUpdate: f5OnStoreUpdate,
    subComponents: {
      instance: {
        save: f5InstanceSave,
      },
      vsi: {
        create: f5VsiCreate,
        save: f5VsiSave,
        shouldDisableSave: shouldDisableComponentSave(
          ["ssh_keys"],
          "f5",
          "vsi"
        ),
        schema: {
          ssh_keys: {
            default: [],
            invalid: function (stateData) {
              return isEmpty(stateData.ssh_keys || []);
            },
          },
        },
      },
      template: {
        save: f5TemplateSave,
        shouldDisableSave: shouldDisableComponentSave(
          [
            "license_type",
            "tmos_admin_password",
            "template_source",
            "template_version",
            "byol_license_basekey",
            "license_username",
            "license_host",
            "license_pool",
            "license_unit_of_measure",
            "ts_declaration_url",
            "do_declaration_url",
            "as3_declaration_url",
            "phone_home_url",
            "tgstandby_url",
            "tgrefresh_url",
            "tgactive_url",
            "license_password",
            "app_id",
          ],
          "f5",
          "template"
        ),
        schema: {
          license_type: {
            default: "",
            invalid: fieldIsNullOrEmptyString("license_type"),
            invalidText: selectInvalidText("license type"),
            type: "select",
            groups: ["none", "byol", "regkeypool", "utilitypool"],
            tooltip: {
              content: "The type of license.",
              align: "right",
            },
          },
          tmos_admin_password: {
            default: "",
            tooltip: {
              content: "The admin account password for the F5 BIG-IP instance.",
              align: "right",
            },
            invalidText: unconditionalInvalidText(
              "Password must be at least 15 characters, contain one numeric, one uppercase, and one lowercase character."
            ),
            invalid: function (stateData) {
              return (
                isNullOrEmptyString(stateData.tmos_admin_password, true) ||
                stateData.tmos_admin_password.match(
                  tmosAdminPasswordValidationExp
                ) === null
              );
            },
          },
          template_version: {
            default: "",
            invalid: licenseTypeFieldCheck("none", "template_version"),
            invalidText: unconditionalInvalidText("Enter a template version"),
            tooltip: {
              content:
                "The terraform template version for phone_home_url_metadata.",
              align: "top-left",
            },
          },
          template_source: {
            default: "",
            invalid: licenseTypeFieldCheck("none", "template_source"),
            invalidText: unconditionalInvalidText("Enter a template source"),
            tooltip: {
              content:
                "The terraform template source for phone_home_url_metadata.",
            },
          },
          byol_license_basekey: {
            default: "",
            invalid: licenseTypeFieldCheck("byol", "byol_license_basekey"),
            invalidText: unconditionalInvalidText("Enter a license basekey"),
            hideWhen: hideWhenNotLicenseType(["byol"]),
            labelText: "BYOL License Basekey",
          },
          license_username: {
            default: "",
            invalid: licenseTypeFieldCheck("regkeypool", "license_username"),
            invalidText: unconditionalInvalidText("Enter a license username"),
            hideWhen: hideWhenNotLicenseType(["regkeypool", "utilitypool"]),
            tooltip: {
              content:
                "BIGIQ username to use for the pool based licensing of the F5 BIG-IP instance.",
              align: "top-left",
            },
          },
          license_password: {
            default: "",
            invalid: licenseTypeFieldCheck("regkeypool", "license_username"),
            invalidText: unconditionalInvalidText("Enter a license password"),
            hideWhen: hideWhenNotLicenseType(["regkeypool", "utilitypool"]),
            tooltip: {
              content:
                "BIGIQ password to use for the pool based licensing of the F5 BIG-IP instance.",
            },
          },
          license_host: {
            default: "",
            invalid: licenseTypeFieldCheck("utilitypool", "license_host"),
            invalidText: unconditionalInvalidText("Enter a license host"),
            hideWhen: hideWhenNotLicenseType(["regkeypool", "utilitypool"]),
            tooltip: {
              content:
                "BIGIQ IP or hostname to use for pool based licensing of the F5 BIG-IP instance.",
              align: "top-left",
            },
          },
          license_pool: {
            default: "",
            invalid: licenseTypeFieldCheck("regkeypool", "license_pool"),
            invalidText: unconditionalInvalidText("Enter a license pool"),
            hideWhen: hideWhenNotLicenseType(["regkeypool", "utilitypool"]),
            tooltip: {
              content:
                "BIGIQ license pool name for the licensing of the F5 BIG-IP instance.",
            },
          },
          license_unit_of_measure: {
            default: "",
            invalid: licenseTypeFieldCheck(
              "utilitypool",
              "license_unit_of_measure"
            ),
            invalidText: unconditionalInvalidText(
              "Enter a license unit of measure"
            ),
            hideWhen: hideWhenNotLicenseType(["utilitypool"]),
            tooltip: {
              content: "BIGIQ utility pool unit of measurement.",
              align: "top-right",
            },
          },
          license_sku_keyword_1: {
            default: "",
            invalid: licenseTypeFieldCheck(
              "utilitypool",
              "license_sku_keyword_1"
            ),
            hideWhen: hideWhenNotLicenseType(["utilitypool"]),
            invalidText: unconditionalInvalidText("Enter a license keyword"),
            tooltip: {
              content:
                "BIGIQ primary SKU for ELA utility licensing of the F5 BIG-IP instance.",
            },
            labelText: "License SKU Keyword 1",
          },
          license_sku_keyword_2: {
            default: "",
            invalid: licenseTypeFieldCheck(
              "utilitypool",
              "license_sku_keyword_2"
            ),
            invalidText: unconditionalInvalidText("Enter a license keyword"),
            hideWhen: hideWhenNotLicenseType(["utilitypool"]),
            tooltip: {
              content:
                "BIGIQ secondary SKU for ELA utility licensing of the F5 BIG-IP instance",
            },
            labelText: "License SKU Keyword 2",
          },
          ts_declaration_url: {
            default: "",
            invalid: fieldIsValidUrl("ts_declaration_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            tooltip: {
              content:
                "The URL to retrieve the f5-telemetry-streaming JSON declaration.",
              align: "top-left",
              labelText: "TS Declaration URL",
            },
          },
          do_declaration_url: {
            default: "",
            invalid: fieldIsValidUrl("do_declaration_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            tooltip: {
              content:
                "The URL to retrieve the f5-declarative-onboarding JSON declaration.",
              align: "top-left",
            },
            labelText: "DO Declaration URL",
          },
          as3_declaration_url: {
            default: "",
            invalid: fieldIsValidUrl("as3_declaration_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            tooltip: {
              content:
                "The URL to retrieve the f5-appsvcs-extension JSON declaration.",
            },
            labelText: "AS3 Declaration URL",
          },
          phone_home_url: {
            default: "",
            invalid: fieldIsValidUrl("phone_home_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            tooltip: {
              content:
                "The URL to POST status when BIG-IP is finished onboarding.",
            },
            labelText: "Phone Home URL",
          },
          tgstandby_url: {
            default: "",
            invalid: fieldIsValidUrl("tgstandby_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            labelText: "TGStandby URL",
            tooltip: {
              content:
                "The URL to POST L3 addresses when tgstandby is triggered.",
            },
          },
          tgrefresh_url: {
            default: "",
            invalid: fieldIsValidUrl("tgrefresh_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            tooltip: {
              content:
                "The URL to POST L3 addresses when tgrefresh is triggered.",
              align: "top-left",
            },
            labelText: "TGRefresh URL",
          },
          tgactive_url: {
            default: "",
            invalid: fieldIsValidUrl("tgactive_url"),
            invalidText: unconditionalInvalidText("Enter a valid URL"),
            tooltip: {
              content:
                "The URL to POST L3 addresses when tgactive is triggered.",
            },
            labelText: "TGActive URL",
          },
          app_id: {
            default: "",
            invalid: fieldIsNullOrEmptyString("app_id"),
            labelText: "App ID",
            tooltip: {
              content:
                "The terraform application id for phone_home_url_metadata.",
              align: "top-right",
            },
          },
        },
      },
    },
  });
}

module.exports = {
  f5Init,
  f5OnStoreUpdate,
  f5VsiCreate,
  f5VsiSave,
  f5InstanceSave,
  f5TemplateSave,
  initF5Store,
};
