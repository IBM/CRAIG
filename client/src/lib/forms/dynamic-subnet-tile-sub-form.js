const { isArray, isString, contains, revision } = require("lazy-z");
const { buildSubnet } = require("../builders");
const { getTierSubnets } = require("./state-data");

/**
 * get subnet tier data for form
 * @param {*} props
 * @param {boolean} props.isModal
 * @param {*} props.parentProps
 * @param {*} props.parentProps.craig
 * @param {string} props.parentProps.vpc_name
 * @param {*} props.parentState
 * @returns {Array<object>} subnets
 */
function getSubnetData(props) {
  let subnets = [];
  if (props.isModal) {
    let nextTier = [
      props.parentProps.craig.store.subnetTiers[props.parentProps.data.name],
    ].length;
    while (
      subnets.length <
      (isArray(props.parentState.zones) ? 3 : props.parentState.zones)
    ) {
      if (
        isString(props.parentState.zones) ||
        (isArray(props.parentState.zones) &&
          contains(props.parentState.zones, String(subnets.length + 1)))
      ) {
        subnets.push(
          buildSubnet(
            props.parentProps.vpc_name,
            Object.keys(props.parentProps.craig.store.subnetTiers).indexOf(
              props.parentProps.vpc_name,
            ),
            props.parentState.name,
            nextTier,
            props.parentState.networkAcl,
            props.parentProps.data.resource_group,
            subnets.length + 1,
            props.parentState.addPublicGateway,
          ),
        );
      } else {
        subnets.push({
          name: "NONE",
        });
      }
    }
  } else {
    let parentVpc = new revision(props.parentProps.craig.store.json).child(
      "vpcs",
      props.parentProps.vpc_name,
    ).data;
    subnets = getTierSubnets(
      props.parentProps.data,
      parentVpc,
    )(props.parentState);
  }
  return subnets;
}

module.exports = {
  getSubnetData,
};
