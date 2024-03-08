const {
  containsKeys,
  splatContains,
  transpose,
  revision,
  buildNetworkingRule,
  getObjectFromArray,
  contains,
  isIpv4CidrOrAddress,
  isNullOrEmptyString,
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { newDefaultVpeSecurityGroups } = require("./defaults");
const {
  setUnfoundResourceGroup,
  deleteSubChild,
  pushToChildField,
} = require("./store.utils");
const {
  updateNetworkingRule,
  formatNetworkingRule,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  resourceGroupsField,
  selectInvalidText,
  vpcGroups,
  unconditionalInvalidText,
  kebabCaseInput,
  titleCaseRender,
} = require("./utils");
const { invalidNewResourceName } = require("../forms");
const {
  genericNameCallback,
  networkingRuleProtocolField,
  networkingRulePortField,
  networkingRuleTypeField,
  networkingRuleCodeField,
  getRuleProtocol,
  nameField,
  duplicateNameCallback,
} = require("./reusable-fields");

/**
 * intialize security groups
 * @param {*} config
 */
function securityGroupInit(config) {
  config.store.json.security_groups = newDefaultVpeSecurityGroups();
}

/**
 * on security group store update
 * @param {configStateStore} config landing zone store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.security_groups
 */

function securityGroupOnStoreUpdate(config) {
  let securityGroupMap = {};
  config.store.json.security_groups.forEach((sg) => {
    setUnfoundResourceGroup(config, sg);
    if (!splatContains(config.store.json.vpcs, "name", sg.vpc)) {
      sg.vpc = null;
      sg.use_data = false;
      sg.rules.forEach((rule) => {
        rule.vpc = null;
        rule.sg = sg.name;
      });
    }
    if (sg.vpc) {
      if (containsKeys(securityGroupMap, sg.vpc)) {
        securityGroupMap[sg.vpc].push(sg.name);
      } else securityGroupMap[sg.vpc] = [sg.name];
      sg.rules.forEach((rule) => {
        if (!rule.ruleProtocol) {
          rule.ruleProtocol = getRuleProtocol(rule);
        }
        ["port_min", "port_max", "type", "code"].forEach((field) => {
          if (!containsKeys(rule, field)) {
            rule[field] = null;
          }
        });
      });
    }
  });
  config.store.securityGroups = securityGroupMap;
}

/**
 * create a new security group
 * @param {lazyZstate} config
 * @param {Object} stateData state data from component
 */
function securityGroupCreate(config, stateData) {
  let sg = { resource_group: null, rules: [] };
  transpose(stateData, sg);
  config.push(["json", "security_groups"], sg);
}

/**
 * update security group
 * @param {lazyZstate} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function securityGroupSave(config, stateData, componentProps) {
  stateData.rules = componentProps.data.rules;
  if (stateData.vpc !== componentProps.data.vpc) {
    stateData.rules.forEach((rule) => {
      rule.vpc = stateData.vpc;
    });
  }
  if (stateData.name !== componentProps.data.name) {
    stateData.rules.forEach((rule) => {
      rule.sg = stateData.name;
    });
    [
      "load_balancers",
      "vsi",
      "virtual_private_endpoints",
      "vpn_servers",
    ].forEach((item) => {
      config.store.json[item].forEach((resource) => {
        if (contains(resource.security_groups, componentProps.data.name)) {
          resource.security_groups[
            resource.security_groups.indexOf(componentProps.data.name)
          ] = stateData.name;
        }
      });
    });
  }
  config.updateChild(
    ["json", "security_groups"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete security group
 * @param {lazyZstate} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function securityGroupDelete(config, stateData, componentProps) {
  config.carve(["json", "security_groups"], componentProps.data.name);
}

/**
 * create security group rule
 * @param {lazyZstate} config landing zone store
 * @param {object} stateData component state data
 * @param {string} stateData.direction
 * @param {object} componentProps props from component form
 * @param {string} componentProps.parent_name name of parent group
 * @param {object} componentProps.data component prop data
 */
function securityGroupRulesCreate(config, stateData, componentProps) {
  stateData.inbound = stateData.direction === "inbound" ? true : false;
  let rule = buildNetworkingRule(stateData);
  let parent = getObjectFromArray(
    config.store.json.security_groups,
    "name",
    componentProps.parent_name
  );
  rule.vpc = parent.vpc;
  rule.sg = parent.name;
  pushToChildField(config, "security_groups", "rules", rule, {
    arrayParentName: componentProps.parent_name,
    data: componentProps.data,
  });
}

/**
 * update security group rule
 * @param {lazyZstate} config landing zone store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {object} stateData component state data
 * @param {string} stateData.direction
 * @param {object} componentProps props from component form
 * @param {string} componentProps.parent_name name of parent group
 * @param {object} componentProps.data component prop data
 * @param {string} componentProps.data.name old name of rule
 */
function securityGroupRulesSave(config, stateData, componentProps) {
  let networkRule = stateData;
  formatNetworkingRule(networkRule, componentProps, true);
  new revision(config.store.json)
    .child("security_groups", componentProps.parent_name) // get security group
    .child("rules", componentProps.data.name) // get rule
    .then((data) => {
      // update rule and update parent
      updateNetworkingRule(false, data, stateData);
    });
}

/**
 * delete security group rule
 * @param {lazyZstate} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.parent_name name of parent group
 * @param {object} componentProps.data component prop data
 * @param {string} componentProps.data.name old name of rule
 */
function securityGroupRulesDelete(config, stateData, componentProps) {
  deleteSubChild(config, "security_groups", "rules", {
    arrayParentName: componentProps.parent_name,
    data: componentProps.data,
  });
}

/**
 * check if security group rule name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidSecurityGroupRuleName(stateData, componentProps) {
  let duplicateRuleName = false;
  let ruleRef = componentProps.rules;
  if (stateData.name !== componentProps.data.name) {
    duplicateRuleName = splatContains(ruleRef, "name", stateData.name);
  }
  return duplicateRuleName || invalidNewResourceName(stateData.name);
}

/**
 * get invalid sg rule text
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} invalid text
 */
function invalidSecurityGroupRuleText(stateData, componentProps) {
  if (
    invalidSecurityGroupRuleName(stateData, componentProps) &&
    !invalidNewResourceName(stateData.name)
  ) {
    return duplicateNameCallback(stateData.name);
  } else return genericNameCallback();
}

/**
 * init sg store
 * @param {*} store
 */
function initSecurityGroupStore(store) {
  store.newField("security_groups", {
    init: securityGroupInit,
    onStoreUpdate: securityGroupOnStoreUpdate,
    create: securityGroupCreate,
    save: securityGroupSave,
    delete: securityGroupDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "vpc"],
      "security_groups"
    ),
    schema: {
      use_data: {
        type: "toggle",
        default: false,
        labelText: "Use Existing Security Group",
        hideWhen: function (stateData, componentProps) {
          return (
            getObjectFromArray(
              componentProps.craig.store.json.vpcs,
              "name",
              stateData.vpc || "" // modal
            )?.use_data !== true
          );
        },
      },
      name: nameField("security_groups", { size: "small" }),
      resource_group: resourceGroupsField(true),
      vpc: {
        type: "select",
        labelText: "VPC",
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
        invalidText: selectInvalidText("vpc"),
        size: "small",
        groups: vpcGroups,
        disabled: function (stateData) {
          return stateData.use_data && !isNullOrEmptyString(stateData.vpc);
        },
      },
    },
    subComponents: {
      rules: {
        create: securityGroupRulesCreate,
        save: securityGroupRulesSave,
        delete: securityGroupRulesDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "source", "type", "code", "port_min", "port_max"],
          "security_groups",
          "rules"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidSecurityGroupRuleName,
            invalidText: invalidSecurityGroupRuleText,
            size: "small",
          },
          source: {
            labelText: "CIDR",
            default: "",
            invalid: function (stateData, componentProps) {
              return !isIpv4CidrOrAddress(stateData.source || "");
            },
            invalidText: unconditionalInvalidText(
              "Please provide a valid IPV4 IP address or CIDR notation."
            ),
            size: "small",
            placeholder: "x.x.x.x",
          },
          direction: {
            size: "small",
            type: "select",
            default: "",
            groups: ["Inbound", "Outbound"],
            invalid: fieldIsNullOrEmptyString("direction"),
            invalidText: selectInvalidText("direction"),
            onInputChange: kebabCaseInput("direction"),
            onRender: titleCaseRender("direction"),
          },
          ruleProtocol: networkingRuleProtocolField(),
          port_min: networkingRulePortField(),
          port_max: networkingRulePortField(true),
          type: networkingRuleTypeField(),
          code: networkingRuleCodeField(),
        },
      },
    },
  });
}

module.exports = {
  securityGroupInit,
  securityGroupOnStoreUpdate,
  securityGroupCreate,
  securityGroupSave,
  securityGroupDelete,
  securityGroupRulesCreate,
  securityGroupRulesSave,
  securityGroupRulesDelete,
  initSecurityGroupStore,
};
