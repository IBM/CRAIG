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

module.exports = {
  classicGatewaysFilter,
};
