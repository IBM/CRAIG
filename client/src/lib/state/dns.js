const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  setUnfoundResourceGroup,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  deleteUnfoundArrayItems,
  splat,
  getObjectFromArray,
  splatContains,
} = require("lazy-z");

function dnsInit(config) {
  config.store.json.dns = [];
}

/**
 * on store update for dns
 * @param {*} config
 */
function dnsOnStoreUpdate(config) {
  config.store.json.dns.forEach((dns) => {
    setUnfoundResourceGroup(config, dns);
    dns.zones.forEach((zone) => {
      zone.instance = dns.name;
      zone.vpcs = deleteUnfoundArrayItems(
        splat(config.store.json.vpcs, "name"),
        zone.vpcs
      );
    });
    dns.custom_resolvers.forEach((resolver) => {
      resolver.instance = dns.name;
      if (hasUnfoundVpc(config, resolver)) {
        resolver.vpc = null;
        resolver.subnets = [];
      } else {
        resolver.subnets = deleteUnfoundArrayItems(
          resolver.subnets,
          splat(
            getObjectFromArray(config.store.json.vpcs, "name", resolver.vpc)
              .subnets,
            "name"
          )
        );
      }
      if (!splatContains(dns.zones, "name", resolver.zone)) {
        resolver.zone = null;
      }
    });
  });
}

/**
 * save cbr rules
 * @param {object} stateData component state data
 * @param {string} stateData.name
 */
function dnsSave(config, stateData, componentProps) {
  config.updateChild(["json", "dns"], componentProps.data.name, stateData);
}

/**
 * create a new dns instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function dnsCreate(config, stateData) {
  stateData.records = [];
  stateData.zones = [];
  stateData.custom_resolvers = [];
  config.push(["json", "dns"], stateData);
}

/**
 * delete dns instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsDelete(config, stateData, componentProps) {
  config.carve(["json", "dns"], componentProps.data.name);
}

/**
 * create dns subfield
 * @param {string} field subfield name
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsSubFieldCreate(field, config, stateData, componentProps) {
  pushToChildFieldModal(config, "dns", field, stateData, componentProps);
}

/**
 * update dns subfield
 * @param {string} field subfield name
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsSubFieldSave(field, config, stateData, componentProps) {
  updateSubChild(config, "dns", field, stateData, componentProps);
}

/**
 * delete dns subfield
 * @param {string} field subfield name
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsSubFieldDelete(field, config, stateData, componentProps) {
  deleteSubChild(config, "dns", field, componentProps);
}

/**
 * create dns zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsZoneCreate(config, stateData, componentProps) {
  dnsSubFieldCreate("zones", config, stateData, componentProps);
}

/**
 * update dns zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsZoneSave(config, stateData, componentProps) {
  dnsSubFieldSave("zones", config, stateData, componentProps);
}

/**
 * delete dns zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsZoneDelete(config, stateData, componentProps) {
  dnsSubFieldDelete("zones", config, stateData, componentProps);
}

/**
 * create dns record
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsRecordCreate(config, stateData, componentProps) {
  dnsSubFieldCreate("records", config, stateData, componentProps);
}

/**
 * update dns record
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsRecordSave(config, stateData, componentProps) {
  dnsSubFieldSave("records", config, stateData, componentProps);
}

/**
 * delete dns record
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsRecordDelete(config, stateData, componentProps) {
  dnsSubFieldDelete("records", config, stateData, componentProps);
}

/**
 * create dns custom_resolvers
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsResolverCreate(config, stateData, componentProps) {
  dnsSubFieldCreate("custom_resolvers", config, stateData, componentProps);
}

/**
 * update dns custom_resolvers
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsResolverSave(config, stateData, componentProps) {
  dnsSubFieldSave("custom_resolvers", config, stateData, componentProps);
}

/**
 * delete dns custom_resolvers
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsResolverDelete(config, stateData, componentProps) {
  dnsSubFieldDelete("custom_resolvers", config, stateData, componentProps);
}

module.exports = {
  dnsCreate,
  dnsInit,
  dnsDelete,
  dnsSave,
  dnsOnStoreUpdate,
  dnsZoneCreate,
  dnsZoneDelete,
  dnsZoneSave,
  dnsRecordCreate,
  dnsRecordDelete,
  dnsRecordSave,
  dnsResolverCreate,
  dnsResolverDelete,
  dnsResolverSave,
};
