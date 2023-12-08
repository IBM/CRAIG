const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  setUnfoundResourceGroup,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  deleteUnfoundArrayItems,
  splat,
  getObjectFromArray,
  splatContains,
  isNullOrEmptyString,
  isEmpty,
  isInRange,
  revision,
} = require("lazy-z");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  kebabCaseInput,
  titleCaseRender,
  resourceGroupsField,
  unconditionalInvalidText,
  vpcGroups,
} = require("./utils");
const {
  invalidName,
  invalidDescription,
  invalidDnsZoneName,
} = require("../forms/invalid-callbacks");
const { invalidNameText } = require("../forms/text-callbacks");

function dnsInit(config) {
  config.store.json.dns = [];
}

/**
 * on store update for dns
 * @param {*} config
 */
function dnsOnStoreUpdate(config) {
  config.store.json.dns.forEach((dns) => {
    setUnfoundResourceGroup(config, dns);
    dns.zones.forEach((zone) => {
      zone.instance = dns.name;
      zone.vpcs = deleteUnfoundArrayItems(
        splat(config.store.json.vpcs, "name"),
        zone.vpcs
      );
    });
    dns.custom_resolvers.forEach((resolver) => {
      resolver.instance = dns.name;
      if (hasUnfoundVpc(config, resolver)) {
        resolver.vpc = null;
        resolver.subnets = [];
      } else {
        resolver.subnets = deleteUnfoundArrayItems(
          resolver.subnets,
          splat(
            getObjectFromArray(config.store.json.vpcs, "name", resolver.vpc)
              .subnets,
            "name"
          )
        );
      }
      if (!splatContains(dns.zones, "name", resolver.zone)) {
        resolver.zone = null;
      }
    });
  });
}

/**
 * save cbr rules
 * @param {object} stateData component state data
 * @param {string} stateData.name
 */
function dnsSave(config, stateData, componentProps) {
  config.updateChild(["json", "dns"], componentProps.data.name, stateData);
}

/**
 * create a new dns instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function dnsCreate(config, stateData) {
  stateData.records = [];
  stateData.zones = [];
  stateData.custom_resolvers = [];
  config.push(["json", "dns"], stateData);
}

/**
 * delete dns instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsDelete(config, stateData, componentProps) {
  config.carve(["json", "dns"], componentProps.data.name);
}

/**
 * create dns subfield
 * @param {string} field subfield name
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsSubFieldCreate(field, config, stateData, componentProps) {
  pushToChildFieldModal(config, "dns", field, stateData, componentProps);
}

/**
 * update dns subfield
 * @param {string} field subfield name
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsSubFieldSave(field, config, stateData, componentProps) {
  updateSubChild(config, "dns", field, stateData, componentProps);
}

/**
 * delete dns subfield
 * @param {string} field subfield name
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsSubFieldDelete(field, config, stateData, componentProps) {
  deleteSubChild(config, "dns", field, componentProps);
}

/**
 * create dns zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsZoneCreate(config, stateData, componentProps) {
  dnsSubFieldCreate("zones", config, stateData, componentProps);
}

/**
 * update dns zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsZoneSave(config, stateData, componentProps) {
  dnsSubFieldSave("zones", config, stateData, componentProps);
}

/**
 * delete dns zone
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsZoneDelete(config, stateData, componentProps) {
  dnsSubFieldDelete("zones", config, stateData, componentProps);
}

/**
 * create dns record
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsRecordCreate(config, stateData, componentProps) {
  dnsSubFieldCreate("records", config, stateData, componentProps);
}

/**
 * update dns record
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsRecordSave(config, stateData, componentProps) {
  dnsSubFieldSave("records", config, stateData, componentProps);
}

/**
 * delete dns record
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsRecordDelete(config, stateData, componentProps) {
  dnsSubFieldDelete("records", config, stateData, componentProps);
}

/**
 * create dns custom_resolvers
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsResolverCreate(config, stateData, componentProps) {
  dnsSubFieldCreate("custom_resolvers", config, stateData, componentProps);
}

/**
 * update dns custom_resolvers
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsResolverSave(config, stateData, componentProps) {
  dnsSubFieldSave("custom_resolvers", config, stateData, componentProps);
}

/**
 * delete dns custom_resolvers
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function dnsResolverDelete(config, stateData, componentProps) {
  dnsSubFieldDelete("custom_resolvers", config, stateData, componentProps);
}

/**
 * init dns store
 * @param {*} store
 */
function initDnsStore(store) {
  store.newField("dns", {
    init: dnsInit,
    onStoreUpdate: dnsOnStoreUpdate,
    create: dnsCreate,
    save: dnsSave,
    delete: dnsDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "plan"],
      "dns"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("dns"),
        invalidText: invalidNameText("dns"),
      },
      plan: {
        default: "free",
        groups: ["Free", "Standard"],
        invalidText: selectInvalidText("plan"),
        onInputChange: kebabCaseInput("plan"),
        onRender: titleCaseRender("plan"),
      },
      resource_group: resourceGroupsField(),
    },
    subComponents: {
      zones: {
        create: dnsZoneCreate,
        save: dnsZoneSave,
        delete: dnsZoneDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "vpcs", "label", "description"],
          "dns",
          "zones"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidDnsZoneName,
            invalidText: invalidNameText("zones"),
          },
          vpcs: {
            type: "multiselct",
            default: [],
            invalid: function (stateData) {
              return (
                isNullOrEmptyString(stateData.vpcs) || isEmpty(stateData.vpcs)
              );
            },
            invalidText: unconditionalInvalidText("Select at least one VPC"),
            groups: vpcGroups,
          },
          label: {
            default: "",
            invalid: fieldIsNullOrEmptyString("label"),
            invalidText: unconditionalInvalidText(
              "Label cannot be null or empty string"
            ),
          },
          description: {
            type: "textArea",
            default: "",
            invalid: function (stateData) {
              return invalidDescription(stateData.description);
            },
            invalidText: unconditionalInvalidText(
              "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/."
            ),
          },
        },
      },
      records: {
        create: dnsRecordCreate,
        save: dnsRecordSave,
        delete: dnsRecordDelete,
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "dns_zone",
            "type",
            "rdata",
            "preference",
            "port",
            "protocol",
            "priority",
            "service",
            "weight",
          ],
          "dns",
          "records"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("records"),
            invalidText: invalidNameText("records"),
          },
          dns_zone: {
            type: "select",
            default: "",
            invalid: fieldIsNullOrEmptyString("dns_zone"),
            invalidText: unconditionalInvalidText("Select a DNS Zone"),
            groups: function (stateData, componentProps) {
              return splat(
                new revision(componentProps.craig.store.json).child(
                  "dns",
                  componentProps.arrayParentName
                ).data.zones,
                "name"
              );
            },
          },
          rdata: {
            default: "",
            invalid: fieldIsNullOrEmptyString("rdata"),
          },
          type: {
            default: "",
            invalid: fieldIsNullOrEmptyString("type"),
          },
          preference: {
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "MX") {
                if (!isNullOrEmptyString(stateData.preference)) {
                  return !isInRange(parseInt(stateData.preference), 0, 65535);
                } else return true;
              } else return false;
            },
          },
          port: {
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                if (!isNullOrEmptyString(stateData.port)) {
                  return !isInRange(parseInt(stateData.port), 1, 65535);
                } else return true;
              } else return false;
            },
          },
          protocol: {
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                return (
                  isNullOrEmptyString(stateData.protocol) ||
                  stateData.protocol === undefined
                );
              } else return false;
            },
          },
          priority: {
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                if (!isNullOrEmptyString(stateData.priority)) {
                  return !isInRange(parseInt(stateData.priority), 0, 65535);
                } else return true;
              } else return false;
            },
          },
          service: {
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                if (
                  !isNullOrEmptyString(stateData.service) &&
                  stateData.service !== undefined
                ) {
                  return !stateData.service.startsWith("_");
                } else return true;
              } else return false;
            },
          },
          weight: {
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                if (!isNullOrEmptyString(stateData.weight)) {
                  return !isInRange(parseInt(stateData.weight), 0, 65535);
                } else return true;
              } else return false;
            },
          },
        },
      },
      custom_resolvers: {
        create: dnsResolverCreate,
        save: dnsResolverSave,
        delete: dnsResolverDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "vpc", "subnets", "description"],
          "dns",
          "custom_resolvers"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("custom_resolvers"),
            invalidText: invalidNameText("custom_resolvers"),
          },
          vpc: {
            default: "",
            invalid: fieldIsNullOrEmptyString("vpc"),
          },
          subnets: {
            default: "",
            invalid: function (stateData) {
              return isEmpty(stateData.subnets);
            },
          },
          description: {
            default: "",
            invalid: function (stateData) {
              return invalidDescription(stateData.description);
            },
          },
        },
      },
    },
  });
}

module.exports = {
  initDnsStore,
};
