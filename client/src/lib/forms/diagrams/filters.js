const { isEmpty, splatContains } = require("lazy-z");

/**
 * filter classic gateways
 * @param {*} props
 * @returns {Object} list of filterd gateways
 */
function classicGatewaysFilter(props) {
  let gateways = [];
  props.craig.store.json.classic_gateways.forEach((gw, gwIndex) => {
    if (gw.private_vlan === props.vlan || gw.public_vlan === props.vlan) {
      let copyGw = { ...gw };
      copyGw.index = gwIndex;
      if (gw.hadr) {
        copyGw.name += "-1";
      }
      gateways.push(copyGw);
      if (gw.hadr) {
        let hadrCopy = { ...gw };
        hadrCopy.name += "-2";
        hadrCopy.index = gwIndex;
        gateways.push(hadrCopy);
      }
    }
  });
  return gateways;
}

/**
 * filter for power subnets
 * @param {*} props component props
 * @returns {Array<object>} list of power vs subnets
 */
function powerSubnetFilter(props) {
  let networkSubnets = [];
  ["vtl", "power_instances"].forEach((field) => {
    props.craig.store.json[field].forEach((instance) => {
      if (
        instance.workspace === props.power.name &&
        isEmpty(instance.network)
      ) {
        networkSubnets = [
          {
            name: "No Subnets Selected",
          },
        ];
      }
    });
  });
  return networkSubnets.concat(props.power.network);
}

/**
 * get a list of power workspaces to render as part of the power map
 * @param {*} props component props
 * @returns {Array<object>} list of workspaces to render
 */
function powerMapFilter(props) {
  let nullPowerWorkspaceResource = false;
  ["power_instances", "power_volumes", "vtl"].forEach((field) => {
    if (
      !nullPowerWorkspaceResource &&
      splatContains(props.craig.store.json[field], "workspace", null)
    ) {
      nullPowerWorkspaceResource = true;
    }
  });
  return (nullPowerWorkspaceResource ? [{ name: null }] : []).concat(
    props.craig.store.json.power
  );
}

module.exports = {
  classicGatewaysFilter,
  powerSubnetFilter,
  powerMapFilter,
};
