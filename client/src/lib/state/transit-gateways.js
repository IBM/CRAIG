const {
  contains,
  carve,
  splatContains,
  splat,
  getObjectFromArray,
  distinct,
} = require("lazy-z");
const { newDefaultTg } = require("./defaults");
const { edgeRouterEnabledZones } = require("../constants");
const { invalidCrnList } = require("../forms");
const { resourceGroupsField, nameField } = require("./utils");

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
    if (gateway.use_data === undefined) {
      gateway.use_data = false;
    }
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
 * handle connection state changes for tgw
 * @param {string} field field to search for ex. vpc
 * @param {string} fieldName name on state object ex. vpc_connections
 * @return {Function} on state change function
 */
function onConnectionStateChange(field, fieldName) {
  return function (stateData, componentProps) {
    let newConnections = [];
    stateData.connections.forEach((connection) => {
      if (!connection[field]) newConnections.push(connection);
    });
    stateData[fieldName].forEach((item) => {
      newConnections.push({ tgw: stateData.name, [field]: item });
    });
    stateData.connections = newConnections;
    delete stateData[fieldName];
  };
}

/**
 * hide when use data
 * @param {*} stateData
 * @returns
 */
function hideWhenUseData(stateData) {
  return stateData.use_data;
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
      use_data: {
        default: false,
        type: "toggle",
        labelText: "Use Exsiting Transit Gateway",
      },
      name: nameField("transit_gateways"),
      resource_group: resourceGroupsField(hideWhenUseData),
      global: {
        default: true,
        type: "toggle",
        labelText: "Global Routing",
        tooltip: {
          align: "right",
          content:
            "Must be enabled in order to connect your IBM Cloud and on-premises networks in all IBM Cloud multizone regions.",
        },
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
      connections: {
        default: [],
      },
      vpc_connections: {
        labelText: "VPC Connections",
        type: "multiselect",
        optional: true,
        groups: function (stateData, componentProps) {
          let vpcList = splat(componentProps.craig.store.json.vpcs, "name");
          // for each transit gateway
          componentProps.craig.store.json.transit_gateways.forEach((tgw) => {
            // for each connection
            tgw.connections.forEach((connection) => {
              // remove vpc from list if the VPC is found in another transit gateway
              // with the same global value
              if (
                contains(vpcList, connection.vpc) &&
                tgw.global === stateData.global &&
                (componentProps.isModal ||
                  tgw.name !== componentProps.data.name)
              ) {
                vpcList.splice(vpcList.indexOf(connection.vpc), 1);
              }
            });
          });
          return vpcList;
        },
        onRender: function (stateData, componentProps) {
          return splat(
            stateData.connections.filter((connection) => {
              if (connection.vpc) return connection;
            }),
            "vpc"
          );
        },
        onStateChange: onConnectionStateChange("vpc", "vpc_connections"),
      },
      power_connections: {
        optional: true,
        labelText: "Connected Power Workspaces",
        type: "multiselect",
        groups: function (stateData, componentProps) {
          let foundPowerConnections = [];
          componentProps.craig.store.json.transit_gateways.forEach(
            (gateway) => {
              gateway.connections.forEach((connection) => {
                if (
                  gateway.global === stateData.global &&
                  connection.power &&
                  (componentProps.isModal ||
                    componentProps.data.name !== gateway.name)
                ) {
                  foundPowerConnections.push(connection.power);
                }
              });
            }
          );

          return splat(
            componentProps.craig.store.json.power.filter((workspace) => {
              if (
                contains(edgeRouterEnabledZones, workspace.zone) &&
                !contains(foundPowerConnections, workspace.name)
              )
                return workspace;
            }),
            "name"
          );
        },
        onRender: function (stateData) {
          return splat(
            stateData.connections.filter((connection) => {
              if (connection.power) return connection;
            }),
            "power"
          );
        },
        onStateChange: onConnectionStateChange("power", "power_connections"),
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
