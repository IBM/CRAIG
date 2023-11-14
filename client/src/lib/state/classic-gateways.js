const { splatContains, isEmpty, isWholeNumber, isInRange } = require("lazy-z");
const { invalidName, invalidNameText } = require("../forms");
const { RegexButWithWords } = require("regex-but-with-words");
const { fieldIsNullOrEmptyString } = require("./utils");

/**
 * init store
 * @param {*} config
 */
function classicGatewayInit(config) {
  config.store.json.classic_gateways = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicGatewayOnStoreUpdate(config) {
  if (config.store.json.classic_gateways) {
    config.store.json.classic_gateways.forEach((gateway) => {
      ["private_vlan", "public_vlan"].forEach((field) => {
        if (
          !splatContains(
            config.store.json.classic_vlans,
            "name",
            gateway[field]
          )
        ) {
          gateway[field] = null;
        }
        if (
          !splatContains(
            config.store.json.classic_ssh_keys,
            "name",
            gateway.ssh_key
          )
        )
          gateway.ssh_key = null;
      });
    });
  } else config.store.json.classic_gateways = [];
}

/**
 * create classic gateway
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicGatewayCreate(config, stateData, componentProps) {
  config.push(["json", "classic_gateways"], stateData);
}

/**
 * save classic gateway
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicGatewaySave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_gateways"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete classic gateway
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicGatewayDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_gateways"], componentProps.data.name);
}

/**
 * classic gateway should be disabled
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should be disabled
 */
function classicGatewayShouldDisableSave(config, stateData, componentProps) {
  let shouldBeDisabled = false;
  [
    "name",
    "domain",
    "datacenter",
    "network_speed",
    "public_bandwidth",
    "package_key_name",
    "os_key_name",
    "process_key_name",
    "public_vlan",
    "private_vlan",
    "ssh_key",
    "disk_key_names",
    "memory",
  ].forEach((field) => {
    if (!shouldBeDisabled) {
      shouldBeDisabled = config.classic_gateways[field].invalid(
        stateData,
        componentProps
      );
    }
  });
  return shouldBeDisabled;
}

/**
 * init classic gateway store
 * @param {*} store
 */
function initClassicGateways(store) {
  store.newField("classic_gateways", {
    init: classicGatewayInit,
    onStoreUpdate: classicGatewayOnStoreUpdate,
    create: classicGatewayCreate,
    save: classicGatewaySave,
    delete: classicGatewayDelete,
    shouldDisableSave: classicGatewayShouldDisableSave,
    schema: {
      name: {
        default: "",
        invalid: invalidName("classic_gateways"),
        invalidText: invalidNameText("classic_gateways"),
      },
      domain: {
        default: "",
        invalid: function (stateData) {
          return (
            stateData.domain.match(
              new RegexButWithWords()
                .stringBegin()
                .set("a-z")
                .oneOrMore()
                .literal(".")
                .set("a-z")
                .oneOrMore()
                .stringEnd()
                .done("g")
            ) === null
          );
        },
        invalidText: function () {
          return "Enter a valid domain";
        },
      },
      datacenter: {
        default: "",
        invalid: fieldIsNullOrEmptyString("datacenter"),
      },
      network_speed: {
        // can be 100 mbps or 10 gbps
        default: "",
        invalid: fieldIsNullOrEmptyString("network_speed"),
      },
      public_bandwidth: {
        // can be 20000, 10000, 1000, 500, 5000 (gb)
        default: "",
        invalid: fieldIsNullOrEmptyString("public_bandwidth"),
      },
      memory: {
        default: 64,
        invalid: function (stateData) {
          let mem = parseFloat(stateData.memory);
          return !isWholeNumber(mem) || !isInRange(mem, 64, 1024);
        },
        invalidText: function () {
          return "Memory must be a whole number between 64 and 1024";
        },
      },
      package_key_name: {
        default: "",
        invalid: fieldIsNullOrEmptyString("package_key_name"),
      },
      os_key_name: {
        default: "",
        invalid: fieldIsNullOrEmptyString("os_key_name"),
      },
      process_key_name: {
        default: "",
        invalid: fieldIsNullOrEmptyString("process_key_name"),
      },
      private_vlan: {
        default: "",
        invalid: fieldIsNullOrEmptyString("private_vlan"),
      },
      ssh_key: {
        default: "",
        invalid: fieldIsNullOrEmptyString("ssh_key"),
      },
      public_vlan: {
        default: "",
        invalid: function (stateData) {
          return stateData.private_network_only
            ? false
            : fieldIsNullOrEmptyString("public_vlan")(stateData);
        },
      },
      disk_key_names: {
        default: [],
        invalid: function (stateData) {
          return isEmpty(stateData.disk_key_names);
        },
      },
    },
  });
}

module.exports = {
  classicGatewayInit,
  classicGatewayOnStoreUpdate,
  classicGatewayCreate,
  classicGatewaySave,
  classicGatewayDelete,
  initClassicGateways,
};
