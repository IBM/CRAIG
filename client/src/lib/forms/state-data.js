const { transpose, splat, contains } = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");

/**
 * get tiers for subnet
 * @param {*} tier subnet tier object
 * @param {*} vpc vpc data object
 * @returns {Function} function for getting state data
 */
function getTierSubnets(tier, vpc) {
  /**
   * @param {*} stateData component state data
   * @returns {Array<object>} list of subnet objects
   */
  return function(stateData) {
    let subnets = [];
    if (tier.advanced) {
      vpc.subnets.forEach(subnet => {
        if (contains(tier.subnets, subnet.name)) {
          subnets[subnet.zone - 1] = subnet;
        }
      });
    } else {
      vpc.subnets.forEach(subnet => {
        if (
          subnet.name.match(
            new RegexButWithWords()
              .stringBegin()
              .literal(tier.name)
              .literal("-zone-")
              .digit()
              .stringEnd()
              .done("g")
          ) !== null &&
          subnets.length < stateData.zones
        ) {
          let tierSubnet = {};
          tierSubnet.acl_name = subnet.network_acl;
          transpose(subnet, tierSubnet);
          subnets.push(tierSubnet);
        }
      });
    }
    return subnets;
  };
}

/**
 * get data for subnet tier object
 * @param {*} tier subnet tier object
 * @param {*} vpc vpc data object
 * @returns {object} composed state data
 */
function getSubnetTierStateData(tier, vpc) {
  let state = { hide: true };
  let subnets = getTierSubnets(tier, vpc)(tier);
  state.networkAcl = tier.advanced ? "-" : splat(subnets, "network_acl")[0];
  state.addPublicGateway = false;
  subnets.forEach(subnet => {
    if (subnet.public_gateway === true) {
      state.addPublicGateway = true;
    }
  });
  transpose(tier, state);
  return state;
}

module.exports = {
  getSubnetTierStateData,
  getTierSubnets
};
