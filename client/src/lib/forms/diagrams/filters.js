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
 * filter classic bare metals
 * @param {*} componentProps
 * @returns {Object} list of filtered bare metals
 */
function classicBareMetalFilter(componentProps) {
  let bareMetals = [];
  componentProps.craig.store.json.classic_bare_metal.forEach(
    (server, serverIndex) => {
      if (
        server.private_vlan === componentProps.vlan ||
        server.public_vlan === componentProps.vlan
      ) {
        let copyServer = { ...server };
        copyServer.index = serverIndex;
        bareMetals.push(copyServer);
      }
    }
  );
  return bareMetals;
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

/**
 * get a list of acls to render
 * @param {*} props component props
 * @returns {Array<object>} list of acls to render
 */
function aclMapFilter(props) {
  let vpc = props.vpc;
  let subnets = vpc.subnets || []; // empty subnets for no vpc
  // if no acls on vpc, add null
  let hasNullAcls = false;
  subnets.forEach((subnet) => {
    // if subnet does not use data and has no acl, add null
    if (!subnet.use_data && !subnet.network_acl) hasNullAcls = true;
  });
  return (hasNullAcls ? [{ name: null }] : []).concat(vpc.acls || []);
}

/**
 * filter classic subnets
 * @param {*} componentProps
 * @returns {Object} list of filtered classic subnets
 */
function classicSubnetsFilter(props) {
  let subnets = [];
  props.craig.store.json.classic_vlans.forEach((vlan) => {
    if (vlan.datacenter === props.datacenter) {
      subnets.push(vlan);
    }
  });
  return subnets;
}

module.exports = {
  classicGatewaysFilter,
  classicBareMetalFilter,
  powerSubnetFilter,
  powerMapFilter,
  aclMapFilter,
  classicSubnetsFilter,
};
