const {
  revision,
  contains,
  splat,
  transpose,
  deleteUnfoundArrayItems,
  splatContains,
  isNullOrEmptyString,
  buildNumberDropdownList,
} = require("lazy-z");
const { newDefaultWorkloadCluster } = require("./defaults");
const {
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey,
  pushToChildFieldModal,
  updateSubChild,
  deleteSubChild,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  resourceGroupsField,
  unconditionalInvalidText,
  selectInvalidText,
  vpcGroups,
  subnetMultiSelect,
  wholeNumberField,
  encryptionKeyGroups,
  onArrayInputChange,
  fieldIsNotWholeNumber,
  invalidTagList,
} = require("./utils");
const { invalidDescription } = require("../forms/invalid-callbacks");
const {
  nameField,
  invalidName,
  invalidNameText,
} = require("./reusable-fields");

/**
 * initialize cluster
 * @param {lazyZState} config state store
 */
function clusterInit(config) {
  config.store.json.clusters = [newDefaultWorkloadCluster()];
  config.store.json.security_groups.push({
    cluster_security_group: true,
    name: "workload-cluster-security-group",
    vpc: "workload",
    resource_group: "workload-rg",
    rules: [],
  });
}

/**
 * on update function for cluster
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.object_storage object storage instances
 * @param {Array<object>} config.store.json.clusters clusters
 * @param {string} config.store.json.clusters.cos name of instance for openshift clusters
 * @param {string} config.store.json.clusters.kms_key name of the encryption key
 * @param {string} config.store.json.clusters.vpc name of vpc
 * @param {Array<string>} config.store.json.clusters.subnets name of subnets for cluster
 * @param {Array<object>} config.store.json.clusters.worker_pools worker pools
 * @param {string} config.store.json.clusters.worker_pools.vpc vpc name for worker pools
 * @param {Array<string>} config.store.json.clusters.worker_pools.subnets name of subnets
 * @param {Array<string>} config.store.vpcList list of VPC names
 * @param {Array<object>} config.store.json.clusters.opaque_secrets opaque secrets
 */
function clusterOnStoreUpdate(config) {
  config.store.json.clusters.forEach((cluster) => {
    let allCosInstances = splat(config.store.json.object_storage, "name");
    if (cluster.cos && !contains(allCosInstances, cluster.cos)) {
      cluster.cos = null;
    }
    setUnfoundEncryptionKey(config, cluster, "encryption_key");
    setUnfoundResourceGroup(config, cluster);
    cluster.kms = null;
    config.store.json.key_management.forEach((instance) => {
      if (splatContains(instance.keys, "name", cluster.encryption_key)) {
        cluster.kms = instance.name;
      }
    });
    if (!cluster.kms) {
      cluster.kms = null;
      cluster.encryption_key = null;
    }
    if (cluster.opaque_secrets) {
      cluster.opaque_secrets.forEach((secret) => {
        secret.cluster = cluster.name;
      });
    } else cluster.opaque_secrets = [];
    if (!cluster.worker_pools) {
      cluster.worker_pools = [];
    }

    if (config.store.json?.logdna?.enabled !== true) {
      cluster.logging = false;
    }

    if (config.store.json?.sysdig?.enabled !== true) {
      cluster.monitoring = false;
    }

    // update vpc
    if (hasUnfoundVpc(config, cluster)) {
      cluster.vpc = null;
      cluster.subnets = [];
      cluster.worker_pools.forEach((pool) => {
        pool.vpc = null;
        pool.subnets = [];
      });
    } else {
      // otherwise check for valid subnets
      let vpcSubnets = config.store.subnets[cluster.vpc];
      // delete cluster subnets
      cluster.subnets = deleteUnfoundArrayItems(vpcSubnets, cluster.subnets);
      // delete worker pool subnets
      cluster.worker_pools.forEach((pool) => {
        pool.cluster = cluster.name;
        pool.subnets = deleteUnfoundArrayItems(vpcSubnets, pool.subnets);
        pool.vpc = cluster.vpc;
        setUnfoundResourceGroup(config, pool);
      });
    }
  });
}

/**
 * create new cluster
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} stateData.cluster cluster object
 */
function clusterCreate(config, stateData) {
  let newClusterSecurityGroup = {
    cluster_security_group: true,
    name: `${stateData.name}-security-group`,
    vpc: stateData.vpc,
    resource_group: stateData.resource_group,
    rules: [],
  };
  if (stateData.kube_version)
    stateData.kube_version = stateData.kube_version.replace(/\s.+$/, "");
  config.push(["json", "clusters"], stateData);
  config.push(["json", "security_groups"], newClusterSecurityGroup);
}

/**
 * update cluster
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} stateData.cluster cluster object
 * @param {string} stateData.cluster.vpc_name name of vpc for cluster
 * @param {Array<object>} stateData.cluster.worker_pools worker pools
 * @param {string} stateData.cluster.worker_pools.vpc_name vpc name for worker pools
 * @param {Array<string>} stateData.cluster.worker_pools.subnet_names name of subnets
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data original data before update
 */
function clusterSave(config, stateData, componentProps) {
  // if changing vpc name, set cluster pools to new vpc name and
  // remove pool subnet names
  if (stateData.kube_version)
    stateData.kube_version = stateData.kube_version.replace(/\s.+$/, "");
  if (stateData.vpc !== componentProps.data.vpc) {
    stateData.worker_pools.forEach((pool) => {
      pool.vpc = stateData.vpc;
      pool.subnets = [];
    });
    new revision(config.store.json)
      .child("security_groups", componentProps.data.name + "-security-group")
      .then((sg) => {
        sg.vpc = stateData.vpc;
      });
  }
  console.log(stateData.name, componentProps.data.name);
  if (stateData.name && stateData.name !== componentProps.data.name) {
    new revision(config.store.json)
      .child("security_groups", componentProps.data.name + "-security-group")
      .then((sg) => {
        sg.name = stateData.name + "-security-group";
      });
  }
  config.updateChild(["json", "clusters"], componentProps.data.name, stateData);
}

/**
 * delete cluster
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterDelete(config, stateData, componentProps) {
  config.carve(["json", "clusters"], componentProps.data.name);
}

/**
 * create cluster worker pool
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterWorkerPoolCreate(config, stateData, componentProps) {
  let newPool = { subnets: [] };
  new revision(config.store.json)
    .child("clusters", componentProps.innerFormProps.arrayParentName, "name") // get config cluster
    .then((data) => {
      // set vpc name and flavor from parent cluster
      newPool.vpc = data.vpc;
      newPool.flavor = data.flavor;
      newPool.resource_group = data.resource_group;
      transpose(stateData, newPool);
      pushToChildFieldModal(
        config,
        "clusters",
        "worker_pools",
        newPool,
        componentProps,
      );
    });
}

/**
 * save cluster worker pool
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterWorkerPoolSave(config, stateData, componentProps) {
  updateSubChild(config, "clusters", "worker_pools", stateData, componentProps);
}

/**
 * delete cluster worker pool
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterWorkerPoolDelete(config, stateData, componentProps) {
  deleteSubChild(config, "clusters", "worker_pools", componentProps);
}

/**
 * create cluster opaque secret
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterOpaqueSecretCreate(config, stateData, componentProps) {
  let newSecret = {};
  new revision(config.store.json)
    .child("clusters", componentProps.innerFormProps.arrayParentName, "name") // get config cluster
    .then((data) => {
      newSecret.cluster = data.name;
      transpose(stateData, newSecret);
      pushToChildFieldModal(
        config,
        "clusters",
        "opaque_secrets",
        newSecret,
        componentProps,
      );
    });
}

/**
 * save cluster opaque secret
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterOpaqueSecretSave(config, stateData, componentProps) {
  updateSubChild(
    config,
    "clusters",
    "opaque_secrets",
    stateData,
    componentProps,
  );
}

/**
 * delete cluster opaque secret
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterOpaqueSecretDelete(config, stateData, componentProps) {
  deleteSubChild(config, "clusters", "opaque_secrets", componentProps);
}

/**
 * check if subnets invalid
 * @param {*} stateData
 * @returns {boolean} true if invalid
 */

function openshiftWorkersInvalid(stateData) {
  if (stateData.kube_type === "openshift")
    return stateData.subnets.length * stateData.workers_per_subnet < 2;
  else return false;
}

function flavor() {
  return {
    size: "small",
    labelText: "Instance Profile",
    type: "fetchSelect",
    groups: [],
    default: "",
    invalid: fieldIsNullOrEmptyString("flavor"),
    invalidText: selectInvalidText("flavor"),
    apiEndpoint: function (stateData, componentProps) {
      return `/api/cluster/${componentProps.craig.store.json._options.region}/flavors`;
    },
  };
}

/**
 * initialize cluster store
 * @param {*} store
 */
function initClusterStore(store) {
  store.newField("clusters", {
    init: clusterInit,
    onStoreUpdate: clusterOnStoreUpdate,
    create: clusterCreate,
    save: clusterSave,
    delete: clusterDelete,
    shouldDisableSave: shouldDisableComponentSave(
      [
        "kube_type",
        "name",
        "cos",
        "vpc",
        "subnets",
        "encryption_key",
        "resource_group",
        "flavor",
        "kube_version",
        "workers_per_subnet",
      ],
      "clusters",
    ),
    schema: {
      kube_type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("kube_type"),
      },
      name: nameField("clusters", {
        size: "small",
        /**
         * get helper text for cluster
         * @param {Object} stateData
         * @param {Object} componentProps
         * @returns {string} composed acl name
         */
        helperText: function clusterHelperTestCallback(
          stateData,
          componentProps,
        ) {
          return (
            componentProps.craig.store.json._options.prefix +
            "-" +
            stateData.name +
            "-cluster"
          );
        },
      }),
      resource_group: resourceGroupsField(true),
      kube_type: {
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("kube_type"),
        type: "select",
        groups: ["OpenShift", "IBM Kubernetes Service"],
        onRender: function (stateData) {
          return isNullOrEmptyString(stateData.kube_type, true)
            ? ""
            : stateData.kube_type === "openshift"
              ? "OpenShift"
              : "IBM Kubernetes Service";
        },
        onInputChange: function (stateData) {
          stateData.kube_version = "";
          return stateData.kube_type === "OpenShift" ? "openshift" : "iks";
        },
      },
      cos: {
        labelText: "Cloud Object Storage Instance",
        type: "select",
        size: "small",
        default: "",
        invalid: function (stateData) {
          if (stateData.kube_type === "openshift") {
            return fieldIsNullOrEmptyString("cos")(stateData);
          } else {
            return false;
          }
        },
        invalidText: unconditionalInvalidText(
          "Select an Object Storage instanace",
        ),
        groups: function (stateData, componentProps) {
          return splat(componentProps.craig.store.json.object_storage, "name");
        },
        hideWhen: function (stateData) {
          return stateData.kube_type !== "openshift";
        },
      },
      entitlement: {
        size: "small",
        type: "select",
        default: "null",
        groups: ["null", "cloud_pak"],
        hideWhen: function (stateData) {
          return stateData.kube_type !== "openshift";
        },
      },
      vpc: {
        type: "select",
        labelText: "VPC",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
        invalidText: selectInvalidText("VPC"),
        groups: vpcGroups,
      },
      subnets: subnetMultiSelect({
        invalid: openshiftWorkersInvalid,
      }),
      workers_per_subnet: {
        size: "small",
        type: "select",
        default: "1",
        invalid: function (stateData) {
          return stateData.kube_type === "openshift" &&
            stateData.subnets.length * Number(stateData.workers_per_subnet) < 2
            ? true
            : wholeNumberField("workers_per_subnet")(stateData);
        },
        groups: buildNumberDropdownList(10, 1),
        invalidText: unconditionalInvalidText(
          "OpenShift clusters require at least 2 workers across any number of subnets",
        ),
      },
      flavor: flavor(),
      update_all_workers: {
        type: "toggle",
        size: "small",
        default: false,
        labelText: "Update All Workers",
      },
      encryption_key: {
        type: "select",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("encryption_key"),
        invalidText: unconditionalInvalidText("Select an encryption keys"),
        groups: encryptionKeyGroups,
      },
      kube_version: {
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("kube_version"),
        invalidText: selectInvalidText("Kubernetes Version"),
        type: "fetchSelect",
        groups: [],
        apiEndpoint: unconditionalInvalidText("/api/cluster/versions"),
      },
      private_endpoint: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "Private Endpoint",
        tooltip: {
          content: "Use private service endpoint for Encryption Key",
        },
      },
      logging: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "Enable Logging Agents",
        tooltip: {
          content:
            "To enable logging agents, a LogDNA instance must be created",
        },
        disabled: function (stateData, componentProps) {
          return componentProps.craig.store.json?.logdna?.enabled !== true;
        },
      },
      monitoring: {
        size: "small",
        default: false,
        type: "toggle",
        labelText: "Enable Monitoring Agents",
        tooltip: {
          content:
            "To enable monitoring agents, a Sysdig instance must be created",
        },
        disabled: function (stateData, componentProps) {
          return componentProps.craig.store.json?.sysdig?.enabled !== true;
        },
      },
    },
    subComponents: {
      worker_pools: {
        create: clusterWorkerPoolCreate,
        save: clusterWorkerPoolSave,
        delete: clusterWorkerPoolDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "flavor", "subnets"],
          "clusters",
          "worker_pools",
        ),
        schema: {
          name: nameField("worker_pools", { size: "small" }),
          flavor: flavor(),
          subnets: subnetMultiSelect({
            invalid: openshiftWorkersInvalid,
          }),
          workers_per_subnet: {
            size: "small",
            type: "select",
            default: "1",
            groups: buildNumberDropdownList(10, 1),
          },
          entitlement: {
            size: "small",
            type: "select",
            default: "null",
            groups: ["null", "cloud_pak"],
            hideWhen: function (stateData, componentProps) {
              return componentProps.parent.kube_type !== "openshift";
            },
          },
        },
      },
      opaque_secrets: {
        create: clusterOpaqueSecretCreate,
        save: clusterOpaqueSecretSave,
        delete: clusterOpaqueSecretDelete,
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "secrets_group",
            "arbitrary_secret_name",
            "username_password_secret_name",
            "secrets_manager",
            "labels",
            "arbitrary_secret_data",
            "username_password_secret_username",
            "username_password_secret_password",
            "expiration_date",
            "username_password_secret_description",
            "arbitrary_secret_description",
            "interval",
          ],
          "clusters",
          "opaque_secrets",
        ),
        schema: {
          name: {
            size: "small",
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("opaque_secrets")(
                stateData,
                componentProps,
                "name",
              );
            },
            invalidText: invalidNameText("opaque_secrets"),
          },
          namespace: {
            size: "small",
            default: "",
            invalid: fieldIsNullOrEmptyString("namespace"),
            invalidText: unconditionalInvalidText("Enter a namespace"),
          },
          persistence: {
            size: "small",
            default: false,
            type: "toggle",
            labelText: "Persistence",
            tooltip: {
              content:
                "The persistence field ensures that if a user inadvertently deletes the secret from the cluster, it will be recreated.",
              alignModal: "bottom",
              align: "bottom",
            },
          },
          secrets_group: {
            size: "small",
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("secrets_group")(
                stateData,
                componentProps,
                "secrets_group",
              );
            },
            invalidText: invalidNameText("secrets_group"),
          },
          arbitrary_secret_name: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("arbitrary_secret_name")(
                stateData,
                componentProps,
                "arbitrary_secret_name",
              );
            },
            invalidText: invalidNameText("arbitrary_secret_name"),
          },
          username_password_secret_name: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("username_password_secret_name")(
                stateData,
                componentProps,
                "username_password_secret_name",
              );
            },
            invalidText: invalidNameText("username_password_secret_name"),
          },
          labels: {
            type: "textArea",
            default: [],
            invalid: function (stateData) {
              return !stateData.labels || invalidTagList(stateData.labels);
            },
            invalidText: unconditionalInvalidText(
              "Enter a valid list of labels",
            ),
            placeholder: "hello,world",
            labelText: "Labels",
            onInputChange: onArrayInputChange("labels"),
          },
          secrets_manager: {
            size: "small",
            type: "select",
            default: "",
            invalid: fieldIsNullOrEmptyString("secrets_manager"),
            invalidText: selectInvalidText("Secrets Manager instance"),
            groups: function (stateData, componentProps) {
              return splat(
                componentProps.craig.store.json.secrets_manager,
                "name",
              );
            },
          },
          arbitrary_secret_data: {
            default: "",
            invalid: fieldIsNullOrEmptyString("arbitrary_secret_data"),
            invalidText: unconditionalInvalidText("Enter secret data"),
          },
          username_password_secret_username: {
            default: "",
            invalid: fieldIsNullOrEmptyString(
              "username_password_secret_username",
            ),
            invalidText: unconditionalInvalidText("Enter a username"),
          },
          username_password_secret_password: {
            default: "",
            invalid: fieldIsNullOrEmptyString(
              "username_password_secret_password",
            ),
            invalidText: unconditionalInvalidText("Enter a password"),
          },
          expiration_date: {
            type: "date",
            default: null,
            invalid: function (stateData) {
              return isNullOrEmptyString(stateData.expiration_date, true);
            },
            invalidText: unconditionalInvalidText("Select a date"),
          },
          username_password_secret_description: {
            default: "",
            invalid: function (stateData) {
              return invalidDescription(
                stateData.username_password_secret_description,
              );
            },
            invalidText: unconditionalInvalidText("Enter a valid description"),
          },
          arbitrary_secret_description: {
            default: "",
            invalid: function (stateData) {
              return invalidDescription(stateData.arbitrary_secret_description);
            },
            invalidText: unconditionalInvalidText("Enter a valid description"),
          },
          auto_rotate: {
            type: "toggle",
            default: false,
            labelText: "Auto Rotate",
          },
          interval: {
            default: "1",
            invalid: function (stateData) {
              return stateData.auto_rotate === false
                ? false
                : fieldIsNotWholeNumber("interval", 1, 1000)(stateData);
            },
            invalidText: unconditionalInvalidText(
              "Enter a whole number between 1 and 1000",
            ),
            hideWhen: function (stateData) {
              return stateData.auto_rotate === false;
            },
          },
          unit: {
            type: "select",
            default: "day",
            groups: ["day", "month"],
            hideWhen: function (stateData) {
              return stateData.auto_rotate === false;
            },
          },
        },
      },
    },
  });
}

module.exports = {
  clusterInit,
  clusterOnStoreUpdate,
  clusterCreate,
  clusterSave,
  clusterDelete,
  clusterWorkerPoolCreate,
  clusterWorkerPoolSave,
  clusterWorkerPoolDelete,
  clusterOpaqueSecretCreate,
  clusterOpaqueSecretSave,
  clusterOpaqueSecretDelete,
  initClusterStore,
};
