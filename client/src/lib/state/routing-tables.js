const { nestedSplat, transpose, getObjectFromArray } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { buildNewEncryptionKey } = require("../builders");
const { newDefaultKms } = require("./defaults");
const {
  setUnfoundResourceGroup,
  carveChild,
  updateChild,
  pushAndUpdate,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  hasUnfoundVpc,
  setUnfound
} = require("./store.utils");

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
  config.store.json.routing_tables.forEach(table => {
    if (hasUnfoundVpc(config, table)) {
      table.vpc = null;
      table.routes.forEach(route => {
        route.vpc = null;
      });
    }
    table.routes.forEach(route => {
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
  updateChild(config, "routing_tables", stateData, componentProps);
}

/**
 * create a new routing table
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function routingTableCreate(config, stateData) {
  let data = {
    routes: []
  };
  transpose(stateData, data);
  pushAndUpdate(config, "routing_tables", data);
}

/**
 * delete routing table
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableDelete(config, stateData, componentProps) {
  carveChild(config, "routing_tables", componentProps);
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

module.exports = {
  routingTableInit,
  routingTableOnStoreUpdate,
  routingTableCreate,
  routingTableSave,
  routingTableDelete,
  routingTableRouteCreate,
  routingTableRouteSave,
  routingTableRouteDelete
};
