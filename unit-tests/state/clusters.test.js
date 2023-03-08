const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const {
  newDefaultWorkloadCluster,
} = require("../../client/src/lib/state/defaults");

const defaultManagementCluster = {
  kms: "kms",
  cos: "cos",
  entitlement: "cloud_pak",
  type: "openshift",
  kube_version: "default",
  flavor: "bx2.16x64",
  name: "management-cluster",
  resource_group: "management-rg",
  encryption_key: "roks-key",
  subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
  update_all_workers: false,
  vpc: "management",
  worker_pools: [
    {
      entitlement: "cloud_pak",
      cluster: "management-cluster",
      flavor: "bx2.16x64",
      name: "logging-worker-pool",
      resource_group: "management-rg",
      subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
      vpc: "management",
      workers_per_subnet: 2,
    },
  ],
  workers_per_subnet: 2,
  private_endpoint: true,
};

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("clusters", () => {
  describe("clusters.create", () => {
    it("should add a new cluster", () => {
      let state = new newState();
      state.store.json.clusters = [];
      state.clusters.create({ cluster: newDefaultWorkloadCluster() });
      assert.deepEqual(
        state.store.json.clusters,
        [newDefaultWorkloadCluster()],
        "it should create cluster"
      );
    });
  });
  describe("clusters.save", () => {
    it("should update a cluster", () => {
      let state = new newState();
      state.store.json.clusters = [newDefaultWorkloadCluster()];
      state.clusters.save(
        { cluster: defaultManagementCluster },
        {
          data: { name: "workload-cluster" },
        }
      );
      assert.deepEqual(
        state.store.json.clusters,
        [defaultManagementCluster],
        "it should save cluster"
      );
    });
    it("should update cluster worker pools when changing vpc", () => {
      let state = new newState();
      state.clusters.create({
        cluster: {
          cos: "cos",
          entitlement: "cloud_pak",
          type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "frog",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [
            {
              entitlement: "cloud_pak",
              resource_group: "workload-rg",
              flavor: "bx2.16x64",
              name: "logging-worker-pool",
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "workload",
              workers_per_subnet: 2,
            },
          ],
          workers_per_subnet: 2,
          private_endpoint: true,
        },
      });
      state.clusters.save(
        {
          cluster: {
            vpc: "management",
            worker_pools: [
              {
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                name: "logging-worker-pool",
                resource_group: "workload-rg",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc: "workload",
                workers_per_subnet: 2,
              },
            ],
          },
        },
        {
          data: {
            name: "frog",
            vpc: "workload",
          },
        }
      );
      assert.deepEqual(
        state.store.json.clusters[0],
        {
          cos: "cos",
          entitlement: "cloud_pak",
          type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "frog",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          private_endpoint: true,
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "management",
          worker_pools: [
            {
              entitlement: "cloud_pak",
              flavor: "bx2.16x64",
              name: "logging-worker-pool",
              subnets: [],
              vpc: "management",
              workers_per_subnet: 2,
              resource_group: "workload-rg",
            },
          ],
          workers_per_subnet: 2,
        },
        "it should save cluster"
      );
    });
    it("should not update cluster worker pools when not changing vpc", () => {
      let state = new newState();
      state.clusters.create({
        cluster: {
          cos: "cos",
          entitlement: "cloud_pak",
          type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "frog",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          private_endpoint: true,
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [
            {
              entitlement: "cloud_pak",
              flavor: "bx2.16x64",
              resource_group: "workload-rg",
              name: "logging-worker-pool",
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "workload",
              workers_per_subnet: 2,
            },
          ],
          workers_per_subnet: 2,
        },
      });
      state.clusters.save(
        {
          cluster: {
            vpc: "workload",
            worker_pools: [
              {
                entitlement: "cloud_pak",
                flavor: "bx2.16x64",
                resource_group: "workload-rg",
                name: "logging-worker-pool",
                subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
                vpc: "workload",
                workers_per_subnet: 2,
              },
            ],
          },
        },
        {
          data: {
            name: "frog",
            vpc: "workload",
          },
        }
      );
      assert.deepEqual(
        state.store.json.clusters[0],
        {
          cos: "cos",
          entitlement: "cloud_pak",
          type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "frog",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          private_endpoint: true,
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [
            {
              entitlement: "cloud_pak",
              flavor: "bx2.16x64",
              name: "logging-worker-pool",
              resource_group: "workload-rg",
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "workload",
              workers_per_subnet: 2,
            },
          ],
          workers_per_subnet: 2,
        },
        "it should save cluster"
      );
    });
  });
  describe("clusters.delete", () => {
    it("should delete cluster", () => {
      let state = new newState();
      state.store.json.clusters = [newDefaultWorkloadCluster()];
      state.clusters.delete({}, { data: { name: "workload-cluster" } });
      assert.deepEqual(
        state.store.json.clusters,
        [],
        "it should delete clusters"
      );
    });
  });
  describe("clusters.onStoreUpdate", () => {
    it("should set resource group to null if deleted", () => {
      let state = new newState();
      state.clusters.create({ cluster: newDefaultWorkloadCluster() });
      state.resource_groups.delete({}, { data: { name: "workload-rg" } });
      assert.deepEqual(
        state.store.json.clusters[0].resource_group,
        null,
        "it should be null"
      );
    });
    it("should set cos to null if deleted", () => {
      let state = new newState();
      state.clusters.create({ cluster: newDefaultWorkloadCluster() });
      state.object_storage.delete({}, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.clusters[0].cos,
        null,
        "it should be null"
      );
    });
    it("should delete subnet names on tier deletion", () => {
      let state = new newState();
      state.clusters.create({ cluster: newDefaultWorkloadCluster() });
      state.vpcs.subnets.delete(
        {},
        {
          name: "workload",
          subnet: {
            name: "vsi-zone-1",
          },
        }
      );
      state.vpcs.subnets.delete(
        {},
        {
          name: "workload",
          subnet: {
            name: "vsi-zone-2",
          },
        }
      );
      state.vpcs.subnets.delete(
        {},
        {
          name: "workload",
          subnet: {
            name: "vsi-zone-3",
          },
        }
      );
      assert.deepEqual(
        state.store.json.clusters[0].subnets,
        [],
        "it should be empty"
      );
    });
    it("should set vpc name to null if deleted", () => {
      let state = new newState();
      state.clusters.create({ cluster: newDefaultWorkloadCluster() });
      state.vpcs.delete({}, { data: { name: "workload" } });
      assert.deepEqual(
        state.store.json.clusters[0].vpc,
        null,
        "it should be null"
      );
      assert.deepEqual(
        state.store.json.clusters[0].subnets,
        [],
        "it should be empty"
      );
      assert.deepEqual(
        state.store.json.clusters[0].worker_pools[0].vpc,
        null,
        "it should be null"
      );
      assert.deepEqual(
        state.store.json.clusters[0].worker_pools[0].subnets,
        [],
        "it should be null"
      );
    });
    it("should set encryption key name to null if key deleted", () => {
      let state = new newState();
      state.clusters.create({ cluster: newDefaultWorkloadCluster() });
      state.key_management.keys.delete(
        {},
        { arrayParentName: "kms", data: { name: "roks-key" } }
      );
      assert.deepEqual(
        state.store.json.clusters[0].encryption_key,
        null,
        "it should return null"
      );
    });
  });
  describe("cluster.worker_pools", () => {
    describe("clusters.worker_pools.delete", () => {
      it("should delete a worker pool from a cluster object", () => {
        let state = new newState();
        state.clusters.create({ cluster: newDefaultWorkloadCluster() });
        state.clusters.worker_pools.delete(
          {},
          {
            data: { name: "logging-worker-pool" },
            arrayParentName: "workload-cluster",
          }
        );
        assert.deepEqual(
          state.store.json.clusters[0].worker_pools,
          [],
          "it should be empty"
        );
      });
    });
    describe("clusters.worker_pools.save", () => {
      it("should update a worker pool in place", () => {
        let state = new newState();
        state.clusters.create({ cluster: newDefaultWorkloadCluster() });
        state.clusters.worker_pools.save(
          {
            pool: {
              cloud_pak: "no",
            },
          },
          {
            arrayParentName: "workload-cluster",
            data: { name: "logging-worker-pool" },
          }
        );
        assert.deepEqual(
          state.store.json.clusters[0].worker_pools[0].cloud_pak,
          "no",
          "it should be no"
        );
      });
    });
    describe("clusters.worker_pools.create", () => {
      it("should create a worker pool", () => {
        let state = new newState();
        state.clusters.create({ cluster: newDefaultWorkloadCluster() });
        state.clusters.worker_pools.create(
          {
            pool: {
              name: "test",
            },
          },
          {
            arrayParentName: "workload-cluster",
          }
        );
        assert.deepEqual(
          state.store.json.clusters[0].worker_pools[1],
          {
            name: "test",
            vpc: "workload",
            subnets: [],
            flavor: "bx2.16x64",
          },
          "it should be empty"
        );
      });
    });
  });
});
