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

module.exports = {
  notificationText
};
