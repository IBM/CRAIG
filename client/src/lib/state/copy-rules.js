const {
  revision,
  splatContains,
  transpose,
  getObjectFromArray,
  isNullOrEmptyString,
  splat
} = require("lazy-z");
const { clusterRules } = require("../constants");

/**
 * add cluster rules and update
 * @param {lazyZstate} store
 * @param {string} vpcName
 * @param {string} aclName
 */
function addClusterRules(store, vpcName, aclName) {
  let acl = new revision(store.store.json)
    .child("vpcs", vpcName, "name")
    .child("acls", aclName, "name").data;
  clusterRules.forEach(rule => {
    if (!splatContains(acl.rules, "name", rule.name)) {
      let newRule = {
        vpc: vpcName,
        acl: aclName
      };
      transpose(rule, newRule);
      acl.rules.push(newRule);
    }
  });
  store.update();
}

/**
 * copy security group from one vpc to another and update
 * @param {lazyZstate} store
 * @param {string} sourceSecurityGroup name of acl to copy
 * @param {string} destinationVpc copy destination
 */
function copySecurityGroup(store, sourceSecurityGroup, destinationVpc) {
  let oldSg = new revision(store.store.json).child(
    "security_groups",
    sourceSecurityGroup,
    "name"
  ).data;
  let sg = {};
  transpose(oldSg, sg);
  sg.name += "-copy";
  sg.vpc = destinationVpc;
  sg.rules.forEach(rule => {
    rule.vpc = sg.vpc;
    rule.sg = sg.name;
  });
  store.store.json.security_groups.push(sg);
  store.update();
}

/**
 * copy network acl from one vpc to another and update
 * @param {lazyZstate} store
 * @param {string} sourceVpc source vpc
 * @param {string} aclName name of acl to copy
 * @param {string} destinationVpc copy destination
 */
function copyNetworkAcl(store, sourceVpc, aclName, destinationVpc) {
  let oldAcl = new revision(store.store.json)
    .child("vpcs", sourceVpc, "name")
    .child("acls", aclName, "name").data;
  let acl = {};
  transpose(oldAcl, acl);
  acl.vpc = destinationVpc;
  acl.name += "-copy";
  acl.rules.forEach(rule => {
    rule.vpc = acl.vpc;
    rule.acl = acl.name;
  });
  getObjectFromArray(store.store.json.vpcs, "name", destinationVpc).acls.push(
    acl
  );
  store.update();
}

/**
 * copy acl rule to list and update
 * @param {lazyZstate} store
 * @param {string} sourceVpc
 * @param {string} aclName
 * @param {string} ruleName
 * @param {string} destinationAcl
 */
function copyRule(store, sourceVpc, aclName, ruleName, destinationAcl) {
  let oldRule = new revision(store.store.json)
    .child("vpcs", sourceVpc, "name")
    .child("acls", aclName, "name")
    .child("rules", ruleName, "name").data;
  let rule = {};
  transpose(oldRule, rule);
  store.store.json.vpcs.forEach(vpc => {
    if (splatContains(vpc.acls, "name", destinationAcl)) {
      rule.vpc = vpc.name;
      rule.acl = destinationAcl;
      getObjectFromArray(vpc.acls, "name", destinationAcl).rules.push(rule);
    }
  });
  store.update();
}

/**
 * copy sg rule to list and update
 * @param {lazyZstate} store
 * @param {string} sgName
 * @param {string} ruleName
 * @param {string} destinationSg
 */
function copySgRule(store, sgName, ruleName, destinationSg) {
  let oldRule = new revision(store.store.json)
    .child("security_groups", sgName, "name")
    .child("rules", ruleName, "name").data;
  let rule = {};
  transpose(oldRule, rule);
  rule.sg = destinationSg;
  new revision(store.store.json)
    .child("security_groups", destinationSg, "name")
    .then(data => {
      rule.vpc = data.vpc;
      delete data.show;
      data.rules.push(rule);
    });
  store.update();
}

/**
 * get all acls or security groups other than selected one for rule copy
 * @param {lazyZstate} store
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Array<string>} list of acl names
 */
function getAllOtherGroups(store, stateData, componentProps) {
  let ruleSource = stateData.ruleSource;
  if (isNullOrEmptyString(ruleSource)) {
    return [];
  } else if (componentProps.isAclForm) {
    // handle acls
    let aclNames = [];
    store.store.json.vpcs.forEach(vpc => {
      vpc.acls.forEach(acl => {
        if (acl.name !== ruleSource) aclNames.push(acl.name);
      });
    });
    return aclNames;
  } else {
    // handle security groups
    return splat(store.store.json.security_groups, "name").filter(name => {
      if (name !== ruleSource) return name;
    });
  }
}

/**
 * get all rule names
 * @param {lazyZstate} store
 * @param {string} ruleSource rule source
 * @param {string=} sourceName vpc acl source name, used only for acls
 */
function getAllRuleNames(store, ruleSource, sourceName) {
  if (ruleSource && sourceName) {
    return splat(
      new revision(store.store.json)
        .child("vpcs", sourceName, "name")
        .child("acls", ruleSource, "name").data.rules,
      "name"
    );
  } else if (ruleSource) {
    return splat(
      new revision(store.store.json).child(
        "security_groups",
        ruleSource,
        "name"
      ).data.rules,
      "name"
    );
  } else return [];
}

module.exports = {
  addClusterRules,
  copySecurityGroup,
  copyNetworkAcl,
  copyRule,
  copySgRule,
  getAllOtherGroups,
  getAllRuleNames
};
