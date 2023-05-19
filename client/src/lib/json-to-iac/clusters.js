const { getObjectFromArray, snakeCase } = require("lazy-z");
const {
  rgIdRef,
  getKmsInstanceData,
  subnetZone,
  composedZone,
  kebabName,
  vpcRef,
  resourceRef,
  encryptionKeyRef,
  tfRef,
  tfDone,
  tfBlock,
  jsonToTfPrint,
  timeouts,
  cdktfRef,
} = require("./utils");

/**
 * create tf for cluster
 * @param {Object} cluster
 * @param {string} cluster.kms
 * @param {string} cluster.cos
 * @param {string} cluster.entitlement
 * @param {string} cluster.type
 * @param {string} cluster.kube_version
 * @param {string} cluster.flavor
 * @param {string} cluster.name
 * @param {string} cluster.resource_group
 * @param {string} cluster.encryption_key
 * @param {Array<string>} cluster.subnets
 * @param {boolean} cluster.update_all_workers
 * @param {string} cluster.vpc
 * @param {number} cluster.workers_per_subnet
 * @param {boolean} cluster.private_endpoint
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {Object} cluster terraform code
 */
function ibmContainerVpcCluster(cluster, config) {
  let data = {
    name: `${cluster.vpc} vpc ${cluster.name} cluster`,
  };
  let clusterData = {
    name: kebabName([cluster.name, "cluster"]),
    vpc_id: vpcRef(cluster.vpc, "id", true),
    resource_group_id: rgIdRef(cluster.resource_group, config),
    flavor: cluster.flavor,
    worker_count: cluster.workers_per_subnet,
    kube_version: cluster.kube_version,
    update_all_workers: cluster.update_all_workers || null,
    tags: config._options.tags,
    wait_till: cluster.wait_till || "IngressReady",
    disable_public_service_endpoint: cluster.private_endpoint || false,
    zones: [],
    timeouts: timeouts("3h", "3h", "2h"),
    kms_config: [
      {
        crk_id: encryptionKeyRef(cluster.kms, cluster.encryption_key),
        instance_id: cdktfRef(getKmsInstanceData(cluster.kms, config).guid),
        private_endpoint: cluster.private_endpoint || false,
      },
    ],
  };
  // add subnets
  cluster.subnets.forEach((subnet) => {
    clusterData.zones.push({
      name: composedZone(subnetZone(subnet), true),
      subnet_id: `\${module.${snakeCase(cluster.vpc)}_vpc.${snakeCase(
        subnet
      )}_id}`,
    });
  });

  // add entitlement and cos crn if openshift
  if (cluster.type === "openshift") {
    clusterData.entitlement = cluster.entitlement;
    clusterData.cos_instance_crn = resourceRef(
      cluster.cos + " object storage",
      "crn"
    );
  }

  data.data = clusterData;
  return data;
}

/**
 * format worker pool
 * @param {Object} pool
 * @param {string} pool.entitlement
 * @param {string} pool.cluster
 * @param {string} pool.flavor
 * @param {string} pool.name
 * @param {string} pool.resource_group
 * @param {Array<string>} pool.subnets
 * @param {bool} pool.update_all_workers
 * @param {string} pool.vpc
 * @param {number} pool.workers_per_subnet
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @returns {string} terraform worker pool string
 */
function ibmContainerVpcWorkerPool(pool, config) {
  let poolCluster = getObjectFromArray(config.clusters, "name", pool.cluster);
  let data = {
    name: `${pool.vpc} vpc ${pool.cluster} cluster ${pool.name} pool`,
  };
  let poolData = {
    worker_pool_name: kebabName([pool.cluster, "cluster", pool.name]),
    vpc_id: vpcRef(pool.vpc, "id", true),
    resource_group_id: rgIdRef(pool.resource_group, config),
    cluster: tfRef(
      "ibm_container_vpc_cluster",
      `${pool.vpc} vpc ${pool.cluster} cluster`
    ),
    flavor: pool.flavor,
    worker_count: pool.workers_per_subnet,
    zones: [],
  };
  if (poolCluster.type === "openshift") {
    poolData.entitlement = poolCluster.entitlement;
  }

  // add subnets
  pool.subnets.forEach((subnet) => {
    poolData.zones.push({
      name: composedZone(subnetZone(subnet), true),
      subnet_id: `\${module.${snakeCase(poolCluster.vpc)}_vpc.${snakeCase(
        subnet
      )}_id}`,
    });
  });
  data.data = poolData;
  return data;
}

/**
 * create tf for cluster
 * @param {Object} cluster
 * @param {Object} config
 * @returns {string} cluster terraform code
 */
function formatCluster(cluster, config) {
  let data = ibmContainerVpcCluster(cluster, config);
  return jsonToTfPrint(
    "resource",
    "ibm_container_vpc_cluster",
    data.name,
    data.data
  );
}

/**
 * format worker pool
 * @param {Object} pool
 * @param {Object} config
 * @returns {string} terraform worker pool string
 */
function formatWorkerPool(pool, config) {
  let data = ibmContainerVpcWorkerPool(pool, config);
  return jsonToTfPrint(
    "resource",
    "ibm_container_vpc_worker_pool",
    data.name,
    data.data
  );
}

/**
 * cluster tf file
 * @param {Object} config
 * @param {Array<Object>} config.clusters
 * @param {Array<Object>} config.clusters.worker_pools
 * @returns {string} terraform string
 */
function clusterTf(config) {
  let tf = "";
  config.clusters.forEach((cluster) => {
    let blockData = formatCluster(cluster, config);
    cluster.worker_pools.forEach((pool) => {
      blockData += formatWorkerPool(pool, config);
    });
    tf += tfBlock(cluster.name + " Cluster", blockData) + "\n";
  });
  return tfDone(tf);
}

module.exports = {
  formatCluster,
  formatWorkerPool,
  clusterTf,
  ibmContainerVpcCluster,
  ibmContainerVpcWorkerPool,
};
