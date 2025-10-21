const { isEmpty } = require("lazy-z");

/**
 * get subnet tier map display props
 * @param {*} props
 * @param {object} props.vpc
 * @param {number} props.vpc_index
 * @param {Object} props.craig
 * @returns {Object} display object
 */
function getDisplaySubnetTiers(props) {
  let vpc = props.vpc;
  let craig = props.craig;
  let emptySubnetResources = false;

  // check for empty subnet objects
  ["virtual_private_endpoints", "vsi", "vpn_servers", "clusters"].forEach(
    (field) => {
      craig.store.json[field].forEach((item) => {
        if (isEmpty(item.subnets) && item.vpc === vpc.name) {
          emptySubnetResources = true;
        }
      });
    },
  );

  ["vpn_gateways"].forEach((field) => {
    craig.store.json[field].forEach((item) => {
      if (item.subnet === null && item.vpc === vpc.name)
        emptySubnetResources = true;
    });
  });

  let subnetTiers = vpc.subnetTiers
    ? vpc.subnetTiers
    : craig.store.subnetTiers[vpc.name] || [];

  if (emptySubnetResources && !props.foundSubnetsOnly) {
    subnetTiers = subnetTiers.concat("NO_SUBNETS");
  }

  return {
    emptySubnetResources: emptySubnetResources,
    subnetTiers: subnetTiers,
  };
}

module.exports = {
  getDisplaySubnetTiers,
};
