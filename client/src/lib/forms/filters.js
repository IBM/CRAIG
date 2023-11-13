const { getObjectFromArray, splat, distinct, contains } = require("lazy-z");

/**
 * filter encryption keys
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {array} keys
 */
function encryptionKeyFilter(_, componentProps) {
  let cosName = componentProps.isModal
    ? componentProps.parent_name
    : componentProps.arrayParentName;
  let { kms } = getObjectFromArray(
    componentProps.craig.store.json.object_storage,
    "name",
    cosName
  );
  let validKeys = [];
  if (kms) {
    getObjectFromArray(
      componentProps.craig.store.json.key_management,
      "name",
      kms
    ).keys.forEach((key) => {
      if (key.root_key) {
        validKeys.push(key.name);
      }
    });
  }
  return kms ? validKeys : [];
}

/**
 * filter vpcs with connections to extant tgws
 * @param {*} craig
 * @returns {Array<string>} list of vpcs not currently
 */
function tgwVpcFilter(craig) {
  let unconnectedVpcs = [];
  let allTgwVpcs = [];
  craig.store.json.transit_gateways.forEach((tgw) => {
    let connectionVpcs = [];
    tgw.connections.forEach((connection) => {
      if (connection.vpc) {
        // not using splat to avoid picking up `null` for crn connections
        connectionVpcs.push(connection.vpc);
      }
    });
    allTgwVpcs = distinct(allTgwVpcs.concat(connectionVpcs));
  });
  craig.store.vpcList.forEach((vpc) => {
    if (!contains(allTgwVpcs, vpc)) unconnectedVpcs.push(vpc);
  });
  return unconnectedVpcs;
}

module.exports = { encryptionKeyFilter, tgwVpcFilter };
