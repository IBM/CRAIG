const { contains } = require("lazy-z");
const {
  setUnfoundResourceGroup,
  hasUnfoundVpc,
  pushAndUpdate,
  updateChild,
  carveChild
} = require("./store.utils");

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
      vpc: "management"
    }
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
  config.store.json.vpn_gateways.forEach(gateway => {
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
  pushAndUpdate(config, "vpn_gateways", stateData);
}

/**
 * update existing vpn gateway
 * @param {lazyZState} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnSave(config, stateData, componentProps) {
  updateChild(config, "vpn_gateways", stateData, componentProps);
}

/**
 * delete vpn gateway
 * @param {lazyZState} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnDelete(config, stateData, componentProps) {
  carveChild(config, "vpn_gateways", componentProps);
}

module.exports = {
  vpnInit,
  vpnOnStoreUpdate,
  vpnCreate,
  vpnSave,
  vpnDelete
};
