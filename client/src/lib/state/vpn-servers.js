const {
  deleteUnfoundArrayItems,
  isNullOrEmptyString,
  portRangeInvalid,
  rangeInvalid,
  isEmpty,
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  invalidName,
  invalidNameText,
  invalidCidrBlock,
  invalidCrnList,
} = require("../forms");
const { fieldIsNullOrEmptyString } = require("./utils");
const {
  commaSeparatedIpListExp,
  commaSeparatedCidrListExp,
} = require("../constants");

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
  config.store.json.vpn_servers.forEach((server) => {
    config.setUnfound("resourceGroups", server, "resource_group");
    if (!server.additional_prefixes) {
      server.additional_prefixes = [];
    }
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

/**
 * vpn server save should be disabled
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should be disabled
 */
function vpnServerShouldDisableSave(config, stateData, componentProps) {
  let saveShouldBeDisabled = false;
  [
    "name",
    "resource_group",
    "vpc",
    "security_group",
    "client_ip_pool",
    "port",
    "client_idle_timeout",
    "certificate_crn",
    "client_dns_server_ips",
    "subnets",
    "additional_prefixes",
    "zone",
    "secrets_manager",
  ].forEach((field) => {
    if (!saveShouldBeDisabled) {
      saveShouldBeDisabled = config.vpn_servers[field].invalid(
        stateData,
        componentProps
      );
    }
  });
  return saveShouldBeDisabled;
}

/**
 *
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should be disabled
 */
function vpnServerRoutesShouldDisableSave(config, stateData, componentProps) {
  let saveShouldBeDisabled = false;
  ["name", "destination"].forEach((field) => {
    if (!saveShouldBeDisabled) {
      saveShouldBeDisabled = config.vpn_servers.routes[field].invalid(
        stateData,
        componentProps
      );
    }
  });
  return saveShouldBeDisabled;
}

/**
 * initialize vpn state
 * @param {lazyZstate} store
 */
function initVpnState(store) {
  store.newField("vpn_servers", {
    init: vpnServerInit,
    onStoreUpdate: vpnServerOnStoreUpdate,
    create: vpnServerCreate,
    save: vpnServerSave,
    delete: vpnServerDelete,
    shouldDisableSave: vpnServerShouldDisableSave,
    schema: {
      name: {
        default: "",
        invalid: invalidName("vpn_servers"),
        invalidText: invalidNameText("vpn_servers"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      vpc: {
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
      },
      security_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("security_group"),
      },
      client_ip_pool: {
        default: "",
        invalid: function (stateData, componentProps) {
          return (
            fieldIsNullOrEmptyString("client_ip_pool")(
              stateData,
              componentProps
            ) || invalidCidrBlock(stateData.client_ip_pool)
          );
        },
      },
      port: {
        default: "",
        invalid: function (stateData) {
          return (
            isNullOrEmptyString(stateData.port) ||
            portRangeInvalid("port_min", parseInt(stateData.port))
          );
        },
      },
      client_idle_timeout: {
        default: "",
        invalid: function (stateData) {
          return stateData.client_idle_timeout
            ? rangeInvalid(parseInt(stateData.client_idle_timeout), 0, 28800)
            : false;
        },
      },
      certificate_crn: {
        default: "",
        invalid: function (stateData) {
          return stateData.bring_your_own_cert ||
            stateData.DANGER_developer_certificate
            ? false
            : invalidCrnList(
                [stateData.certificate_crn].concat(
                  stateData.method === "certificate"
                    ? stateData.client_ca_crn
                    : []
                )
              );
        },
      },
      client_dns_server_ips: {
        default: "",
        invalid: function (stateData) {
          return (
            !isNullOrEmptyString(stateData.client_dns_server_ips) &&
            stateData.client_dns_server_ips.match(commaSeparatedIpListExp) ===
              null
          );
        },
      },
      subnets: {
        default: [],
        invalid: function (stateData) {
          return isEmpty(stateData.subnets);
        },
      },
      additional_prefixes: {
        default: [],
        invalid: function (stateData) {
          return (
            isNullOrEmptyString(stateData.additional_prefixes) ||
            stateData.additional_prefixes
              .join(",")
              .replace(/\s*/g, "")
              .match(commaSeparatedCidrListExp) === null
          );
        },
      },
      zone: {
        default: null,
        invalid: function (stateData) {
          return (
            !isEmpty(stateData.additional_prefixes) &&
            isNullOrEmptyString(stateData.zone)
          );
        },
      },
      secrets_manager: {
        default: "",
        invalid: function (stateData) {
          return stateData.bring_your_own_cert ||
            stateData.DANGER_developer_certificate
            ? isNullOrEmptyString(stateData.secrets_manager)
            : false;
        },
      },
    },
    subComponents: {
      routes: {
        create: vpnServerRouteCreate,
        save: vpnServerRouteSave,
        delete: vpnServerRouteDelete,
        shouldDisableSave: vpnServerRoutesShouldDisableSave,
        schema: {
          name: {
            default: "",
            invalid: invalidName("vpn_server_routes"),
            invalidText: invalidNameText("vpn_server_routes"),
          },
          destination: {
            default: "",
            invalid: function (stateData) {
              return invalidCidrBlock(stateData.destination);
            },
          },
        },
      },
    },
  });
}

module.exports = {
  vpnServerInit,
  vpnServerOnStoreUpdate,
  vpnServerCreate,
  vpnServerSave,
  vpnServerDelete,
  vpnServerRouteCreate,
  vpnServerRouteSave,
  vpnServerRouteDelete,
  vpnServerShouldDisableSave,
  initVpnState,
};
