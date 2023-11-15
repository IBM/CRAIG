const {
  revision,
  contains,
  splat,
  transpose,
  deleteUnfoundArrayItems,
  splatContains,
  isEmpty,
  isNullOrEmptyString,
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
} = require("./utils");
const { invalidName, invalidNameText, invalidTagList } = require("../forms");
const { invalidDescription } = require("../forms/invalid-callbacks");

/**
 * initialize cluster
 * @param {lazyZState} config state store
 */
function clusterInit(config) {
  config.store.json.clusters = [newDefaultWorkloadCluster()];
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
  if (stateData.kube_version)
    stateData.kube_version = stateData.kube_version.replace(/\s.+$/, "");
  config.push(["json", "clusters"], stateData);
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
        componentProps
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
        componentProps
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
    componentProps
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
      "clusters"
    ),
    schema: {
      kube_type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("kube_type"),
      },
      name: {
        default: "",
        invalid: invalidName("clusters"),
        invalidText: invalidNameText("clusters"),
      },
      cos: {
        default: "",
        invalid: function (stateData) {
          if (stateData.kube_type === "openshift") {
            return fieldIsNullOrEmptyString("cos")(stateData);
          } else {
            return false;
          }
        },
      },
      vpc: {
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
      },
      subnets: {
        default: [],
        invalid: function (stateData) {
          if (stateData.kube_type === "openshift") {
            return stateData.subnets.length * stateData.workers_per_subnet < 2;
          } else {
            return isEmpty(stateData.subnets);
          }
        },
      },
      workers_per_subnet: {
        default: "",
        invalid: isNullOrEmptyString("workers_per_subnet"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_group"),
      },
      flavor: {
        default: "",
        invalid: fieldIsNullOrEmptyString("flavor"),
      },
      encryption_key: {
        default: "",
        invalid: fieldIsNullOrEmptyString("encryption_key"),
      },
      kube_version: {
        default: "",
        invalid: fieldIsNullOrEmptyString("kube_version"),
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
          "worker_pools"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("worker_pools"),
            invalidText: invalidNameText("worker_pools"),
          },
          flavor: {
            default: "",
            invalid: fieldIsNullOrEmptyString("flavor"),
          },
          subnets: {
            default: [],
            invalid: function (stateData) {
              if (!stateData.subnets) {
                return true;
              } else return isEmpty(stateData.subnets);
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
          ],
          "clusters",
          "opaque_secrets"
        ),
        schema: {
          name: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("opaque_secrets")(
                stateData,
                componentProps,
                "name"
              );
            },
          },
          secrets_group: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("secrets_group")(
                stateData,
                componentProps,
                "secrets_group"
              );
            },
          },
          arbitrary_secret_name: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("arbitrary_secret_name")(
                stateData,
                componentProps,
                "arbitrary_secret_name"
              );
            },
          },
          username_password_secret_name: {
            default: "",
            invalid: function (stateData, componentProps) {
              return invalidName("username_password_secret_name")(
                stateData,
                componentProps,
                "username_password_secret_name"
              );
            },
          },
          labels: {
            default: [],
            invalid: function (stateData) {
              return !stateData.labels || invalidTagList(stateData.labels);
            },
          },
          secrets_manager: {
            default: "",
            invalid: fieldIsNullOrEmptyString("secrets_manager"),
          },
          arbitrary_secret_data: {
            default: "",
            invalid: fieldIsNullOrEmptyString("arbitrary_secret_data"),
          },
          username_password_secret_username: {
            default: "",
            invalid: fieldIsNullOrEmptyString(
              "username_password_secret_username"
            ),
          },
          username_password_secret_password: {
            default: "",
            invalid: fieldIsNullOrEmptyString(
              "username_password_secret_password"
            ),
          },
          expiration_date: {
            default: null,
            invalid: function (stateData) {
              return !stateData.expiration_date;
            },
          },
          username_password_secret_description: {
            default: "",
            invalid: function (stateData) {
              return invalidDescription(
                stateData.username_password_secret_description
              );
            },
          },
          arbitrary_secret_description: {
            default: "",
            invalid: function (stateData) {
              return invalidDescription(stateData.arbitrary_secret_description);
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
