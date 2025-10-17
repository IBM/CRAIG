const { titleCase, splatContains, isNullOrEmptyString } = require("lazy-z");
const { datacenters } = require("../constants");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  selectInvalidText,
  sshKeySchema,
} = require("./utils");
const { nameField } = require("./reusable-fields");

/**
 * init store
 * @param {*} config
 */
function classicSshKeyInit(config) {
  config.store.json.classic_ssh_keys = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicSshKeyOnStoreUpdate(config) {
  if (!config.store.json.classic_ssh_keys) {
    config.store.json.classic_ssh_keys = [];
  } else if (
    config.store.json?.classic_ssh_keys?.length === 0 &&
    config.store.json?.classic_vlans?.length === 0
  ) {
    config.store.json._options.enable_classic = false;
  }
}

/**
 * create ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyCreate(config, stateData, componentProps) {
  config.store.json._options.enable_classic = true;
  config.push(["json", "classic_ssh_keys"], stateData);
}

/**
 * update ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyUpdate(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_ssh_keys"],
    componentProps.data.name,
    stateData,
  );
}

/**
 * delete ssh ket
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicSshKeyDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_ssh_keys"], componentProps.data.name);
}

/**
 * init store
 * @param {*} config
 */
function classicVlanInit(config) {
  config.store.json.classic_vlans = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicVlanOnStoreUpdate(config) {
  if (!config.store.json.classic_vlans) {
    config.store.json.classic_vlans = [];
  } else {
    config.store.json.classic_vlans.forEach((vlan) => {
      if (
        !splatContains(
          config.store.json.classic_vlans,
          "name",
          vlan.router_hostname,
        )
      ) {
        vlan.router_hostname = "";
      }
    });
  }
}

/**
 * create ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanCreate(config, stateData, componentProps) {
  config.store.json._options.enable_classic = true;
  config.push(["json", "classic_vlans"], stateData);
}

/**
 * update ssh key
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanUpdate(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_vlans"],
    componentProps.data.name,
    stateData,
  );
}

/**
 * delete ssh ket
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicVlanDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_vlans"], componentProps.data.name);
}

/**
 * initialize classic ssh keys and vlans
 * @param {*} store
 */
function intiClassicInfrastructure(store) {
  store.newField("classic_ssh_keys", {
    init: classicSshKeyInit,
    onStoreUpdate: classicSshKeyOnStoreUpdate,
    create: classicSshKeyCreate,
    save: classicSshKeyUpdate,
    delete: classicSshKeyDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "public_key"],
      "classic_ssh_keys",
    ),
    schema: sshKeySchema("classic_ssh_keys"),
  });

  store.newField("classic_vlans", {
    init: classicVlanInit,
    onStoreUpdate: classicVlanOnStoreUpdate,
    create: classicVlanCreate,
    save: classicVlanUpdate,
    delete: classicVlanDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "datacenter", "type"],
      "classic_vlans",
    ),
    schema: {
      name: nameField("classic_vlans"),
      type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("type"),
        type: "select",
        groups: ["Public", "Private"],
        onRender: function (stateData) {
          return isNullOrEmptyString(stateData.type, true)
            ? ""
            : titleCase(stateData.type.toLowerCase());
        },
        onInputChange: function (stateData) {
          return stateData.type.toUpperCase();
        },
        invalidText: selectInvalidText("type"),
      },
      datacenter: {
        default: "",
        invalid: fieldIsNullOrEmptyString("datacenter"),
        invalidText: selectInvalidText("datacenter"),
        groups: datacenters,
        type: "select",
      },
      router_hostname: {
        type: "select",
        default: "",
        tooltip: {
          content:
            "To create a Classic Gateway using multiple VLANS, each VLAN must be in the same zone and have the same router hostname (calculated at runtime)",
          alignModal: "left",
        },
        invalid: function () {
          return false;
        },
        groups: function (stateData, componentProps) {
          let allOtherVlansInZone = [];
          componentProps.craig.store.json.classic_vlans.forEach((vlan) => {
            if (
              vlan.datacenter === stateData.datacenter &&
              (componentProps.isModal || vlan.name !== componentProps.data.name)
            ) {
              allOtherVlansInZone.push(vlan.name);
            }
          });
          return allOtherVlansInZone;
        },
      },
    },
  });
}

module.exports = {
  classicSshKeyOnStoreUpdate,
  classicSshKeyInit,
  classicSshKeyCreate,
  classicSshKeyUpdate,
  classicSshKeyDelete,
  classicVlanInit,
  classicVlanOnStoreUpdate,
  classicVlanCreate,
  classicVlanUpdate,
  classicVlanDelete,
  intiClassicInfrastructure,
};
