const { revision } = require("lazy-z");
const { subnetTierSave } = require("./vpc");

/**
 * initialize options
 * @param {lazyZstate} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function optionsInit(config) {
  config.store.json._options = {
    prefix: "iac",
    region: "us-south",
    tags: ["hello", "world"],
    zones: 3,
    endpoints: "private",
    account_id: "",
    fs_cloud: true,
    dynamic_subnets: true,
  };
}

/**
 * update existing options
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function optionsSave(config, stateData, componentProps) {
  config.updateChild(["json", "_options"], componentProps.data.name, stateData);
  let zones = config.store.json._options.zones;
  let vpcs = Object.keys(config.store.subnetTiers);
  vpcs.forEach((vpc) => {
    config.store.subnetTiers[vpc].forEach((subnetTier) => {
      let newSubnetTier = subnetTier;
      newSubnetTier.zones = zones; // update zones
      newSubnetTier.networkAcl = new revision(config.store.json)
        .child("vpcs", vpc, "name")
        .child("subnets", subnetTier.name + "-zone-1", "name").data.network_acl;
      // need to update list of subnets
      subnetTierSave(config, newSubnetTier, {
        data: subnetTier,
        vpc_name: vpc,
        craig: config,
      });
    });
  });
}

module.exports = {
  optionsInit,
  optionsSave,
};
