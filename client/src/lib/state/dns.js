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
  contains,
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
  subnetMultiSelect,
  fieldIsNotWholeNumber,
  timeToLive,
} = require("./utils");
const { invalidDescription } = require("../forms/invalid-callbacks");
const { dnsZoneNameExp } = require("../constants");
const {
  nameField,
  hasDuplicateName,
  invalidNameText,
  hideWhenFieldFalse,
} = require("./reusable-fields");

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
 * hide when record is not SRV
 * @param {*} stateData
 * @returns {boolean} true if should be hidden
 */
function hideWhenRecordNotSrv(stateData) {
  return stateData.type !== "SRV";
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
      name: nameField("dns", { size: "small" }),
      plan: {
        size: "small",
        type: "select",
        default: "free",
        groups: ["Free", "Standard"],
        invalidText: selectInvalidText("plan"),
        onInputChange: kebabCaseInput("plan"),
        onRender: titleCaseRender("plan"),
      },
      resource_group: resourceGroupsField(true),
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
            size: "small",
            default: "",
            invalid: function (stateData, componentProps) {
              let allZoneNames = [];
              componentProps.craig.store.json.dns.forEach((instance) => {
                instance.zones.forEach((zone) => {
                  if (
                    (componentProps.data &&
                      componentProps.data.name !== zone.name) ||
                    componentProps.isModal
                  ) {
                    allZoneNames.push(zone.name);
                  }
                });
              });
              return contains(allZoneNames, stateData.name)
                ? true
                : hasDuplicateName(
                    "zones",
                    stateData,
                    componentProps,
                    "name"
                  ) || stateData.name
                ? stateData.name.match(dnsZoneNameExp) === null
                : true;
            },
            invalidText: invalidNameText("zones"),
          },
          vpcs: {
            size: "small",
            labelText: "VPC Networks",
            type: "multiselect",
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
            size: "small",
            default: "",
            invalid: fieldIsNullOrEmptyString("label"),
            invalidText: unconditionalInvalidText(
              "Label cannot be null or empty string"
            ),
          },
          description: {
            labelText: "Description",
            type: "textArea",
            default: "",
            invalid: function (stateData) {
              return invalidDescription(stateData.description);
            },
            invalidText: unconditionalInvalidText(
              "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/."
            ),
            placeholder: "(Optional) DNS Zone Description",
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
            "vpc",
            "vsi",
            "ttl",
          ],
          "dns",
          "records"
        ),
        schema: {
          use_vsi: {
            type: "toggle",
            labelText: "Use VSI IP Address",
            default: false,
            tooltip: {
              content:
                "Use the IP address of a primary network interface for a VPC Virtual Server as the resource data for this record",
            },
          },
          vpc: {
            size: "small",
            labelText: "VPC",
            default: "",
            type: "select",
            groups: vpcGroups,
            invalidText: selectInvalidText("VPC"),
            invalid: function (stateData) {
              return stateData.use_vsi
                ? isNullOrEmptyString(stateData.vpc, true)
                : false;
            },
            hideWhen: hideWhenFieldFalse("use_vsi"),
          },
          vsi: {
            size: "small",
            labelText: "Virtual Server Instance",
            default: "",
            type: "select",
            invalid: function (stateData) {
              return stateData.use_vsi
                ? isNullOrEmptyString(stateData.vsi, true)
                : false;
            },
            invalidText: selectInvalidText("VSI"),
            groups: function (stateData, componentProps) {
              let allVsi = componentProps.craig.store.json.vsi.filter((vsi) => {
                if (vsi.vpc === stateData.vpc) {
                  return vsi;
                }
              });
              let allVsiNames = [];
              allVsi.forEach((deployment) => {
                for (let i = 0; i < deployment.subnets.length; i++) {
                  for (let j = 0; j < deployment.vsi_per_subnet; j++) {
                    allVsiNames.push(`${deployment.name}-${i + 1}-${j + 1}`);
                  }
                }
              });
              return allVsiNames;
            },
            hideWhen: hideWhenFieldFalse("use_vsi"),
          },
          name: nameField("records", { size: "small" }),
          dns_zone: {
            size: "small",
            labelText: "DNS Zone",
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
            size: "small",
            labelText: "Resource Data",
            default: "",
            invalid: fieldIsNullOrEmptyString("rdata"),
            invalidText: unconditionalInvalidText(
              "Resource Data cannot be null or empty string."
            ),
            hideWhen: hideWhenFieldFalse("use_vsi", true),
          },
          ttl: timeToLive(),
          type: {
            size: "small",
            type: "select",
            default: "",
            invalid: fieldIsNullOrEmptyString("type"),
            invalidText: selectInvalidText("DNS record type"),
            groups: ["A", "AAAA", "CNAME", "PTR", "TXT", "MX", "SRV"],
          },
          preference: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "MX") {
                return fieldIsNotWholeNumber("preference", 0, 65535)(stateData);
              } else return false;
            },
            invalidText: unconditionalInvalidText(
              "Must be a whole number within range 0 and 65535"
            ),
            hideWhen: function (stateData) {
              return stateData.type !== "MX";
            },
          },
          port: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                return fieldIsNotWholeNumber("port", 1, 65535)(stateData);
              } else return false;
            },
            invalidText: unconditionalInvalidText(
              "Must be a whole number between 1 and 65535"
            ),
            hideWhen: hideWhenRecordNotSrv,
          },
          protocol: {
            size: "small",
            type: "select",
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                return isNullOrEmptyString(stateData.protocol, true);
              } else return false;
            },
            invalidText: selectInvalidText("protocol"),
            groups: ["TCP", "UDP"],
            hideWhen: hideWhenRecordNotSrv,
          },
          priority: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                return fieldIsNotWholeNumber("priority", 0, 65535)(stateData);
              } else return false;
            },
            invalidText: unconditionalInvalidText(
              "Must be a whole number between 0 and 65535"
            ),
            hideWhen: hideWhenRecordNotSrv,
          },
          service: {
            size: "small",
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
            invalidText: unconditionalInvalidText(
              "Service must start with a '_'."
            ),
            hideWhen: hideWhenRecordNotSrv,
          },
          weight: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              if (stateData.type === "SRV") {
                if (!isNullOrEmptyString(stateData.weight, true)) {
                  return !isInRange(parseInt(stateData.weight), 0, 65535);
                } else return true;
              } else return false;
            },
            invalidText: unconditionalInvalidText(
              "Must be a whole number between 0 and 65535"
            ),
            hideWhen: hideWhenRecordNotSrv,
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
          name: nameField("custom_resolvers", { size: "small" }),
          vpc: {
            size: "small",
            type: "select",
            labelText: "VPC",
            default: "",
            invalid: fieldIsNullOrEmptyString("vpc"),
            invalidText: selectInvalidText("VPC"),
            groups: vpcGroups,
          },
          subnets: subnetMultiSelect({
            invalid: function (stateData) {
              return stateData.subnets.length > 3;
            },
            invalidText: "Select between 1 and 3 subnets",
          }),
          description: {
            labelText: "Description",
            type: "textArea",
            default: "",
            invalid: function (stateData) {
              return invalidDescription(stateData.description);
            },
            invalidText: unconditionalInvalidText(
              "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/."
            ),
            placeholder: unconditionalInvalidText(
              "(Optional) Custom Resolver Description"
            ),
          },
        },
      },
    },
  });
}

module.exports = {
  initDnsStore,
};
