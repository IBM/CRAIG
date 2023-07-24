const { titleCase } = require("lazy-z");

function notificationText(pathname) {
  let path = pathname.replace("/form/", "");
  return titleCase(path)
    .replace(/I D/, "ID")
    .replace(/Vpcs/, "VPCs")
    .replace(/Nacls/, "Network ACLs")
    .replace(/Vpe/, "Virtual Private Endpoints")
    .replace(/Vpn/, "VPN")
    .replace(/Ssh/, "SSH")
    .replace(/Lb/, "Load Balancers")
    .replace(/Dns/, "DNS")
    .replace(/F 5/, "F5")
    .replace(/Iam/, "IAM")
    .replace(/Cbr/, "Context Based Restrictions");
}

/**
 * get cos instance from bucket name
 * this function can be moved to `/state/logging-monitoring`, unused elsewhere
 * @param {String} name
 * @param {Array} objectStoreArray
 * @returns cos name that is associated with supplied bucket name, or null if no instance found
 */
function getCosFromBucket(name, objectStoreArray) {
  let cos;
  objectStoreArray.forEach((instance) => {
    instance.buckets.forEach((bucket) => {
      if (name === bucket.name) {
        cos = instance.name;
      }
    });
  });
  return cos || null;
}

module.exports = {
  notificationText,
  getCosFromBucket,
};
