const { deleteUnfoundArrayItems } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  hasUnfoundVpc
} = require("./store.utils");

/**
 * initialize vpn servers in store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function vpnServerInit(config) {
  config.store.json.vpn_servers = [];
}

function vpnServerOnStoreUpdate(config) {
  config.store.json.vpn_servers.forEach(server => {
    config.setUnfound("resourceGroups", server, "resource_group");
    // update vpc
    if (hasUnfoundVpc(config, server)) {
      server.vpc = null;
      server.subnets = [];
      server.security_groups = [];
    } else {
      // otherwise check for valid subnets
      let vpcSubnets = config.store.subnets[server.vpc];
      // delete cluster subnets
      server.subnets = deleteUnfoundArrayItems(vpcSubnets, server.subnets);
      // and check for valid security groups
      let vpcSgs = config.store.securityGroups[server.vpc];
      server.security_groups = deleteUnfoundArrayItems(
        vpcSgs,
        server.security_groups
      );
    }
  });
}

/**
 * save vpn servers
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {object} stateData component state data
 */
function vpnServerSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "vpn_servers"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new vpn server
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function vpnServerCreate(config, stateData) {
  stateData.routes = [];
  config.push(["json", "vpn_servers"], stateData);
}

/**
 * delete vpn server
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnServerDelete(config, stateData, componentProps) {
  config.carve(["json", "vpn_servers"], componentProps.data.name);
}

/**
 * create new vpn server route
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {Array<string>} config.store.json.vpn_servers.routes
 * @param {object} stateData component state data
 */
function vpnServerRouteCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "vpn_servers",
    "routes",
    stateData,
    componentProps
  );
}

/**
 * update vpn server route
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {Array<string>} config.store.json.vpn_servers.routes
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function vpnServerRouteSave(config, stateData, componentProps) {
  updateSubChild(config, "vpn_servers", "routes", stateData, componentProps);
}

/**
 * delete a vpn server route
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {Array<string>} config.store.json.vpn_servers.routes
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function vpnServerRouteDelete(config, stateData, componentProps) {
  deleteSubChild(config, "vpn_servers", "routes", componentProps);
}

module.exports = {
  vpnServerInit,
  vpnServerOnStoreUpdate,
  vpnServerCreate,
  vpnServerSave,
  vpnServerDelete,
  vpnServerRouteCreate,
  vpnServerRouteSave,
  vpnServerRouteDelete
};
