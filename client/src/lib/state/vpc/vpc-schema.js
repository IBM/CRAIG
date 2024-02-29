// schema files should be used when files are large
const { contains } = require("lazy-z");
const {
  resourceGroupsField,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  hideWhenUseData,
} = require("../utils");
const { invalidName, invalidNameText } = require("../reusable-fields");

/**
 * check if vpc name field is invalid
 * @param {*} field
 * @returns {Function} evaluates to boolean
 */
function invalidVpcName(field) {
  return function (stateData, componentProps) {
    return invalidName("vpcs")(field, stateData, componentProps);
  };
}

/**
 * check if vpc name field is invalid
 * @param {*} field
 * @returns {Function} evaluates to boolean
 */
function invalidVpcNameText(field) {
  return function (stateData, componentProps) {
    return invalidNameText("vpcs")(field, stateData, componentProps);
  };
}

/**
 * state function for toggle vpc public gateway
 * @param {*} zone
 */
function togglePgw(zone) {
  /**
   * pass through function to update state data
   * @param {*} stateData
   */
  return function (stateData) {
    let currentGw = [...stateData.publicGateways];
    if (contains(currentGw, zone)) {
      let index = currentGw.indexOf(zone);
      currentGw.splice(index, zone);
    } else {
      currentGw.push(zone);
    }
    stateData.publicGateways = currentGw;
  };
}

/**
 * create pgw toggle for zone
 * @param {number} zone
 * @returns {object} schema object for toggle
 */
function pgwToggle(zone) {
  return {
    size: "small",
    default: false,
    type: "toggle",
    labelText: "Create in Zone " + zone,
    onStateChange: togglePgw(zone),
    onRender: function (stateData) {
      return contains(stateData.publicGateways, zone);
    },
    hideWhen: hideWhenUseData,
  };
}

/**
 * vpc schema
 * @returns {object} vpc schema object
 */
function vpcSchema() {
  return {
    use_data: {
      type: "toggle",
      default: false,
      labelText: "Use Existing VPC",
      tooltip: {
        content: "Get VPC from Data Source",
        align: "bottom-left",
        alignModal: "bottom-left",
      },
      disabled: function (stateData, componentProps) {
        return componentProps?.data?.use_data;
      },
    },
    name: {
      default: "",
      invalid: invalidVpcName("name"),
      invalidText: invalidVpcNameText("name"),
      tooltip: {
        content:
          "This name will be prepended to all components within this VPC.",
        alignModal: "bottom-left",
        align: "bottom-left",
      },
      size: "small",
    },
    resource_group: resourceGroupsField(true),
    bucket: {
      default: "",
      type: "select",
      labelText: "Flow Logs Bucket Name",
      invalid: fieldIsNullOrEmptyString("bucket"),
      invalidText: selectInvalidText("bucket"),
      groups: function (stateData, componentProps) {
        return componentProps.craig.store.cosBuckets.concat("Disabled");
      },
      onRender: function (stateData) {
        return stateData.bucket === "$disabled" ? "Disabled" : stateData.bucket;
      },
      onInputChange: function (stateData) {
        if (stateData.bucket === "Disabled") {
          return "$disabled";
        } else return stateData.bucket;
      },
      size: "small",
      hideWhen: hideWhenUseData,
    },
    default_network_acl_name: {
      optional: true,
      default: "",
      invalid: invalidVpcName("default_network_acl_name"),
      invalidText: invalidVpcNameText("default_network_acl_name"),
      size: "small",
      hideWhen: hideWhenUseData,
    },
    default_security_group_name: {
      optional: true,
      default: "",
      invalid: invalidVpcName("default_security_group_name"),
      invalidText: invalidVpcNameText("default_security_group_name"),
      size: "small",
      hideWhen: hideWhenUseData,
    },
    default_routing_table_name: {
      optional: true,
      default: "",
      invalid: invalidVpcName("default_routing_table_name"),
      invalidText: invalidVpcNameText("default_routing_table_name"),
      size: "small",
      hideWhen: hideWhenUseData,
    },
    pgw_zone_1: pgwToggle(1),
    pgw_zone_2: pgwToggle(2),
    pgw_zone_3: pgwToggle(3),
    classic_access: {
      type: "toggle",
      size: "small",
      labelText: "Classic Infrastructure Access",
      hideWhen: hideWhenUseData,
    },
  };
}

module.exports = {
  vpcSchema,
};
