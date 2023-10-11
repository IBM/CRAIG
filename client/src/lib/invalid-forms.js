const { eachKey } = require("lazy-z");
const { disableSave } = require("./forms");
const { isEmpty } = require("lazy-z");

/**
 * get a list of invalid forms based on disable save
 * @param {*} json config
 * @returns {Array<string>} list of failing forms
 */
function invalidForms(craig) {
  let forms = [];
  let formsFailing = {
    key_management: false,
    object_storage: false,
    secrets_manager: false,
    atracker: false,
    event_streams: false,
    appid: false,
    vpcs: false,
    "/form/nacls": false,
    "/form/subnets": false,
    routing_tables: false,
    transit_gateways: false,
    security_groups: false,
    virtual_private_endpoints: false,
    vpn_gateways: false,
    clusters: false,
    ssh_keys: false,
    vsi: false,
    "/form/observability": false,
    icd: false,
    power: false,
    power_instances: false,
    power_volumes: false,
  };
  let json = craig.store.json; // shortcut

  /**
   * check if forms should be disabled
   * @param {string} field field name
   * @param {*} data object
   * @returns {boolean} true if should be disabled
   */
  function saveShouldBeDisabled(field, data) {
    return disableSave(
      ...[
        field,
        data,
        {
          craig: craig,
          data: {
            name: data.name,
            default_security_group_name: data.default_security_group_name,
            default_routing_table_name: data.default_routing_table_name,
            default_network_acl_name: data.default_network_acl_name,
          },
          route: {
            routes: [],
          },
          parent_name: "parent_name",
        },
        craig,
      ]
    );
  }

  /**
   * for each component check if should be disabled
   * @param {string} field
   * @param {Function} callback instance callback for subcomponents
   * @param {string=} overrideField user override field to set forms failing
   */
  function forEachDisabledCheck(field, callback, overrideField) {
    json[field].forEach((instance) => {
      if (!formsFailing[overrideField || field]) {
        formsFailing[overrideField || field] = saveShouldBeDisabled(
          field,
          instance
        );
      }
      if (callback) {
        callback(instance);
      }
    });
  }

  /**
   * set form field if save should be disabled
   * @param {string} field name of field for disable save
   * @param {*} data
   * @param {string=} form override field name if field and form have different names
   */
  function setFormFieldIfFailing(field, data, form) {
    if (!formsFailing[form]) {
      formsFailing[form] = saveShouldBeDisabled(field, data);
    }
  }

  formsFailing.atracker = saveShouldBeDisabled("atracker", json.atracker);
  forEachDisabledCheck("key_management", (kms) => {
    kms.keys.forEach((key) => {
      setFormFieldIfFailing("encryption_keys", key, "key_management");
    });
  });
  forEachDisabledCheck("object_storage", (cos) => {
    cos.buckets.forEach((bucket) =>
      setFormFieldIfFailing("buckets", bucket, "object_storage")
    );
  });
  forEachDisabledCheck("secrets_manager");
  forEachDisabledCheck("event_streams");
  // disableSave for icd not yet implemented
  // if (craig.store.json.icd) forEachDisabledCheck("icd");
  forEachDisabledCheck("appid");
  forEachDisabledCheck("vpcs", (vpc) => {
    vpc.acls.forEach((acl) => {
      setFormFieldIfFailing("acls", acl, "/form/nacls");
    });
    vpc.subnets.forEach((subnet) => {
      setFormFieldIfFailing("subnet", subnet, "/form/subnets");
    });
  });
  forEachDisabledCheck("routing_tables", (table) => {
    table.routes.forEach((route) => {
      setFormFieldIfFailing("routes", route, "routing_tables");
    });
  });
  forEachDisabledCheck("transit_gateways");
  forEachDisabledCheck("security_groups");
  forEachDisabledCheck("virtual_private_endpoints");
  forEachDisabledCheck("vpn_gateways");
  forEachDisabledCheck("clusters", (cluster) => {
    cluster.worker_pools.forEach((pool) => {
      setFormFieldIfFailing("worker_pools", pool, "clusters");
    });
  });
  forEachDisabledCheck("ssh_keys");
  forEachDisabledCheck("vsi", (vsi) => {
    if (vsi.volumes) {
      vsi.volumes.forEach((volume) => {
        setFormFieldIfFailing("volumes", volume, "vsi");
      });
    }
  });
  forEachDisabledCheck("load_balancers");
  forEachDisabledCheck("dns", (dns) => {
    dns.zones.forEach((zone) => {
      setFormFieldIfFailing("zones", zone, "dns");
    });
    dns.custom_resolvers.forEach((resolver) => {
      setFormFieldIfFailing("custom_resolvers", resolver, "dns");
    });
    dns.records.forEach((record) => {
      setFormFieldIfFailing("records", record, "dns");
    });
  });
  forEachDisabledCheck("vpn_servers", (server) => {
    server.routes.forEach((route) => {
      setFormFieldIfFailing("vpn_server_routes", route, "vpn_servers");
    });
  });
  forEachDisabledCheck("access_groups", (group) => {
    group.policies.forEach((policy) => {
      setFormFieldIfFailing("policies", policy, "access_groups");
    });
    group.dynamic_policies.forEach((policy) => {
      setFormFieldIfFailing("dynamic_policies", policy, "access_groups");
    });
  });
  forEachDisabledCheck(
    "cbr_zones",
    (zone) => {
      zone.addresses.forEach((address) => {
        setFormFieldIfFailing("addresses", address, "/form/cbr");
      });
      zone.exclusions.forEach((exclusion) => {
        setFormFieldIfFailing("exclusions", exclusion, "/form/cbr");
      });
    },
    "/form/cbr"
  );
  forEachDisabledCheck(
    "cbr_rules",
    (rule) => {
      rule.contexts.forEach((context) => {
        setFormFieldIfFailing("contexts", context, "/form/cbr");
      });
      rule.resource_attributes.forEach((attribute) => {
        setFormFieldIfFailing("resource_attributes", attribute, "/form/cbr");
      });
      rule.tags.forEach((tag) => {
        setFormFieldIfFailing("tags", tag, "/form/cbr");
      });
    },
    "/form/cbr"
  );
  formsFailing["/form/observability"] =
    saveShouldBeDisabled("logdna", json.logdna) ||
    saveShouldBeDisabled("sysdig", json.sysdig);
  forEachDisabledCheck("power", (workspace) => {
    if (!isEmpty(workspace.ssh_keys)) {
      workspace.ssh_keys.forEach((key) => {
        setFormFieldIfFailing("ssh_keys", key, "power");
      });
    }
  });
  forEachDisabledCheck("power_instances");
  forEachDisabledCheck("power_volumes");
  eachKey(formsFailing, (key) => {
    if (formsFailing[key]) {
      forms.push(key);
    }
  });
  return forms;
}

module.exports = {
  invalidForms,
};
