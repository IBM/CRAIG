const { splatContains } = require("lazy-z");

/**
 * init store
 * @param {*} config
 */
function classicGatewayInit(config) {
  config.store.json.classic_gateways = [];
}

/**
 * on store update
 * @param {*} config
 */
function classicGatewayOnStoreUpdate(config) {
  if (config.store.json.classic_gateways)
    config.store.json.classic_gateways.forEach((gateway) => {
      ["private_vlan", "public_vlan"].forEach((field) => {
        if (
          !splatContains(
            config.store.json.classic_vlans,
            "name",
            gateway[field]
          )
        ) {
          gateway[field] = null;
        }
        if (
          !splatContains(
            config.store.json.classic_ssh_keys,
            "name",
            gateway.ssh_key
          )
        )
          gateway.ssh_key = null;
      });
    });
}

/**
 * create classic gateway
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicGatewayCreate(config, stateData, componentProps) {
  config.push(["json", "classic_gateways"], stateData);
}

/**
 * save classic gateway
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicGatewaySave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "classic_gateways"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete classic gateway
 * @param {*} config
 * @param {*} stateData
 * @param {*} componentProps
 */
function classicGatewayDelete(config, stateData, componentProps) {
  config.carve(["json", "classic_gateways"], componentProps.data.name);
}

module.exports = {
  classicGatewayInit,
  classicGatewayOnStoreUpdate,
  classicGatewayCreate,
  classicGatewaySave,
  classicGatewayDelete,
};
