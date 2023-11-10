const {
  contains,
  carve,
  splatContains,
  splat,
  getObjectFromArray,
} = require("lazy-z");
const { newDefaultTg } = require("./defaults");
const { edgeRouterEnabledZones } = require("../constants");
const { invalidName, invalidNameText, invalidCrnList } = require("../forms");
const { fieldIsNullOrEmptyString } = require("./utils");

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
      } else if (
        connection.power &&
        !contains(splat(config.store.json.power, "name"), connection.power)
      ) {
        // remove if workspace deleted
        carve(gateway.connections, "power", connection.power);
      } else if (
        connection.power &&
        !contains(
          edgeRouterEnabledZones,
          getObjectFromArray(config.store.json.power, "name", connection.power)
            .zone
        )
      ) {
        // remove if workspace changed into non PER enabled zone
        carve(gateway.connections, "power", connection.power);
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

/**
 * tgw component should be disabled
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {bool} true if should be disabled
 */
function transitGatewayShouldDisableSave(config, stateData, componentProps) {
  let saveShouldBeDisabled = false;
  ["name", "resource_group", "crns"].forEach((field) => {
    if (!saveShouldBeDisabled) {
      saveShouldBeDisabled = config.transit_gateways[field].invalid(
        stateData,
        componentProps
      );
    }
  });
  return saveShouldBeDisabled;
}

/**
 * initialize store field for tgw
 * @param {*} store
 */
function initTransitGateway(store) {
  store.newField("transit_gateways", {
    init: transitGatewayInit,
    onStoreUpdate: transitGatewayOnStoreUpdate,
    create: transitGatewayCreate,
    save: transitGatewaySave,
    delete: transitGatewayDelete,
    shouldDisableSave: transitGatewayShouldDisableSave,
    schema: {
      name: {
        default: "",
        invalid: invalidName("transit_gateways"),
        invalidText: invalidNameText("transit_gateways"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      crns: {
        default: "",
        invalid: function (stateData) {
          return invalidCrnList(stateData.crns);
        },
        invalidText: function (stateData) {
          return invalidCrnList(stateData.crns);
        },
      },
    },
  });
}

module.exports = {
  transitGatewayInit,
  transitGatewayOnStoreUpdate,
  transitGatewaySave,
  transitGatewayCreate,
  transitGatewayDelete,
  initTransitGateway,
};
