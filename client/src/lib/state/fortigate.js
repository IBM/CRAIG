const { splatContains, revision, splat } = require("lazy-z");
const { setUnfoundResourceGroup, hasUnfoundVpc } = require("./store.utils");
const {
  shouldDisableComponentSave,
  resourceGroupsField,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  securityGroupsMultiselect,
  vpcSshKeyMultiselect,
  vpcGroups,
} = require("./utils");
const { invalidName, invalidNameText } = require("../forms");

/**
 * get vnf subnet groups
 * @param {string} fieldToCheck name of the field to check for validation when a zone is selected
 * @returns {Function} groups function
 */
function vnfSubnetGroups(fieldToCheck) {
  return function (stateData, componentProps) {
    return stateData.vpc
      ? splat(
          new revision(componentProps.craig.store.json)
            .child("vpcs", stateData.vpc)
            .data.subnets.filter((subnet) => {
              if (
                stateData.zone &&
                subnet.zone === Number(stateData.zone) &&
                subnet.name !== stateData[fieldToCheck]
              ) {
                // if a zone is selected and not already in use, return
                return subnet;
              } else if (!stateData.zone) {
                // otherwise if no zone, send
                return subnet;
              }
            }),
          "name"
        )
      : [];
  };
}

/**
 * handle subnet state change
 * @param {string} field
 * @returns {Function} on state change function
 */
function vnfOnSubnetStatechange(field) {
  return function (stateData, componentProps, targetData) {
    if (!stateData.zone) {
      stateData.zone = new revision(componentProps.craig.store.json)
        .child("vpcs", stateData.vpc)
        .child("subnets", targetData).data.zone;
    }
    stateData[field] = targetData;
  };
}

/**
 * init store
 * @param {*} store
 */
function initFortigateStore(store) {
  store.newField("fortigate_vnf", {
    init: (config) => {
      config.store.json.fortigate_vnf = [];
    },
    onStoreUpdate: function (config) {
      if (config.store.json.fortigate_vnf)
        config.store.json.fortigate_vnf.forEach((gw) => {
          setUnfoundResourceGroup(config, gw);
          let invalidVpc = hasUnfoundVpc(config, gw);
          if (invalidVpc) {
            gw.primary_subnet = null;
            gw.secondary_subnet = null;
            gw.vpc = null;
            gw.security_groups = [];
          }
          let nextSshKeys = [];
          gw.ssh_keys.forEach((key) => {
            if (splatContains(config.store.json.ssh_keys, "name", key)) {
              nextSshKeys.push(key);
            }
          });
          gw.ssh_keys = nextSshKeys;
        });
      else config.store.json.fortigate_vnf = [];
    },
    create: function (config, stateData) {
      config.push(["json", "fortigate_vnf"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "fortigate_vnf"],
        componentProps.data.name,
        stateData
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(["json", "fortigate_vnf"], componentProps.data.name);
    },
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "resource_group",
        "vpc",
        "primary_subnet",
        "secondary_subnet",
        "profile",
        "ssh_keys",
        "security_groups",
      ],
      "fortigate_vnf"
    ),
    schema: {
      name: {
        size: "small",
        default: "",
        invalid: invalidName("fortigate_vnf"),
        invalidText: invalidNameText("fortigate_vnf"),
      },
      resource_group: resourceGroupsField(true),
      vpc: {
        type: "select",
        labelText: "VPC",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
        invalidText: selectInvalidText("VPC"),
        groups: vpcGroups,
        onInputChange: function (stateData) {
          stateData.security_groups = [];
          stateData.primary_subnet = null;
          stateData.secondary_subnet = null;
          stateData.zone = null;
          return stateData.vpc;
        },
      },
      primary_subnet: {
        size: "small",
        default: "",
        type: "select",
        groups: vnfSubnetGroups("secondary_subnet"),
        invalid: fieldIsNullOrEmptyString("primary_subnet"),
        invalidText: selectInvalidText("primary subnet"),
        onStateChange: vnfOnSubnetStatechange("primary_subnet"),
      },
      secondary_subnet: {
        size: "small",
        default: "",
        type: "select",
        groups: vnfSubnetGroups("primary_subnet"),
        invalid: fieldIsNullOrEmptyString("secondary_subnet"),
        invalidText: selectInvalidText("secondary subnet"),
        onStateChange: vnfOnSubnetStatechange("secondary_subnet"),
      },
      profile: {
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("profile"),
        invalidText: selectInvalidText("profile"),
        size: "small",
        type: "fetchSelect",
        groups: [],
        apiEndpoint: function (stateData, componentProps) {
          return `/api/vsi/${componentProps.craig.store.json._options.region}/instanceProfiles`;
        },
      },
      security_groups: securityGroupsMultiselect(),
      ssh_keys: vpcSshKeyMultiselect(),
    },
  });
}

module.exports = {
  initFortigateStore,
};
