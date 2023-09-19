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

/**
 * get names of all secrets in craig
 * @param {object} componentProps
 * @returns array of all secret names in craig
 */
function getAllSecrets(stateData, componentProps, field) {
  let allSecretNames = [];

  // add name of other secret currently in form
  if (
    field == "arbitrary_secret_name" &&
    stateData.username_password_secret_name
  ) {
    allSecretNames.push(stateData.username_password_secret_name);
  }
  if (
    field == "username_password_secret_name" &&
    stateData.arbitrary_secret_name
  ) {
    allSecretNames.push(stateData.arbitrary_secret_name);
  }
  componentProps.craig.store.json.secrets_manager.forEach((sm) => {
    sm.secrets.forEach((secret) => {
      allSecretNames.push(secret.name);
    });
  });
  componentProps.craig.store.json.clusters.forEach((cluster) => {
    cluster.opaque_secrets.forEach((secret) => {
      allSecretNames.push(secret.arbitrary_secret_name);
      allSecretNames.push(secret.username_password_secret_name);
    });
  });
  return allSecretNames;
}

module.exports = {
  notificationText,
  getCosFromBucket,
  getAllSecrets,
};
