const { contains, containsKeys, carve } = require("lazy-z");
const { newDefaultTg } = require("./defaults");
const { updateChild, pushAndUpdate, carveChild } = require("./store.utils");

/**
 * initialize transit gateway
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function transitGatewayInit(config) {
  config.store.json.transit_gateways = [];
  config.store.json.transit_gateways.push(newDefaultTg());
}

/**
 * transit gateway on store update
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function transitGatewayOnStoreUpdate(config) {
  config.store.json.transit_gateways.forEach(gateway => {
    gateway.connections.forEach(connection => {
      if (connection.vpc && !contains(config.store.vpcList, connection.vpc)) {
        // if vpc not there
        carve(gateway.connections, "vpc", connection.vpc); // remove from list of connections
      }
    });
    if (!contains(config.store.resourceGroups, gateway.resource_group)) {
      // if unfound rg set to null
      gateway.resource_group = null;
    }
  });
}

/**
 * transit gateway save
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {object} stateData
 * @param {object} componentProps
 */
function transitGatewaySave(config, stateData, componentProps) {
  updateChild(config, "transit_gateways", stateData, componentProps);
}

/**
 * create a new key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function transitGatewayCreate(config, stateData) {
  pushAndUpdate(config, "transit_gateways", stateData);
}

/**
 * delete key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function transitGatewayDelete(config, stateData, componentProps) {
  carveChild(config, "transit_gateways", componentProps);
}

module.exports = {
  transitGatewayInit,
  transitGatewayOnStoreUpdate,
  transitGatewaySave,
  transitGatewayCreate,
  transitGatewayDelete
};
