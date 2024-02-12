const {
  contains,
  carve,
  splatContains,
  splat,
  getObjectFromArray,
  revision,
} = require("lazy-z");
const { newDefaultTg } = require("../defaults");
const { edgeRouterEnabledZones } = require("../../constants");
const { invalidCrnList } = require("../../forms");
const {
  resourceGroupsField,
  nameField,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
} = require("../utils");
const {
  pushToChildFieldModal,
  updateSubChild,
  deleteSubChild,
} = require("../store.utils");
const { greTunnelSchema } = require("./gre-tunnel-schema");
const { prefixFiltersSchema } = require("./prefix-filters-schema");

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
    if (!gateway.prefix_filters) {
      gateway.prefix_filters = [];
    } else {
      gateway.prefix_filters.forEach((filter) => {
        filter.tgw = gateway.name;
      });
    }
    if (!gateway.gre_tunnels) {
      gateway.gre_tunnels = [];
    } else {
      gateway.gre_tunnels.forEach((tunnel) => {
        if (
          !splatContains(
            config.store.json.classic_gateways,
            "name",
            tunnel.gateway
          )
        )
          tunnel.gateway = null;
        tunnel.tgw = gateway.name;
      });
    }
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
 * get vpc connection groups
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Array<string>}
 */
function vpcConnectionGroups(stateData, componentProps) {
  let vpcList = splat(componentProps.craig.store.json.vpcs, "name");
  // for each transit gateway
  componentProps.craig.store.json.transit_gateways.forEach((tgw) => {
    // for each connection
    tgw.connections.forEach((connection) => {
      // remove vpc from list if the VPC is found in another transit gateway
      // with the same global value
      if (
        // if the vpc list las the connection vpc
        contains(vpcList, connection.vpc) &&
        // the transit gateway and state data are global
        tgw.global === stateData.global &&
        stateData.global &&
        // and transit gateway name is not the one being edited
        (componentProps.isModal || tgw.name !== componentProps.data.name)
      ) {
        vpcList.splice(vpcList.indexOf(connection.vpc), 1);
      }
    });
  });
  return vpcList;
}

/**
 * get power connection groups
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Array<string>}
 */
function powerConnectionGroups(stateData, componentProps) {
  let foundPowerConnections = [];
  componentProps.craig.store.json.transit_gateways.forEach((gateway) => {
    gateway.connections.forEach((connection) => {
      if (
        gateway.global === stateData.global &&
        stateData.global &&
        connection.power &&
        (componentProps.isModal || componentProps.data.name !== gateway.name)
      ) {
        foundPowerConnections.push(connection.power);
      }
    });
  });

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
}

/**
 * create gre tunnel
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function greTunnelCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "transit_gateways",
    "gre_tunnels",
    stateData,
    componentProps
  );
}

/**
 * save gre tunnel
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function greTunnelSave(config, stateData, componentProps) {
  new revision(config.store.json)
    .child("transit_gateways", componentProps.arrayParentName)
    // need to look up by gw since name is not added to gre connections
    .updateChild(
      "gre_tunnels",
      componentProps.data.gateway,
      "gateway",
      stateData
    );
}

/**
 * delete gre tunnel
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function greTunnelDelete(config, stateData, componentProps) {
  if (componentProps.data.gateway) {
    new revision(config.store.json)
      .child("transit_gateways", componentProps.arrayParentName)
      .child("gre_tunnels")
      .deleteArrChild(componentProps.data.gateway, "gateway");
  } else {
    // use new revision here to allow for delete arr child
    new revision(config.store.json)
      .child("transit_gateways", componentProps.arrayParentName)
      .child("gre_tunnels")
      .then((data) => {
        let nullTunnelIndex = false;
        data.forEach((tunnel, index) => {
          if (tunnel.gateway === null) {
            nullTunnelIndex = index;
          }
        });
        data.splice(nullTunnelIndex, 1);
      });
  }
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
        labelText: "Use Existing Transit Gateway",
      },
      name: nameField("transit_gateways"),
      resource_group: resourceGroupsField(false, {
        invalid: function (stateData) {
          return stateData.use_data
            ? false
            : fieldIsNullOrEmptyString("resource_group")(stateData);
        },
      }),
      global: {
        default: true,
        type: "toggle",
        labelText: "Global Routing",
        tooltip: {
          align: "right",
          content:
            "Must be enabled in order to connect your IBM Cloud and on-premises networks in all IBM Cloud multizone regions.",
        },
        onInputChange: function (stateData) {
          stateData.connections = [];
          return !stateData.global;
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
        groups: vpcConnectionGroups,
        onRender: function (stateData, componentProps) {
          return splat(
            stateData.connections.filter((connection) => {
              if (connection.vpc) return connection;
            }),
            "vpc"
          );
        },
        onStateChange: onConnectionStateChange("vpc", "vpc_connections"),
        forceUpdateKey: function (stateData) {
          return String(stateData.global);
        },
      },
      power_connections: {
        optional: true,
        labelText: "Connected Power Workspaces",
        type: "multiselect",
        groups: powerConnectionGroups,
        onRender: function (stateData) {
          return splat(
            stateData.connections.filter((connection) => {
              if (connection.power) return connection;
            }),
            "power"
          );
        },
        onStateChange: onConnectionStateChange("power", "power_connections"),
        forceUpdateKey: function (stateData) {
          return String(stateData.global);
        },
      },
    },
    subComponents: {
      gre_tunnels: {
        create: greTunnelCreate,
        save: greTunnelSave,
        delete: greTunnelDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["gateway", "remote_tunnel_ip", "local_tunnel_ip", "zone"],
          "transit_gateways",
          "gre_tunnels"
        ),
        schema: greTunnelSchema(),
      },
      prefix_filters: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "transit_gateways",
            "prefix_filters",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "transit_gateways",
            "prefix_filters",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(
            config,
            "transit_gateways",
            "prefix_filters",
            componentProps
          );
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "connection_type", "target", "action", "prefix"],
          "transit_gateways",
          "prefix_filters"
        ),
        schema: prefixFiltersSchema(),
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
