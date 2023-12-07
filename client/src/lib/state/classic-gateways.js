const {
  splatContains,
  isEmpty,
  isWholeNumber,
  isInRange,
  splat,
} = require("lazy-z");
const { invalidName, invalidNameText } = require("../forms");
const { RegexButWithWords } = require("regex-but-with-words");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  unconditionalInvalidText,
  selectInvalidText,
} = require("./utils");
const { datacenters } = require("../constants");

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
  config.store.json.transit_gateways.forEach((tgw) => {
    tgw.gre_tunnels.forEach((tunnel) => {
      if (tunnel.gateway === componentProps.data.name) {
        tunnel.gateway = stateData.name;
      }
    });
  });
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
 * classic vlan filter function
 * @param {string} type
 * @returns {Function} groups function
 */
function classicVlanFilter(type) {
  return function (stateData, componentProps) {
    return splat(
      componentProps.craig.store.json.classic_vlans.filter((vlan) => {
        if (vlan.datacenter === stateData.datacenter && vlan.type === type)
          return vlan;
      }),
      "name"
    );
  };
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
    shouldDisableSave: shouldDisableComponentSave(
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
      ],
      "classic_gateways"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("classic_gateways"),
        invalidText: invalidNameText("classic_gateways"),
        helperText: function (stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-gateway-${stateData.name}`;
        },
        size: "small",
      },
      domain: {
        default: "",
        invalid: function (stateData) {
          return (
            // prevent returning error
            (stateData.domain || "").match(
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
        invalidText: unconditionalInvalidText("Enter a valid domain"),
        size: "small",
      },
      datacenter: {
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("datacenter"),
        invalidText: selectInvalidText("datacenter"),
        onStateChange: function (stateData) {
          stateData.private_vlan = "";
          stateData.public_vlan = "";
        },
        groups: datacenters,
        size: "small",
      },
      network_speed: {
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("network_speed"),
        invalidText: selectInvalidText("network speed"),
        groups: ["1000", "10000"],
        size: "small",
      },
      public_bandwidth: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("public_bandwidth"),
        invalidText: selectInvalidText("public bandwidth value"),
        groups: ["500", "1000", "5000", "10000", "20000"],
        size: "small",
      },
      memory: {
        default: "64",
        invalid: function (stateData) {
          let mem = parseFloat(stateData.memory);
          return !isWholeNumber(mem) || !isInRange(mem, 64, 1024);
        },
        invalidText: function () {
          return "Memory must be a whole number between 64 and 1024";
        },
        size: "small",
      },
      package_key_name: {
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("package_key_name"),
        invalidText: selectInvalidText("package key name"),
        groups: ["VIRTUAL_ROUTER_APPLIANCE_1_GPBS"],
        size: "small",
      },
      os_key_name: {
        labelText: "OS Key Name",
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("os_key_name"),
        invalidText: unconditionalInvalidText("Select an OS Key name"),
        size: "small",
        groups: ["OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV"],
      },
      process_key_name: {
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("process_key_name"),
        invalidText: selectInvalidText("process key name"),
        groups: ["INTEL_XEON_4210_2_20"],
        size: "small",
      },
      private_vlan: {
        labelText: "Private VLAN",
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("private_vlan"),
        invalidText: selectInvalidText("private VLAN"),
        groups: classicVlanFilter("PRIVATE"),
        size: "small",
      },
      ssh_key: {
        labelText: "SSH Key",
        default: "",
        type: "select",
        invalid: fieldIsNullOrEmptyString("ssh_key"),
        invalidText: unconditionalInvalidText("Select an SSH Key"),
        groups: function (stateData, componentProps) {
          return splat(
            componentProps.craig.store.json.classic_ssh_keys,
            "name"
          );
        },
        size: "small",
      },
      public_vlan: {
        labelText: "Public VLAN",
        default: "",
        type: "select",
        invalid: function (stateData) {
          return stateData.private_network_only
            ? false
            : fieldIsNullOrEmptyString("public_vlan")(stateData);
        },
        invalidText: selectInvalidText("public VLAN"),
        groups: classicVlanFilter("PUBLIC"),
        size: "small",
        hideWhen: function (stateData) {
          return stateData.private_network_only;
        },
      },
      disk_key_names: {
        default: [],
        type: "multiselect",
        invalid: function (stateData) {
          return isEmpty(stateData.disk_key_names);
        },
        invalidText: selectInvalidText("disk key name"),
        groups: ["HARD_DRIVE_2_00_TB_SATA_2"],
        size: "small",
      },
      private_network_only: {
        type: "toggle",
        labelText: "Private Network Only",
        default: false,
        onStateChange: function (stateData) {
          if (stateData.private_network_only !== true) {
            stateData.private_network_only = true;
            stateData.public_vlan = "";
          } else stateData.private_network_only = false;
        },
        size: "small",
      },
      tcp_monitoring: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "Enable TCP Monitoring",
      },
      redundant_network: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "Enable Redundant Network",
      },
      ipv6_enabled: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "IVP6 Enabled",
      },
      hadr: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "High Availability",
        tooltip: {
          content: "Create two network gateway members. Defaults to one",
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
