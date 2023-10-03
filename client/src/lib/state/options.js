const { revision } = require("lazy-z");
const { subnetTierSave } = require("./vpc");
const { RegexButWithWords } = require("regex-but-with-words");

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
    fs_cloud: false,
    dynamic_subnets: true,
    enable_power_vs: false,
    power_vs_zones: [],
  };
}

/**
 * update existing options
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function optionsSave(config, stateData, componentProps) {
  if (componentProps.data.dynamic_subnets && !stateData.dynamic_subnets) {
    config.store.json.vpcs.forEach((vpc) => {
      vpc.address_prefixes = [];
      vpc.subnets.forEach((subnet) => {
        vpc.address_prefixes.push({
          name: subnet.name,
          cidr: subnet.cidr,
          zone: subnet.zone,
          vpc: vpc.name,
        });
      });
    });
  }
  if (stateData.showModal !== undefined) {
    delete stateData.showModal;
  }
  config.updateChild(["json", "_options"], componentProps.data.name, stateData);
  if (stateData.zones !== componentProps.data.zones) {
    let zones = config.store.json._options.zones;
    let vpcs = Object.keys(config.store.subnetTiers);
    vpcs.forEach((vpc) => {
      config.store.subnetTiers[vpc].forEach((subnetTier) => {
        let newSubnetTier = subnetTier;
        newSubnetTier.zones = zones; // update zones
        newSubnetTier.networkAcl = new revision(config.store.json)
          .child("vpcs", vpc, "name")
          .data.subnets.forEach((subnet) => {
            if (
              subnet.name.match(
                new RegexButWithWords()
                  .stringBegin()
                  .literal(subnetTier.name)
                  .literal("-zone-")
                  .digit()
                  .stringEnd()
                  .done("g")
              ) !== null
            ) {
              newSubnetTier.networkAcl = subnet.network_acl;
            }
          });
        // need to update list of subnets
        subnetTierSave(config, newSubnetTier, {
          data: subnetTier,
          vpc_name: vpc,
          craig: config,
        });
      });
    });
  }
}

module.exports = {
  optionsInit,
  optionsSave,
};
