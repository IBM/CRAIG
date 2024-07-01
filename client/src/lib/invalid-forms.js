const {
  eachKey,
  isArray,
  distinct,
  containsKeys,
  contains,
  azsort,
} = require("lazy-z");
const { disableSave } = require("./forms");
const { state } = require("./state");

const subComponents = {
  key_management: ["keys"],
  routing_tables: ["routes"],
  clusters: ["worker_pools"],
  vsi: ["volumes"],
  dns: ["zones", "records", "custom_resolvers"],
  vpn_servers: ["routes"],
  access_groups: ["policies", "dynamic_policies"],
  cbr_rules: ["contexts", "resource_attributes", "tags"],
  cbr_zones: ["addresses", "exclusions"],
  vpcs: ["acls", "subnets"],
  power: ["ssh_keys", "network"],
  security_group: ["rules"],
  appid: ["keys"],
  cis: ["domains", "dns_records"],
  cis_glbs: ["origins", "glbs", "health_checks"],
  object_storage: ["buckets", "keys"],
  vpn_gateways: ["connections"],
  transit_gateways: ["gre_tunnels", "prefix_filters"],
};

/**
 * get a list of invalid forms based on disable save
 * @param {*} json config
 * @returns {Array<string>} list of failing forms
 */
function invalidForms(craig) {
  let forms = [];
  let json = craig.store.json; // shortcut
  let testCraig = new state();
  testCraig.setUpdateCallback(() => {});
  testCraig.hardSetJson(json, true);
  // for each json field in data
  eachKey(json, (key) => {
    let formKeyName = contains(["cbr_rules", "cbr_zones"], key)
      ? "/form/cbr"
      : key;
    // if the item is an array
    if (isArray(json[key])) {
      // for each array item
      json[key].forEach((item) => {
        // add name of field to list of forms if should be disabled
        if (disableSave(key, item, { data: item, craig: testCraig })) {
          forms = distinct(forms.concat(formKeyName));
        }
        // if has sub components, check each component
        if (containsKeys(subComponents, key)) {
          subComponents[key].forEach((subComponent) => {
            if (item[subComponent]) {
              item[subComponent].forEach((subItem) => {
                let subComponentFormName =
                  subComponent === "acls"
                    ? "/form/nacls"
                    : subComponent === "subnets"
                    ? "/form/subnets"
                    : formKeyName;
                if (
                  disableSave(
                    subComponent === "subnets" ? "subnet" : subComponent,
                    subItem,
                    {
                      data: subItem,
                      craig: testCraig,
                      // pass array parent name to prevent disable save from checking
                      // other ssh keys lists
                      arrayParentName: key === "power" ? item.name : undefined,
                    }
                  )
                ) {
                  forms = distinct(forms.concat(subComponentFormName));
                }
              });
            }
          });
        }
      });
    } else if (
      disableSave(key, json[key], { data: json[key], craig: testCraig })
    ) {
      if (
        // if item is not enabled or is not an item that can be enabled
        (contains(["logdna", "iam_account_settings"], key) &&
          json[key].enabled) ||
        !contains(["logdna", "iam_account_settings", "scc_v2", "sysdig"], key)
      ) {
        forms = distinct(
          forms.concat(
            contains(["logdna", "sysdig"], key) ? "/form/observability" : key
          )
        );
      }
    }
  });
  return forms.sort(azsort);
}

module.exports = {
  invalidForms,
};
