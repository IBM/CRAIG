const { getObjectFromArray, splatContains } = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");

/**
 * get list of subnet tiers for display
 * @param {*} props
 * @returns {Object} list of subnets and if all have acl
 */
function getDisplayTierSubnetList(props) {
  let tierSubnets = [];

  if (!props.tier.advanced) {
    props.vpc.subnets.forEach((subnet) => {
      if (
        subnet.name.match(
          new RegexButWithWords()
            .literal(props.tier.name)
            .literal("-zone-")
            .digit()
            .stringEnd()
            .done("g")
        ) !== null &&
        !subnet.tier
      ) {
        tierSubnets.push(subnet);
      }
    });
  } else {
    props.tier.subnets.forEach((subnetName) => {
      tierSubnets.push(
        getObjectFromArray(props.vpc.subnets, "name", subnetName)
      );
    });
  }

  ["1", "2", "3"].forEach((zone) => {
    if (
      !splatContains(tierSubnets, "zone", zone) &&
      !splatContains(tierSubnets, "zone", Number(zone))
    ) {
      tierSubnets.push({
        display: "none",
        zone: zone,
      });
    }
  });

  return tierSubnets.sort((a, b) => {
    if (a.zone > b.zone) return 1;
    else return -1;
  });
}

module.exports = {
  getDisplayTierSubnetList,
};
