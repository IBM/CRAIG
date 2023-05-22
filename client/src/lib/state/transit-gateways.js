const { contains, carve, splatContains } = require("lazy-z");
const { newDefaultTg } = require("./defaults");

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
  config.store.json.transit_gateways.forEach((gateway) => {
    if (gateway.crns) {
      gateway.crns.forEach((crn) => {
        if (!splatContains(gateway.connections, "crn", crn)) {
          gateway.connections.push({ tgw: gateway.name, crn: crn });
        }
      });
    }
    gateway.connections.forEach((connection) => {
      connection.tgw = gateway.name; // make sure name is set for tgw connection
      if (
        gateway.crns &&
        connection.crn &&
        !contains(gateway.crns, connection.crn)
      ) {
        carve(gateway.connections, "crn", connection.crn); // remove from list of connections
      }
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
  config.updateChild(
    ["json", "transit_gateways"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function transitGatewayCreate(config, stateData) {
  config.push(["json", "transit_gateways"], stateData);
}

/**
 * delete key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function transitGatewayDelete(config, stateData, componentProps) {
  config.carve(["json", "transit_gateways"], componentProps.data.name);
}

module.exports = {
  transitGatewayInit,
  transitGatewayOnStoreUpdate,
  transitGatewaySave,
  transitGatewayCreate,
  transitGatewayDelete,
};
