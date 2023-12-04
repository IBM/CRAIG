const { contains } = require("lazy-z");
const { setUnfoundResourceGroup, hasUnfoundVpc } = require("./store.utils");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
} = require("./utils");
const { invalidName, invalidNameText } = require("../forms");

/**
 * initialize vpn gateway
 * @param {lazyZState} config landing zone store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function vpnInit(config) {
  config.store.json.vpn_gateways = [
    {
      name: "management-gateway",
      resource_group: "management-rg",
      subnet: "vpn-zone-1",
      vpc: "management",
    },
  ];
}

/**
 * on store update
 * @param {lazyZState} config landing zone store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.vpn_gateways
 */
function vpnOnStoreUpdate(config) {
  config.store.json.vpn_gateways.forEach((gateway) => {
    if (hasUnfoundVpc(config, gateway)) {
      // if the vpc no longer exists, set vpc and subnet to null
      gateway.vpc = null;
      gateway.subnet = null;
    } else if (!contains(config.store.subnets[gateway.vpc], gateway.subnet)) {
      // if subnet does not exist but vpc does set to null
      gateway.subnet = null;
    }
    setUnfoundResourceGroup(config, gateway);
  });
}

/**
 * create a new vpn gateway
 * @param {lazyZState} config landing zone store
 * @param {object} stateData component state data
 */
function vpnCreate(config, stateData) {
  config.push(["json", "vpn_gateways"], stateData);
}

/**
 * update existing vpn gateway
 * @param {lazyZState} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "vpn_gateways"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete vpn gateway
 * @param {lazyZState} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnDelete(config, stateData, componentProps) {
  config.carve(["json", "vpn_gateways"], componentProps.data.name);
}

/**
 * init vpn gateway store
 * @param {*} store
 */
function initVpnGatewayStore(store) {
  store.newField("vpn_gateways", {
    init: vpnInit,
    onStoreUpdate: vpnOnStoreUpdate,
    create: vpnCreate,
    save: vpnSave,
    delete: vpnDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "vpc", "resource_group", "subnet"],
      "vpn_gateways"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("vpn_gateways"),
        invaidText: invalidNameText("vpn_gateways"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      vpc: {
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
      },
      subnet: {
        default: "",
        invalid: fieldIsNullOrEmptyString("subnet"),
      },
    },
  });
}

module.exports = {
  vpnInit,
  vpnOnStoreUpdate,
  vpnCreate,
  vpnSave,
  vpnDelete,
  initVpnGatewayStore,
};
