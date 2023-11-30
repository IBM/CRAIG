const {
  transpose,
  isIpv4CidrOrAddress,
  contains,
  isNullOrEmptyString,
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
} = require("./utils");
const { invalidNameText, invalidName } = require("../forms");

/**
 * initialize routing table in slz store
 * @param {lazyZstate} config
 */
function routingTableInit(config) {
  config.store.json.routing_tables = [];
}

/**
 * update routing table store
 * @param {lazyZstate} config
 */
function routingTableOnStoreUpdate(config) {
  config.store.json.routing_tables.forEach((table) => {
    if (hasUnfoundVpc(config, table)) {
      table.vpc = null;
      table.routes.forEach((route) => {
        route.vpc = null;
      });
    }
    table.routes.forEach((route) => {
      route.routing_table = table.name;
      route.vpc = table.vpc;
    });
  });
}

/**
 * save routing table
 * @param {object} stateData component state data
 */
function routingTableSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "routing_tables"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new routing table
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function routingTableCreate(config, stateData) {
  let data = {
    routes: [],
  };
  transpose(stateData, data);
  config.push(["json", "routing_tables"], data);
}

/**
 * delete routing table
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableDelete(config, stateData, componentProps) {
  config.carve(["json", "routing_tables"], componentProps.data.name);
}
/**
 * create new routing table route
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function routingTableRouteCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "routing_tables",
    "routes",
    stateData,
    componentProps
  );
}

/**
 * update routing table route
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableRouteSave(config, stateData, componentProps) {
  updateSubChild(config, "routing_tables", "routes", stateData, componentProps);
}

/**
 * delete a routing table route
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableRouteDelete(config, stateData, componentProps) {
  deleteSubChild(config, "routing_tables", "routes", componentProps);
}

function initRoutingTable(store) {
  store.newField("routing_tables", {
    init: routingTableInit,
    onStoreUpdate: routingTableOnStoreUpdate,
    create: routingTableCreate,
    save: routingTableSave,
    delete: routingTableDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "vpc"],
      "routing_tables"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("routing_tables"),
        invalidText: invalidNameText("routing_tables"),
      },
      vpc: {
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
      },
    },
    subComponents: {
      routes: {
        create: routingTableRouteCreate,
        save: routingTableRouteSave,
        delete: routingTableRouteDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "zone", "action", "next_hop", "destination"],
          "routing_tables",
          "routes"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("routes"),
            invalidText: invalidNameText("routes"),
          },
          zone: {
            default: "",
            invalid: fieldIsNullOrEmptyString("zone"),
          },
          action: {
            default: "",
            invalid: fieldIsNullOrEmptyString("action"),
          },
          next_hop: {
            default: "",
            invalid: function (stateData, componentProps) {
              return (
                stateData.action === "deliver" &&
                (isNullOrEmptyString(stateData.next_hop) ||
                  !isIpv4CidrOrAddress(stateData.next_hop) ||
                  contains(stateData.next_hop, "/"))
              );
            },
          },
          destination: {
            default: "",
            invalid: function (stateData, componentProps) {
              return (
                isNullOrEmptyString(stateData.destination) ||
                !isIpv4CidrOrAddress(stateData.destination)
              );
            },
          },
        },
      },
    },
  });
}

module.exports = {
  routingTableInit,
  routingTableOnStoreUpdate,
  routingTableCreate,
  routingTableSave,
  routingTableDelete,
  routingTableRouteCreate,
  routingTableRouteSave,
  routingTableRouteDelete,
  initRoutingTable,
};
