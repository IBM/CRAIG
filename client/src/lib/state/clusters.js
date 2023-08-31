const {
  revision,
  contains,
  splat,
  transpose,
  deleteUnfoundArrayItems,
  splatContains,
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
    stateData.kube_version = stateData.kube_version.replace(
      /\s.+$/,
      ""
    );
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
};
