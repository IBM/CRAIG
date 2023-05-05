const {
  containsKeys,
  splatContains,
  transpose,
  revision,
  buildNetworkingRule,
  getObjectFromArray
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { newDefaultVpeSecurityGroups } = require("./defaults");
const {
  updateChild,
  setUnfoundResourceGroup,
  pushAndUpdate,
  carveChild,
  deleteSubChild,
  pushToChildField
} = require("./store.utils");
const { updateNetworkingRule, formatNetworkingRule } = require("./utils");

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
  config.store.json.security_groups.forEach(sg => {
    setUnfoundResourceGroup(config, sg);
    if (!splatContains(config.store.json.vpcs, "name", sg.vpc)) {
      sg.vpc = null;
      sg.rules.forEach(rule => {
        rule.vpc = null;
        rule.sg = sg.name;
      });
    }
    if (sg.vpc) {
      if (containsKeys(securityGroupMap, sg.vpc)) {
        securityGroupMap[sg.vpc].push(sg.name);
      } else securityGroupMap[sg.vpc] = [sg.name];
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
  pushAndUpdate(config, "security_groups", sg);
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
    stateData.rules.forEach(rule => {
      rule.vpc = stateData.vpc;
    });
  }
  if (stateData.name !== componentProps.data.name) {
    stateData.rules.forEach(rule => {
      rule.sg = stateData.name;
    });
  }
  updateChild(config, "security_groups", stateData, componentProps);
}

/**
 * delete security group
 * @param {lazyZstate} config landing zone store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function securityGroupDelete(config, stateData, componentProps) {
  carveChild(config, "security_groups", componentProps);
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
    data: componentProps.data
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
    .then(data => {
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
    data: componentProps.data
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
  securityGroupRulesDelete
};
