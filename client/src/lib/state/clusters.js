const { revision, contains, splat, transpose } = require("lazy-z");
const { newDefaultWorkloadCluster } = require("./defaults");
const {
  pushAndUpdate,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey,
  updateChild,
  carveChild,
  pushToChildField,
  updateSubChild,
  deleteSubChild,
  hasUnfoundVpc
} = require("./store.utils");
const { deleteUnfoundArrayItems } = require("./utils");

/**
 * initialize cluster
 * @param {lazyZState} config state store
 */
function clusterInit(config) {
  config.store.json.clusters = [];
}

/**
 * on update function for cluster
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<object>} config.store.json.cos object storage instances
 * @param {Array<object>} config.store.json.clusters clusters
 * @param {string} config.store.json.clusters.cos name of instance for openshift clusters
 * @param {string} config.store.json.clusters.kms_key name of the encryption key
 * @param {string} config.store.json.clusters.vpc name of vpc
 * @param {Array<string>} config.store.json.clusters.subnets name of subnets for cluster
 * @param {Array<object>} config.store.json.clusters.worker_pools worker pools
 * @param {string} config.store.json.clusters.worker_pools.vpc vpc name for worker pools
 * @param {Array<string>} config.store.json.clusters.worker_pools.subnets name of subnets
 * @param {Array<string>} config.store.vpcList list of VPC names
 */
function clusterOnStoreUpdate(config) {
  config.store.json.clusters.forEach(cluster => {
    let allCosInstances = splat(config.store.json.cos, "name");
    if (cluster.cos && !contains(allCosInstances, cluster.cos)) {
      cluster.cos = null;
    }
    setUnfoundEncryptionKey(config, cluster, "encryption_key");
    setUnfoundResourceGroup(config, cluster);
    // update vpc
    if (hasUnfoundVpc(config, cluster)) {
      cluster.vpc = null;
      cluster.subnets = [];
      cluster.worker_pools.forEach(pool => {
        pool.vpc = null;
        pool.subnets = [];
      });
    } else {
      // otherwise check for valid subnets
      let vpcSubnets = config.store.subnets[cluster.vpc];
      // delete cluster subnets
      cluster.subnets = deleteUnfoundArrayItems(vpcSubnets, cluster.subnets);
      // delete worker pool subnets
      cluster.worker_pools.forEach(pool => {
        pool.subnets = deleteUnfoundArrayItems(vpcSubnets, pool.subnets);
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
  pushAndUpdate(config, "clusters", stateData.cluster);
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
  if (stateData.cluster.vpc !== componentProps.data.vpc) {
    stateData.cluster.worker_pools.forEach(pool => {
      pool.vpc = stateData.cluster.vpc;
      pool.subnets = [];
    });
  }
  updateChild(config, "clusters", stateData.cluster, componentProps);
}

/**
 * delete cluster
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function clusterDelete(config, stateData, componentProps) {
  carveChild(config, "clusters", componentProps);
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
    .child("clusters", componentProps.arrayParentName) // get config cluster
    .then(data => {
      // set vpc name and flavor from parent cluster
      newPool.vpc = data.vpc;
      newPool.flavor = data.flavor;
      transpose(stateData.pool, newPool);
      pushToChildField(
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
  updateSubChild(
    config,
    "clusters",
    "worker_pools",
    stateData.pool,
    componentProps
  );
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

module.exports = {
  clusterInit,
  clusterOnStoreUpdate,
  clusterCreate,
  clusterSave,
  clusterDelete,
  clusterWorkerPoolCreate,
  clusterWorkerPoolSave,
  clusterWorkerPoolDelete
};
