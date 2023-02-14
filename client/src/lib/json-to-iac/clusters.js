const { getObjectFromArray } = require("lazy-z");
const {
  endComment,
  clusterSubnetZones,
} = require("./constants");
const {
  rgIdRef,
  getKmsInstanceData,
  buildTitleComment,
  subnetZone,
  fillTemplate,
  composedZone,
  subnetRef,
  kebabName,
  vpcRef,
  resourceRef,
  encryptionKeyRef,
  tfRef,
  jsonToTf,
} = require("./utils");

/**
 * add subnets to cluster or worker pool text
 * @param {string} vpc
 * @param {Array<string>} subnets
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 */
function addSubnetZones(vpc, subnets, config) {
  let str = "";
  subnets.forEach((subnet) => {
    str += fillTemplate(clusterSubnetZones, {
      name: composedZone(config, subnetZone(subnet)),
      subnet: subnetRef(vpc, subnet),
    });
  });
  return str;
}

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
 * @returns {string} cluster terraform code
 */
function formatCluster(cluster, config) {
  let clusterValues = {
    name: kebabName(config, [cluster.name, "cluster"]),
    vpc_id: vpcRef(cluster.vpc),
    resource_group_id: rgIdRef(cluster.resource_group, config),
    flavor: `"${cluster.flavor}"`,
    worker_count: cluster.workers_per_subnet,
    kube_version: `"${cluster.kube_version}"`,
    update_all_workers: cluster.update_all_workers || null,
    tags: true,
    wait_till: `"${cluster.wait_till || "IngressReady"}"`,
    disable_public_service_endpoint: cluster.private_endpoint || false,
  };
  if (cluster.type === "openshift") {
    clusterValues.entitlement = '"cloud_pak"';
    clusterValues.cos_instance_crn = resourceRef(
      cluster.cos + " object storage",
      "crn"
    );
  }
  clusterValues.subnet_values = addSubnetZones(
    cluster.vpc,
    cluster.subnets,
    config
  );
  clusterValues._kms_config = {
    crk_id: encryptionKeyRef(cluster.kms, cluster.encryption_key),
    instance_id: getKmsInstanceData(cluster.kms, config).guid,
    private_endpoint: cluster.private_endpoint || false,
  };
  clusterValues._timeouts = {
    create: '"3h"',
    delete: '"2h"',
    update: '"3h"',
  };

  return jsonToTf(
    "ibm_container_vpc_cluster",
    `${cluster.vpc} vpc ${cluster.name} cluster`,
    clusterValues,
    config
  ).replace(/\s\ssubnet_values\s+=\s+/g, "\n  ");
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
function formatWorkerPool(pool, config) {
  let workerPool = {
    worker_pool_name: kebabName(config, [pool.cluster, "cluster", pool.name]),
    vpc_id: vpcRef(pool.vpc),
    resource_group_id: rgIdRef(pool.resource_group, config),
    cluster: tfRef(
      "ibm_container_vpc_cluster",
      `${pool.vpc} vpc ${pool.cluster} cluster`
    ),
    flavor: `"${pool.flavor}"`,
    worker_count: pool.workers_per_subnet,
  };
  if (
    getObjectFromArray(config.clusters, "name", pool.cluster).type ===
    "openshift"
  )
    workerPool.entitlement = '"cloud_pak"';
  workerPool.subnet_values = addSubnetZones(pool.vpc, pool.subnets, config);
  return jsonToTf(
    "ibm_container_vpc_worker_pool",
    `${pool.vpc} vpc ${pool.cluster} cluster ${pool.name} pool`,
    workerPool,
    config
  ).replace(/\s\ssubnet_values\s+=\s+/g, "\n  ");
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
    tf += buildTitleComment("Cluster", cluster.name);
    tf += formatCluster(cluster, config);
    cluster.worker_pools.forEach((pool) => {
      tf += formatWorkerPool(pool, config);
    });
    tf += endComment + "\n\n";
  });
  return tf.replace(/\n\n$/g, "\n");
}

module.exports = {
  formatCluster,
  formatWorkerPool,
  clusterTf,
};
