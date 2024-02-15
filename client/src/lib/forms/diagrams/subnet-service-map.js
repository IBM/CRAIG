const { contains, isEmpty } = require("lazy-z");

/**
 * should display service in subnet map
 * @param {*} props
 * @param {string} field field to search
 * @param {*} item
 * @returns {boolean} true if should be displayed
 */

function shouldDisplayService(props, field, item) {
  let subnet = props.vpc && props.subnet ? props.subnet : { name: null };
  let vpc = props.vpc;
  if (item.vpc === null && !props.vpc) {
    return true;
  } else if (
    contains(
      [
        "clusters",
        "vsi",
        "vpn_servers",
        "load_balancers",
        "virtual_private_endpoints",
      ],
      field
    )
  ) {
    return (
      (!subnet.name && isEmpty(item.subnets)) ||
      (contains(item.subnets, subnet?.name) && item.vpc === vpc.name)
    );
  } else if (contains(["vpn_gateways", "f5_vsi"], field)) {
    return item.subnet === subnet.name;
  } else if (field === "fortigate_vnf") {
    return (
      item.primary_subnet === subnet.name ||
      item.secondary_subnet === subnet.name
    );
  } else return false;
}

module.exports = {
  shouldDisplayService,
};
