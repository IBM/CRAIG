const {
  splat,
  contains,
  isEmpty,
  containsKeys,
  eachKey,
  getObjectFromArray,
} = require("lazy-z");
const { requiredOptionalFields, sshKeyValidationExp } = require("./constants");
const { eachRuleProtocol } = require("./state/utils");

const simpleErrors = {
  invalidAtrackerBucket:
    "Activity Tracker must have a valid bucket name. Got `null`",
  unfoundAtrackerKey:
    "The COS instance where the Activity Tracker bucket is created must have at least one key. Got 0",
  noCosInstances: "At least one Object Storage Instance is required. Got 0",
  noOpenShiftCosInstance: (clusterName) => {
    return `OpenShift clusters require a cos instance. Cluster \`${clusterName}\` cos is null.`;
  },
  noVpeSubnets: (serviceName, vpcName) => {
    return `Virtual Private Endpoints must have at least one VPC subnet. Service name \`${serviceName}\` VPC Name \`${vpcName}\` has 0.`;
  },
  noVpeSgs: (serviceName) => {
    return `Virtual Private Endpoints must have at least one Security Group. Service name \`${serviceName}\` has 0.`;
  },
  noDeploymentSshKeys: (deploymentName) => {
    return `${deploymentName} must have at least one SSH Key, got 0.`;
  },
  invalidScc: `If enable is true, location and is_public must have valid values.`,
  invalidObjectStorageBucketKey: (instance, bucket, kms, key) => {
    return `${bucket} must reference a key in the kms service ${kms} used by ${instance}. ${key} is invalid.`;
  },
  invalidClusterEncryptionKey: (clusterName, kms, key) => {
    return `${clusterName} must reference a key in the kms service ${kms}. ${key} is invalid.`;
  },
};

/**
 * validate a json configuration object
 * @param {Object} json landing zone configuration json
 */
const validate = function (json) {
  const optionalComponents = [
    "secrets_manager",
    "f5_vsi",
    "access_groups",
    "event_streams",
    "load_balancers",
    "appid",
    "cbr_rules",
    "cbr_zones",
    "vpn_servers",
    "dns",
    "routing_tables",
    "logdna",
    "sysdig",
  ];
  /**
   * validate something
   * @param {string} componentName name of component (ie Clusters)
   * @param {Object} component component
   * @param {string} addressName name of the address (ie resource group)
   * @param {string} componentAddress address of component (ie resource_group)
   * @param {Object=} testParams additional params
   * @param {string=} testParams.parentName name of the parent component if child
   * @param {*=} testParams.overrideValue override tested value to arbitrary one
   * @param {string=} testParams.overrideName override tested component name
   * @param {string=} testParams.overrideNameField override field if not name
   */
  function validationTest(
    componentName,
    component,
    addressName,
    componentAddress,
    testParams
  ) {
    let params = testParams || {}; // set test params
    // if override value is in the params object, not testing other ways results in an
    // automatic failure if field is `null`
    let testValue = component[componentAddress];
    // parent name if any
    let parentName = params?.parentName ? params.parentName + " " : "";
    // plural require
    let pluralRequire = contains(
      [
        "Transit Gateway",
        "App ID",
        "Secrets Manager",
        "Security Compliance Center",
      ],
      componentName
    )
      ? "requires"
      : "require";
    // set composed name
    let composedName =
      params?.overrideName ||
      `\`${
        component[params?.overrideNameField || "name"]
      }\` ${componentAddress}`;
    // if testValue is null
    if (testValue === null) {
      throw new Error(
        `${componentName} ${pluralRequire} a ${addressName}, ${parentName}${composedName} is null.`
      );
    } else if (testValue === undefined) {
      throw new Error(
        `${componentName} requires a ${addressName}, ${componentAddress} missing from JSON.`
      );
    }
  }

  /**
   * test a component for null resource_group value
   * @param {string} componentName name of the component
   * @param {Object} component component
   * @param {Object} testParams test params
   * @param {string} testParams.overrideValue override value
   * @param {string} testParams.overrideName override name
   */
  function nullResourceGroupTest(componentName, component, testParams) {
    let params = {};
    eachKey(testParams || {}, (key) => {
      params[key] = testParams[key];
    });
    validationTest(
      componentName,
      component,
      "resource group",
      "resource_group",
      params
    );
  }

  /**
   * test a component for null encryption key name value
   * @param {string} componentName name of the component
   * @param {Object} component component
   * @param {Object=} testParams additional params
   * @param {string=} testParams.parentName name of the parent component
   */
  function nullEncryptionKeyTest(
    componentName,
    component,
    testParams,
    overrideField
  ) {
    validationTest(
      componentName,
      component,
      "encryption key",
      overrideField,
      testParams
    );
  }

  /**
   * test a component for null vpc name value
   * @param {string} componentName name of the component
   * @param {Object} component component
   */
  function nullVpcNameTest(componentName, component) {
    validationTest(componentName, component, "VPC Name", "vpc");
  }

  /**
   * test a component for null vpc name value
   * @param {string} componentName name of the component
   * @param {Object} component component
   * @param {Object=} testParams additional params
   * @param {string=} testParams.parentName name of the parent component
   */
  function emptySubnetNamesTest(componentName, component, testParams) {
    let params = testParams || {};
    if (isEmpty(component.subnets)) {
      throw new Error(
        `${componentName} require at least one subnet to provision, ${
          params?.parentName ? params.parentName + " " : ""
        }\`${component.name}\` subnets is [].`
      );
    }
  }

  /**
   * update objects in place to have networking rule defaults to allow
   * for conversion to list
   * @param {Array<object>} rules list of rules
   * @param {boolean=} isAcl is network acl
   */
  function updateNetworkingRulesForCompatibility(rules, isAcl) {
    rules.forEach((rule) => {
      // for each rule type
      eachRuleProtocol((type) => {
        // if the rule type is not part of the rule object
        if (!containsKeys(rule, type)) {
          // set rule
          if (type === "icmp") {
            rule[type] = {
              type: null,
              code: null,
            };
          } else {
            rule[type] = {
              port_min: null,
              port_max: null,
            };
            if (isAcl) {
              rule[type].source_port_max = null;
              rule[type].source_port_min = null;
            }
          }
        } else {
          eachKey(rule[type], (key) => {
            if (rule[type][key] !== null)
              rule[type][key] = parseInt(rule[type][key]);
          });
        }
      });
    });
  }

  // unfound fields

  if (!json.scc) {
    json.scc = {
      collector_description: null,
      credential_description: null,
      passphrase: null,
      enable: false,
      is_public: false,
      location: [],
      scope_description: null,
      id: null,
    };
  } else {
    if (json.scc?.enable) {
      // force insert if fields missing
      [
        "credential_description",
        "scope_description",
        "passphrase",
        "collector_description",
        "id",
      ].forEach((field) => {
        if (!containsKeys(json.scc, field)) {
          json.scc[field] = null;
        }
      });
      if (json.scc.is_public === null || json.scc.location === null) {
        throw new Error(simpleErrors.invalidScc);
      }
    } else {
      json.scc.enable = false; // add field
    }
  }

  if (!json.iam_account_settings) {
    json.iam_account_settings = {
      enable: false,
      mfa: null,
      allowed_ip_addresses: null,
      include_history: null,
      if_match: null,
      max_sessions_per_identity: null,
      restrict_create_service_id: null,
      restrict_create_platform_apikey: null,
      session_expiration_in_seconds: null,
      session_invalidation_in_seconds: null,
    };
  }

  json.key_management.forEach((kms) => {
    kms.use_data = kms.use_hs_crypto ? true : kms.use_data;
  });

  json.resource_groups.forEach((group) => {
    if (group.use_prefix === null) group.use_prefix = false;
  });

  optionalComponents.forEach((name) => {
    if (!json[name]) json[name] = [];
  });

  /* specific validations for each field */

  // options
  validationTest("Options", json._options, "Prefix", "prefix");
  validationTest("Options", json._options, "Region", "region");

  // resource groups - none

  // access groups - none

  // IAM - none

  // key management
  json.key_management.forEach((kms) => {
    nullResourceGroupTest("Key Management", kms);
  });

  // object storage
  // atracker must have bucket name if enabled
  if (json.atracker.enabled && json.atracker.bucket === null) {
    throw new Error(simpleErrors.invalidAtrackerBucket);
  } else {
    // for each cos instance
    json.object_storage.forEach((instance) => {
      if (
        // if the bucket name is found in the instance with atracker enabled
        json.atracker.enabled &&
        contains(splat(instance.buckets, "name"), json.atracker.bucket) &&
        // and instance has no keys
        instance.keys.length === 0
      ) {
        throw new Error(simpleErrors.unfoundAtrackerKey);
      }
      nullResourceGroupTest("Object Storage", instance);
      validationTest("Object Storage", instance, "kms", "kms"); // check if key management service provided
      instance.buckets.forEach((bucket) => {
        validationTest("Object Storage Buckets", bucket, "kms_key", "kms_key");
        if (
          !contains(
            splat(
              getObjectFromArray(json.key_management, "name", instance.kms)
                .keys,
              "name"
            ),
            bucket.kms_key
          )
        ) {
          throw new Error(
            simpleErrors.invalidObjectStorageBucketKey(
              instance.name,
              bucket.name,
              instance.kms,
              bucket.kms_key
            )
          );
        }
      });
    });
  }
  // must have cos
  if (json.object_storage.length === 0) {
    throw new Error(simpleErrors.noCosInstances);
  }

  // secrets manager
  json.secrets_manager.forEach((instance) => {
    nullResourceGroupTest("Secrets Manager", instance, {
      overrideName: "Secrets Manager Resource Group",
    });
    nullEncryptionKeyTest("Secrets Manager", instance, {}, "encryption_key");
    validationTest("Secrets Manager", instance, "Key Management", "kms"); // check for null kms
  });

  // event streams
  json.event_streams.forEach((instance) => {
    nullResourceGroupTest("Event Streams", instance);
  });

  // app id
  json.appid.forEach((appid) => {
    nullResourceGroupTest("App ID", appid, {
      overrideName: "App ID resource_group",
    });
  });

  // atracker
  if (json.atracker.enabled) {
    nullEncryptionKeyTest("Atracker", json.atracker, {}, "cos_key");
    validationTest("Atracker", json.atracker, "bucket", "bucket");
  }

  // vpcs
  json.vpcs.forEach((network) => {
    validationTest("VPCs", network, "Flow Logs Bucket", "bucket", {
      overrideNameField: "name",
    });
    validationTest("VPCs", network, "COS", "cos");
    nullResourceGroupTest("VPCs", network);

    // for each address prefix
    network.address_prefixes.forEach((prefix) => {
      nullVpcNameTest("Address Prefix", prefix, "name", "name");
      validationTest("Address Prefix", prefix, "zone", "zone"); // mark zone required
    });
    // for each acl
    network.acls.forEach((acl) => {
      updateNetworkingRulesForCompatibility(acl.rules, true);
      acl.rules.forEach((rule) => {
        validationTest("Network ACL Rule", rule, "acl", "acl");
        nullVpcNameTest("Network ACL Rule", rule);
      });
    });
    // for each subnet
    network.subnets.forEach((subnet) => {
      nullResourceGroupTest("Subnets", subnet);
      validationTest("Subnets", subnet, "vpc", "vpc");
      validationTest("Subnets", subnet, "network_acl", "network_acl");
      validationTest("Subnets", subnet, "zone", "zone"); // mark zone required
    });
  });

  // transit gateways
  json.transit_gateways.forEach((instance) => {
    nullResourceGroupTest("Transit Gateways", instance);
  });

  // security groups
  json.security_groups.forEach((group) => {
    nullVpcNameTest("Security Groups", group);
    nullResourceGroupTest("Security Groups", group);
    updateNetworkingRulesForCompatibility(group.rules);
    group.rules.forEach((rule) => {
      validationTest("Security Group Rule", rule, "security group", "sg");
      nullVpcNameTest("Security Group Rule", rule);
    });
  });

  // vpes
  json.virtual_private_endpoints.forEach((instance) => {
    nullVpcNameTest("virtual_private_endpoints", instance);
    if (isEmpty(instance.subnets)) {
      throw new Error(simpleErrors.noVpeSubnets(instance.name, instance.vpc));
    } else if (isEmpty(instance.security_groups)) {
      throw new Error(simpleErrors.noVpeSgs(instance.name));
    }
  });

  // vpn gateways
  json.vpn_gateways.forEach((gateway) => {
    nullVpcNameTest("VPN Gateways", gateway);
    nullResourceGroupTest("VPN Gateways", gateway);
    validationTest("VPN Gateways", gateway, "subnet name", "subnet");
  });

  // cluster configuration
  json.clusters.forEach((cluster) => {
    // if cluster is openshift and no cos name, throw error
    if (cluster.kube_type === "openshift" && cluster.cos === null) {
      throw new Error(simpleErrors.noOpenShiftCosInstance(cluster.name));
    }

    // cluster tests
    emptySubnetNamesTest("Clusters", cluster);
    nullVpcNameTest("Clusters", cluster);
    validationTest("Clusters", cluster, "Key Management", "kms"); // check for null kms
    validationTest("Clusters", cluster, "Encryption Key", "encryption_key"); // check for null kms
    if (
      !contains(
        splat(
          getObjectFromArray(json.key_management, "name", cluster.kms).keys,
          "name"
        ),
        cluster.encryption_key
      )
    ) {
      throw new Error(
        simpleErrors.invalidClusterEncryptionKey(
          cluster.name,
          cluster.kms,
          cluster.encryption_key
        )
      );
    }

    // test for empty pool subnets
    cluster.worker_pools.forEach((pool) => {
      emptySubnetNamesTest("Worker Pools", pool, {
        parentName: "`workload-cluster` worker_pool",
      });
      validationTest("Worker Pools", pool, "cluster", "cluster", {
        parentName: cluster.name,
      });
      nullResourceGroupTest("Worker Pools", pool);
      nullVpcNameTest("Worker Pools", pool);
    });
  });

  // ssh keys
  json.ssh_keys.forEach((key) => {
    nullResourceGroupTest("SSH Keys", key);
    if (
      !key.use_data &&
      key.public_key !== null &&
      key.public_key.match(sshKeyValidationExp) === null
    )
      throw new Error(`Key ${key.name} has invalid public key.`);
  });

  // vsi
  json.vsi.forEach((deployment) => {
    instanceTests(deployment);
    emptySubnetNamesTest("VSIs", deployment);
  });

  /**
   * base tests for vsi, teleport vsi, and f5 vsi
   * @param {Object} deployment vpc deployment
   * @param {string=} type type of deployment if teleport or f5
   */
  function instanceTests(deployment, type) {
    let deploymentName = `${type ? type + " " : ""}VSIs`; // composed name
    // subnets to check
    let subnetField = contains(["Teleport", "F5"], type) ? "subnet" : false;

    // vsi test
    nullVpcNameTest(deploymentName, deployment);
    nullResourceGroupTest(deploymentName, deployment);
    nullEncryptionKeyTest(deploymentName, deployment, {}, "encryption_key");

    // if no ssh keys
    if (isEmpty(deployment.ssh_keys)) {
      throw new Error(simpleErrors.noDeploymentSshKeys(deploymentName));
    }

    // check security groups in security_groups are in vpc && update rules
    deployment.security_groups.forEach((sg) => {
      let sgObject = getObjectFromArray(json.security_groups, "name", sg);
      if (sgObject.vpc !== deployment.vpc) {
        throw new Error(
          `Security Group ${sg} not in the same vpc as ${deployment.name}'s VPC, ${deployment.vpc}`
        );
      }
      updateNetworkingRulesForCompatibility(sgObject?.rules);
    });
  }
  // f5 vsi
  json.f5_vsi.forEach((deployment) => {
    instanceTests(deployment, "F5");
  });

  // load_balancers - none

  /**
   * add unfound fields to objects to allow terraform to parse successfully
   * @param {Object} instance instance object
   * @param {Object} componentFields component fields object
   */
  function addUnfoundListFields(instance, componentFields) {
    eachKey(componentFields, (action) => {
      if (action !== "setToValue") {
        // value to set if not direct value
        let setValue =
          action === "setToNull"
            ? null
            : action === "setToEmptyList"
            ? []
            : false;
        // for each field to set
        componentFields[action].forEach((field) => {
          if (!containsKeys(instance, field)) {
            instance[field] = setValue;
          }
        });
      } else {
        // for each key that is not set
        eachKey(componentFields[action], (valueToSet) => {
          // if the instance does not contain the value
          if (!containsKeys(instance, valueToSet)) {
            // set value to value to set
            instance[valueToSet] = componentFields[action][valueToSet];
          }
        });
      }
    });
  }

  // for each shallow component
  eachKey(requiredOptionalFields.shallowComponents, (component) => {
    // for each instance of that component
    json[component].forEach((instance) => {
      // add unfound list fields
      addUnfoundListFields(
        instance,
        requiredOptionalFields.shallowComponents[component]
      );
      // if the component has nested components
      if (containsKeys(requiredOptionalFields.nestedComponents, component)) {
        // for each nested field
        eachKey(
          requiredOptionalFields.nestedComponents[component],
          (subField) => {
            // for each object in nested instance
            instance[subField].forEach((nestedInstance) => {
              // add unfound list fields
              addUnfoundListFields(
                nestedInstance,
                requiredOptionalFields.nestedComponents[component][subField]
              );
            });
          }
        );
      }
    });
  });

  return json;
};

module.exports = validate;
