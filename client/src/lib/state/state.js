const { lazyZstate } = require("lazy-z/lib/store");
const {
  contains,
  typeCheck,
  getObjectFromArray,
  splatContains,
  transpose,
  revision
} = require("lazy-z");
const { optionsInit, optionsSave } = require("./options");
const {
  keyManagementInit,
  keyManagementOnStoreUpdate,
  keyManagementSave,
  kmsKeyCreate,
  kmsKeyDelete,
  kmsKeySave,
  keyManagementCreate,
  keyManagementDelete
} = require("./key-management");
const {
  resourceGroupInit,
  resourceGroupOnStoreUpdate,
  resourceGroupCreate,
  resourceGroupSave,
  resourceGroupDelete
} = require("./resource-groups");
const {
  cosInit,
  cosOnStoreUpdate,
  cosCreate,
  cosSave,
  cosDelete,
  cosBucketCreate,
  cosBucketSave,
  cosBucketDelete,
  cosKeyCreate,
  cosKeySave,
  cosKeyDelete
} = require("./cos");
const {
  atrackerInit,
  atrackerOnStoreUpdate,
  atrackerSave
} = require("./atracker");
const {
  appidCreate,
  appidOnStoreUpdate,
  appidSave,
  appidDelete,
  appidKeyCreate,
  appidKeySave,
  appidKeyDelete
} = require("./appid");
const {
  vpcCreate,
  vpcDelete,
  vpcInit,
  vpcOnStoreUpdate,
  vpcSave,
  subnetCreate,
  subnetSave,
  subnetDelete,
  subnetTierCreate,
  subnetTierSave,
  subnetTierDelete,
  naclCreate,
  naclSave,
  naclDelete,
  naclRuleCreate,
  naclRuleSave,
  naclRuleDelete,
  createEdgeVpc
} = require("./vpc");
const { sccInit, sccSave, sccDelete } = require("./scc");
const {
  sshKeyCreate,
  sshKeyDelete,
  sshKeySave,
  sshKeyInit,
  sshKeyOnStoreUpdate
} = require("./ssh-keys.js");
const {
  securityGroupInit,
  securityGroupOnStoreUpdate,
  securityGroupCreate,
  securityGroupSave,
  securityGroupDelete,
  securityGroupRulesCreate,
  securityGroupRulesSave,
  securityGroupRulesDelete
} = require("./security-groups");
const {
  transitGatewayInit,
  transitGatewayOnStoreUpdate,
  transitGatewayCreate,
  transitGatewayDelete,
  transitGatewaySave
} = require("./transit-gateways");
const {
  vpnInit,
  vpnCreate,
  vpnDelete,
  vpnSave,
  vpnOnStoreUpdate
} = require("./vpn");
const {
  clusterInit,
  clusterCreate,
  clusterDelete,
  clusterOnStoreUpdate,
  clusterSave,
  clusterWorkerPoolCreate,
  clusterWorkerPoolDelete,
  clusterWorkerPoolSave
} = require("./clusters");
const {
  vsiCreate,
  vsiInit,
  vsiDelete,
  vsiOnStoreUpdate,
  vsiSave,
  vsiVolumeCreate,
  vsiVolumeDelete,
  vsiVolumeSave
} = require("./vsi");
const {
  vpeInit,
  vpeCreate,
  vpeDelete,
  vpeSave,
  vpeOnStoreUpdate
} = require("./vpe");
const {
  f5Init,
  f5VsiSave,
  f5InstanceSave,
  f5TemplateSave,
  f5VsiCreate,
  f5OnStoreUpdate
} = require("./f5");
const {
  loadBalancerInit,
  loadBalancerOnStoreUpdate,
  loadBalancerCreate,
  loadBalancerSave,
  loadBalancerDelete
} = require("./load-balancers");
const {
  eventStreamsOnStoreUpdate,
  eventStreamsCreate,
  eventStreamsSave,
  eventStreamsDelete
} = require("./event-streams");
const {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete
} = require("./secrets-manager");
const {
  iamInit,
  iamSave,
  accessGroupInit,
  accessGroupOnStoreUpdate,
  accessGroupCreate,
  accessGroupSave,
  accessGroupDelete,
  accessGroupPolicyCreate,
  accessGroupPolicySave,
  accessGroupPolicyDelete,
  accessGroupDynamicPolicyCreate,
  accessGroupDynamicPolicySave,
  accessGroupDynamicPolicyDelete
} = require("./iam");
const { clusterRules } = require("../constants");

const state = function() {
  let store = new lazyZstate({
    _defaults: {
      json: {
        iam_account_settings: {
          enable: false
        },
        access_groups: [],
        secrets_manager: [],
        f5_vsi: []
      },
      cosBuckets: [],
      cosKeys: [],
      hideCodeMirror: false,
      hideFooter: false,
      jsonInCodeMirror: false
    },
    _no_default: []
  });

  /**
   * toggle a state store value
   * @param {string} value name of the boolean value to toggle
   */
  store.toggleStoreValue = function(value) {
    typeCheck(
      `store.toggleStoreValue - store.${value}`,
      "boolean",
      store.store[value]
    );
    store.store[value] = !store.store[value];
  };

  /**
   * update unfound value from store
   * @param {string} listName name of the list within the store
   * @param {Object} obj arbitrary object
   * @param {string} field name of the field on the object to update
   */
  store.updateUnfound = function(listName, obj, field) {
    if (!contains(store.store[listName], obj[field])) {
      obj[field] = null;
    }
  };

  /**
   * update the resourceGroup field for an object
   * @param {Object} obj arbitrary object
   * @param {string=} field name of the field to update default to `resource_group`
   */
  store.updateUnfoundResourceGroup = function(obj, field) {
    let rgField = field || "resource_group";
    store.updateUnfound("resourceGroups", obj, rgField);
  };

  store.createEdgeVpc = function(pattern, managementVpc) {
    createEdgeVpc(store, pattern, managementVpc);
  };

  store.newField("options", {
    init: optionsInit,
    save: optionsSave
  });

  store.newField("resource_groups", {
    init: resourceGroupInit,
    onStoreUpdate: resourceGroupOnStoreUpdate,
    create: resourceGroupCreate,
    save: resourceGroupSave,
    delete: resourceGroupDelete
  });

  // components must check for key management second
  store.newField("key_management", {
    init: keyManagementInit,
    onStoreUpdate: keyManagementOnStoreUpdate,
    save: keyManagementSave,
    create: keyManagementCreate,
    delete: keyManagementDelete,
    subComponents: {
      keys: {
        create: kmsKeyCreate,
        delete: kmsKeyDelete,
        save: kmsKeySave
      }
    }
  });

  // next, update cos
  store.newField("object_storage", {
    init: cosInit,
    onStoreUpdate: cosOnStoreUpdate,
    create: cosCreate,
    save: cosSave,
    delete: cosDelete,
    subComponents: {
      buckets: {
        create: cosBucketCreate,
        save: cosBucketSave,
        delete: cosBucketDelete
      },
      keys: {
        create: cosKeyCreate,
        save: cosKeySave,
        delete: cosKeyDelete
      }
    }
  });

  store.newField("vpcs", {
    init: vpcInit,
    onStoreUpdate: vpcOnStoreUpdate,
    create: vpcCreate,
    save: vpcSave,
    delete: vpcDelete,
    subComponents: {
      acls: {
        create: naclCreate,
        save: naclSave,
        delete: naclDelete,
        subComponents: {
          rules: {
            create: naclRuleCreate,
            save: naclRuleSave,
            delete: naclRuleDelete
          }
        }
      },
      subnets: {
        create: subnetCreate,
        save: subnetSave,
        delete: subnetDelete
      },
      subnetTiers: {
        create: subnetTierCreate,
        save: subnetTierSave,
        delete: subnetTierDelete
      }
    }
  });

  store.newField("atracker", {
    init: atrackerInit,
    onStoreUpdate: atrackerOnStoreUpdate,
    save: atrackerSave
  });

  store.newField("appid", {
    init: config => {
      config.store.json.appid = [];
    },
    onStoreUpdate: appidOnStoreUpdate,
    create: appidCreate,
    save: appidSave,
    delete: appidDelete,
    subComponents: {
      keys: {
        create: appidKeyCreate,
        save: appidKeySave,
        delete: appidKeyDelete
      }
    }
  });

  store.newField("scc", {
    init: sccInit,
    save: sccSave,
    delete: sccDelete
  });

  store.newField("ssh_keys", {
    init: sshKeyInit,
    onStoreUpdate: sshKeyOnStoreUpdate,
    create: sshKeyCreate,
    save: sshKeySave,
    delete: sshKeyDelete
  });

  store.newField("security_groups", {
    init: securityGroupInit,
    onStoreUpdate: securityGroupOnStoreUpdate,
    create: securityGroupCreate,
    save: securityGroupSave,
    delete: securityGroupDelete,
    subComponents: {
      rules: {
        create: securityGroupRulesCreate,
        save: securityGroupRulesSave,
        delete: securityGroupRulesDelete
      }
    }
  });

  store.newField("transit_gateways", {
    init: transitGatewayInit,
    onStoreUpdate: transitGatewayOnStoreUpdate,
    create: transitGatewayCreate,
    save: transitGatewaySave,
    delete: transitGatewayDelete
  });

  store.newField("vpn_gateways", {
    init: vpnInit,
    onStoreUpdate: vpnOnStoreUpdate,
    create: vpnCreate,
    save: vpnSave,
    delete: vpnDelete
  });

  store.newField("clusters", {
    init: clusterInit,
    onStoreUpdate: clusterOnStoreUpdate,
    create: clusterCreate,
    save: clusterSave,
    delete: clusterDelete,
    subComponents: {
      worker_pools: {
        create: clusterWorkerPoolCreate,
        save: clusterWorkerPoolSave,
        delete: clusterWorkerPoolDelete
      }
    }
  });

  store.newField("vsi", {
    init: vsiInit,
    onStoreUpdate: vsiOnStoreUpdate,
    create: vsiCreate,
    save: vsiSave,
    delete: vsiDelete,
    subComponents: {
      volumes: {
        create: vsiVolumeCreate,
        save: vsiVolumeSave,
        delete: vsiVolumeDelete
      }
    }
  });

  store.newField("virtual_private_endpoints", {
    init: vpeInit,
    onStoreUpdate: vpeOnStoreUpdate,
    create: vpeCreate,
    save: vpeSave,
    delete: vpeDelete
  });

  store.newField("f5", {
    init: f5Init,
    onStoreUpdate: f5OnStoreUpdate,
    subComponents: {
      instance: {
        save: f5InstanceSave
      },
      vsi: {
        create: f5VsiCreate,
        save: f5VsiSave
      }
    }
  });

  store.newField("load_balancers", {
    init: loadBalancerInit,
    onStoreUpdate: loadBalancerOnStoreUpdate,
    create: loadBalancerCreate,
    save: loadBalancerSave,
    delete: loadBalancerDelete
  });

  store.newField("event_streams", {
    init: config => {
      config.store.json.event_streams = [];
    },
    onStoreUpdate: eventStreamsOnStoreUpdate,
    create: eventStreamsCreate,
    save: eventStreamsSave,
    delete: eventStreamsDelete
  });

  store.newField("secrets_manager", {
    init: config => {
      config.store.json.secrets_manager = [];
    },
    onStoreUpdate: secretsManagerOnStoreUpdate,
    create: secretsManagerCreate,
    save: secretsManagerSave,
    delete: secretsManagerDelete
  });

  store.newField("iam_account_settings", {
    init: iamInit,
    save: iamSave
  });

  store.newField("access_groups", {
    init: accessGroupInit,
    onStoreUpdate: accessGroupOnStoreUpdate,
    create: accessGroupCreate,
    save: accessGroupSave,
    delete: accessGroupDelete,
    subComponents: {
      policies: {
        create: accessGroupPolicyCreate,
        save: accessGroupPolicySave,
        delete: accessGroupPolicyDelete
      },
      dynamic_policies: {
        create: accessGroupDynamicPolicyCreate,
        save: accessGroupDynamicPolicySave,
        delete: accessGroupDynamicPolicyDelete
      }
    }
  });

  /**
   * add cluster rules and update
   * @param {string} vpcName
   * @param {string} aclName
   */
  store.addClusterRules = function(vpcName, aclName) {
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
  };

  store.getAllSubnets = function() {
    let subnetList = [];
    store.store.json.vpcs.forEach(vpc => {
      vpc.subnets.forEach(subnet => subnetList.push(subnet));
    });
    return subnetList;
  };

  /**
   * copy network acl from one vpc to another and update
   * @param {string} sourceVpc source vpc
   * @param {string} aclName name of acl to copy
   * @param {string} destinationVpc copy destination
   */
  store.copyNetworkAcl = function(sourceVpc, aclName, destinationVpc) {
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
  };

  /**
   * copy security group from one vpc to another and update
   * @param {string} sourceSecurityGroup name of acl to copy
   * @param {string} destinationVpc copy destination
   */
  store.copySecurityGroup = function(sourceSecurityGroup, destinationVpc) {
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
  };

  /**
   * copy acl rule to list and update
   * @param {string} sourceVpc
   * @param {string} aclName
   * @param {string} ruleName
   * @param {string} destinationAcl
   */
  store.copyRule = function(sourceVpc, aclName, ruleName, destinationAcl) {
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
  };

  /**
   * copy sg rule to list and update
   * @param {string} sgName
   * @param {string} ruleName
   * @param {string} destinationSg
   */
  store.copySgRule = function(sgName, ruleName, destinationSg) {
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
  };

  return store;
};

module.exports = state;
