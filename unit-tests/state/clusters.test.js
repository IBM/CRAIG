const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const {
  newDefaultWorkloadCluster,
} = require("../../client/src/lib/state/defaults");

const defaultManagementCluster = {
  kms: "kms",
  cos: "cos",
  entitlement: "cloud_pak",
  kube_type: "openshift",
  kube_version: null,
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
  opaque_secrets: [],
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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("clusters.create", () => {
    it("should add a new cluster", () => {
      craig.store.json.clusters = [];
      craig.clusters.create(newDefaultWorkloadCluster());
      assert.deepEqual(
        craig.store.json.clusters,
        [newDefaultWorkloadCluster()],
        "it should create cluster"
      );
    });
  });
  describe("clusters.save", () => {
    it("should update a cluster", () => {
      craig.clusters.save(defaultManagementCluster, {
        data: { name: "workload-cluster" },
      });
      assert.deepEqual(
        craig.store.json.clusters,
        [defaultManagementCluster],
        "it should save cluster"
      );
    });
    it("should update cluster worker pools when changing vpc", () => {
      craig.clusters.create({
        cos: "cos",
        entitlement: "cloud_pak",
        kube_type: "openshift",
        kube_version: "default (Default)",
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
      });
      craig.clusters.save(
        {
          vpc: "management",
          kube_version: "default (Default)",
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
        {
          data: {
            name: "frog",
            vpc: "workload",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.clusters[1],
        {
          cos: "cos",
          entitlement: "cloud_pak",
          kube_type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "frog",
          opaque_secrets: [],
          kms: "kms",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          private_endpoint: true,
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "management",
          worker_pools: [
            {
              cluster: "frog",
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
      craig.clusters.create({
        cos: "cos",
        entitlement: "cloud_pak",
        kube_type: "openshift",
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
      });
      craig.clusters.save(
        {
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
        {
          data: {
            name: "frog",
            vpc: "workload",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.clusters[1],
        {
          cos: "cos",
          entitlement: "cloud_pak",
          kube_type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          kms: "kms",
          opaque_secrets: [],
          name: "frog",
          resource_group: "workload-rg",
          encryption_key: "roks-key",
          private_endpoint: true,
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [
            {
              cluster: "frog",
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
    it("should update opaque_secret.cluster when cluster.name is changed", () => {
      craig.clusters.create(newDefaultWorkloadCluster());
      craig.store.json.clusters[0].opaque_secrets[0] = {
        name: "frog",
        cluster: "frog",
        secrets_manager: "frog",
      };
      craig.clusters.save(
        { name: "new-name" },
        { data: { name: "workload-cluster" } }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].opaque_secrets[0].cluster,
        "new-name",
        "it should update opaque secrets cluster name"
      );
    });
  });
  describe("clusters.delete", () => {
    it("should delete cluster", () => {
      craig.store.json.clusters = [newDefaultWorkloadCluster()];
      craig.clusters.delete({}, { data: { name: "workload-cluster" } });
      assert.deepEqual(
        craig.store.json.clusters,
        [],
        "it should delete clusters"
      );
    });
  });
  describe("clusters.onStoreUpdate", () => {
    beforeEach(() => {
      craig.clusters.create(newDefaultWorkloadCluster());
    });
    it("should set resource group to null if deleted", () => {
      craig.resource_groups.delete({}, { data: { name: "workload-rg" } });
      assert.deepEqual(
        craig.store.json.clusters[0].resource_group,
        null,
        "it should be null"
      );
      assert.deepEqual(
        craig.store.json.clusters[0].worker_pools[0].resource_group,
        null,
        "it should be null"
      );
    });
    it("should set cos to null if deleted", () => {
      craig.object_storage.delete({}, { data: { name: "cos" } });
      assert.deepEqual(
        craig.store.json.clusters[0].cos,
        null,
        "it should be null"
      );
    });
    it("should set worker pools if not found", () => {
      let cluster = newDefaultWorkloadCluster();
      delete cluster.worker_pools;
      craig.clusters.create(cluster);
      craig.object_storage.delete({}, { data: { name: "cos" } });
      assert.deepEqual(
        craig.store.json.clusters[2].worker_pools,
        [],
        "it should be null"
      );
    });
    it("should delete subnet names on tier deletion", () => {
      craig.vpcs.subnets.delete(
        {},
        {
          name: "workload",
          data: {
            name: "vsi-zone-1",
          },
        }
      );
      craig.vpcs.subnets.delete(
        {},
        {
          name: "workload",
          data: {
            name: "vsi-zone-2",
          },
        }
      );
      craig.vpcs.subnets.delete(
        {},
        {
          name: "workload",
          data: {
            name: "vsi-zone-3",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].subnets,
        [],
        "it should be empty"
      );
    });
    it("should set vpc name to null if deleted", () => {
      craig.vpcs.delete({}, { data: { name: "workload" } });
      assert.deepEqual(
        craig.store.json.clusters[0].vpc,
        null,
        "it should be null"
      );
      assert.deepEqual(
        craig.store.json.clusters[0].subnets,
        [],
        "it should be empty"
      );
      assert.deepEqual(
        craig.store.json.clusters[0].worker_pools[0].vpc,
        null,
        "it should be null"
      );
      assert.deepEqual(
        craig.store.json.clusters[0].worker_pools[0].subnets,
        [],
        "it should be null"
      );
    });
    it("should set encryption key name to null if key deleted", () => {
      craig.key_management.keys.delete(
        {},
        { arrayParentName: "kms", data: { name: "roks-key" } }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].encryption_key,
        null,
        "it should return null"
      );
    });
  });
  describe("clusters.schema", () => {
    describe("clusters.name.invalid", () => {
      it("should be invalid when cluster name length is greater than 32", () => {
        assert.isTrue(
          craig.clusters.name.invalid(
            { name: "a-super-long-name-yes" },
            {
              vpc_name: "vpc",
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "iac",
                    },
                    clusters: [],
                  },
                },
              },
            }
          ),
          "should be invalid"
        );
      });
    });
    describe("clusters.name.invalidText", () => {
      it("should return correct text when name is longer than 32 characters", () => {
        assert.deepEqual(
          craig.clusters.name.invalidText(
            { name: "a-super-long-name-yes" },
            {
              vpc_name: "vpc",
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "iac",
                    },
                    clusters: [],
                  },
                },
              },
            }
          ),
          "Cluster names must be 32 or fewer characters including the environment prefix and suffix"
        );
      });
    });
    describe("clusters.name.helperText", () => {
      it("should return correct text", () => {
        assert.deepEqual(
          craig.clusters.name.helperText(
            { name: "test" },
            {
              vpc_name: "vpc",
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "iac",
                    },
                  },
                },
              },
            }
          ),
          "iac-test-cluster",
          "it should return correct text"
        );
      });
    });
    it("should return correct data on kube type render when empty string", () => {
      assert.deepEqual(
        craig.clusters.kube_type.onRender({}),
        "",
        "it should return empty string"
      );
    });
    it("should return correct data on kube type render when openshift", () => {
      assert.deepEqual(
        craig.clusters.kube_type.onRender({ kube_type: "openshift" }),
        "OpenShift",
        "it should return correct data"
      );
    });
    it("should return correct data on kube type render when iks", () => {
      assert.deepEqual(
        craig.clusters.kube_type.onRender({ kube_type: "iks" }),
        "IBM Kubernetes Service",
        "it should return correct data"
      );
    });
    it("should return correct data on kube type render when openshift", () => {
      assert.deepEqual(
        craig.clusters.kube_type.onInputChange({ kube_type: "OpenShift" }),
        "openshift",
        "it should return correct data"
      );
    });
    it("should return correct data on kube type input change when iks", () => {
      assert.deepEqual(
        craig.clusters.kube_type.onInputChange({
          kube_type: "IBM Kubernetes Service",
        }),
        "iks",
        "it should return correct data"
      );
    });
    it("should be not have invalid cos when openshift", () => {
      assert.isFalse(
        craig.clusters.cos.invalid({}),
        "it should not be invalid"
      );
    });
    it("should be have invalid cos when openshift and not selected", () => {
      assert.isFalse(
        craig.clusters.cos.invalid({
          kube_type: "openshift",
        }),
        "it should not be invalid"
      );
    });
    it("should return correct groups for cos", () => {
      assert.deepEqual(
        craig.clusters.cos.groups({}, { craig: craig }),
        ["atracker-cos", "cos"],
        "it should return correct data"
      );
    });
    it("should hide cos when type not openshift", () => {
      assert.isTrue(
        craig.clusters.cos.hideWhen({ kube_type: "" }),
        "it should be hidden"
      );
    });
    it("should hide entitlement when type not openshift", () => {
      assert.isTrue(
        craig.clusters.entitlement.hideWhen({ kube_type: "" }),
        "it should be hidden"
      );
    });
    it("should have invalid subnets when openshift and invalid workers per subnet", () => {
      assert.isTrue(
        craig.clusters.subnets.invalid({
          kube_type: "openshift",
          subnets: [],
          workers_per_subnet: "1",
        }),
        "it should be invalid"
      );
    });
    it("should have invalid workers per subnet when openshift and invalid workers per subnet", () => {
      assert.isTrue(
        craig.clusters.workers_per_subnet.invalid({
          kube_type: "openshift",
          subnets: [],
          workers_per_subnet: "1",
        }),
        "it should be invalid"
      );
    });
    it("should not be invalid subnets when openshift and workers per subnet", () => {
      assert.isFalse(
        craig.clusters.subnets.invalid({
          kube_type: "openshift",
          subnets: ["subnet"],
          workers_per_subnet: "2",
        }),
        "it should be invalid"
      );
    });
    it("should not be invalid when not openshift and 1 workers per subnet", () => {
      assert.isFalse(
        craig.clusters.subnets.invalid({
          kube_type: "iks",
          subnets: ["subnet"],
          workers_per_subnet: "1",
        }),
        "it should be invalid"
      );
    });
    it("should return correct api endpoint for flavors", () => {
      assert.deepEqual(
        craig.clusters.flavor.apiEndpoint(
          {},
          {
            craig: {
              store: {
                json: {
                  _options: {
                    region: "us-south",
                  },
                },
              },
            },
          }
        ),
        `/api/cluster/us-south/flavors`,
        "it should return api endpoint"
      );
    });
  });
  describe("cluster.worker_pools", () => {
    beforeEach(() => {
      craig.clusters.create(newDefaultWorkloadCluster());
    });
    describe("clusters.worker_pools.delete", () => {
      it("should delete a worker pool from a cluster object", () => {
        craig.clusters.worker_pools.delete(
          {},
          {
            data: { name: "logging-worker-pool" },
            arrayParentName: "workload-cluster",
          }
        );
        assert.deepEqual(
          craig.store.json.clusters[0].worker_pools,
          [],
          "it should be empty"
        );
      });
    });
    describe("clusters.worker_pools.save", () => {
      it("should update a worker pool in place", () => {
        craig.clusters.worker_pools.save(
          {
            cloud_pak: "no",
          },
          {
            arrayParentName: "workload-cluster",
            data: { name: "logging-worker-pool" },
          }
        );
        assert.deepEqual(
          craig.store.json.clusters[0].worker_pools[0].cloud_pak,
          "no",
          "it should be no"
        );
      });
    });
    describe("clusters.worker_pools.create", () => {
      it("should create a worker pool", () => {
        craig.clusters.worker_pools.create(
          {
            name: "test",
          },
          {
            innerFormProps: { arrayParentName: "workload-cluster" },
          }
        );
        assert.deepEqual(
          craig.store.json.clusters[0].worker_pools[1],
          {
            cluster: "workload-cluster",
            resource_group: "workload-rg",
            name: "test",
            vpc: "workload",
            subnets: [],
            flavor: "bx2.16x64",
          },
          "it should be empty"
        );
      });
    });
    describe("worker pools schema", () => {
      it("should be hidden when parent kube type is not openshift", () => {
        assert.isTrue(
          craig.clusters.worker_pools.entitlement.hideWhen(
            {},
            {
              parent: {
                kube_type: "iks",
              },
            }
          ),
          "it should be hidden"
        );
      });
    });
  });
  describe("cluster.opaque_secrets", () => {
    describe("clusters.opaque_secrets.create", () => {
      it("should create an opaque secret", () => {
        craig.clusters.create(newDefaultWorkloadCluster());
        craig.store.json.clusters[0].opaque_secrets[0] = {
          name: "frog",
          cluster: "frog",
          secrets_manager: "frog",
        };
        craig.clusters.opaque_secrets.create(
          {
            name: "super_secret_password",
          },
          {
            innerFormProps: { arrayParentName: "workload-cluster" },
          }
        );
        assert.deepEqual(
          craig.store.json.clusters[0].opaque_secrets[1],
          {
            cluster: "workload-cluster",
            name: "super_secret_password",
          },
          "it should create opaque secret"
        );
      });
    });
    describe("clusters.opaque_secrets.save", () => {
      it("should update an opaque secret in place", () => {
        craig.store.json.clusters[0].opaque_secrets[0] = {
          name: "secret",
          cluster: "frog",
          secrets_manager: "frog",
        };
        craig.clusters.opaque_secrets.save(
          {
            name: "password",
          },
          {
            arrayParentName: "workload-cluster",
            data: { name: "secret" },
          }
        );
        assert.deepEqual(
          craig.store.json.clusters[0].opaque_secrets[0].name,
          "password",
          "it should update secret name to password"
        );
      });
    });
    describe("clusters.opaque_secrets.delete", () => {
      it("should delete an opauqe secret from a cluster object", () => {
        craig.clusters.create(newDefaultWorkloadCluster());
        craig.store.json.clusters[0].opaque_secrets[0] = {
          name: "secret",
          cluster: "frog",
          secrets_manager: "frog",
        };
        craig.update();
        craig.clusters.opaque_secrets.delete(
          {},
          {
            data: { name: "secret" },
            arrayParentName: "workload-cluster",
          }
        );
        assert.deepEqual(
          craig.store.json.clusters[0].opaque_secrets,
          [],
          "it should be empty"
        );
      });
    });
    describe("clusters.opaque_secrets.schema", () => {
      it("should have invalid expiration date", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.expiration_date.invalid({}),
          "it should be invalid"
        );
      });
      it("should have invalid username_password_secret_description", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.username_password_secret_description.invalid(
            {
              username_password_secret_description: "@@@",
            }
          ),
          "it should be invalid"
        );
      });
      it("should have invalid arbitrary_secret_description", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.arbitrary_secret_description.invalid({
            arbitrary_secret_description: "@@@",
          }),
          "it should be invalid"
        );
      });
      it("should have correct invalid values", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.labels.invalid({}),
          "it should be invalid"
        );
        assert.isTrue(
          craig.clusters.opaque_secrets.labels.invalid({
            labels: ["@!@@"],
          }),
          "it should be invalid"
        );
      });
      it("should return true if arbitrary_secret_name has empty string as name", () => {
        let actualData =
          craig.clusters.opaque_secrets.arbitrary_secret_name.invalid(
            {
              arbitrary_secret_name: "",
            },
            {
              craig: {
                store: {
                  json: {
                    secrets_manager: [],
                    clusters: [
                      {
                        opaque_secrets: [{ arbitrary_secret_name: "frog" }],
                      },
                    ],
                  },
                },
              },
              data: {
                arbitrary_secret_name: "egg",
              },
            }
          );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return true if opaque_secrets has a duplicate name", () => {
        let actualData = craig.clusters.opaque_secrets.name.invalid(
          {
            name: "frog",
          },
          {
            craig: {
              store: {
                json: {
                  clusters: [
                    {
                      opaque_secrets: [{ name: "frog" }],
                    },
                  ],
                },
              },
            },
            data: {
              name: "egg",
            },
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return true if opaque_secrets has an invalid name", () => {
        let actualData = craig.clusters.opaque_secrets.name.invalid(
          {
            name: "AAAA",
          },
          {
            craig: {
              store: {
                json: {
                  clusters: [
                    {
                      opaque_secrets: [{ name: "frog" }],
                    },
                  ],
                },
              },
            },
            data: {
              name: "egg",
            },
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return true if secrets_group has is empty", () => {
        let actualData = craig.clusters.opaque_secrets.secrets_group.invalid(
          {
            secrets_group: "",
          },
          {
            craig: {
              store: {
                json: {
                  clusters: [
                    {
                      opaque_secrets: [{ secrets_group: "frog" }],
                    },
                  ],
                },
              },
            },
            data: {
              secerts_group: "egg",
            },
          }
        );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return true if username_password_secret_name is a duplicate", () => {
        let actualData =
          craig.clusters.opaque_secrets.username_password_secret_name.invalid(
            {
              username_password_secret_name: "frog",
            },
            {
              craig: {
                store: {
                  json: {
                    secrets_manager: [],
                    clusters: [
                      {
                        opaque_secrets: [
                          { username_password_secret_name: "frog" },
                        ],
                      },
                    ],
                  },
                },
              },
              data: {
                username_password_secret_name: "egg",
              },
            }
          );
        assert.isTrue(actualData, "it should be true");
      });
      it("should return correct text if arbitrary_secret_name is invalid", () => {
        let actualData =
          craig.clusters.opaque_secrets.arbitrary_secret_name.invalidText(
            {
              arbitrary_secret_name: "AAAA",
            },
            {
              craig: {
                store: {
                  json: {
                    secrets_manager: [],
                    clusters: [
                      {
                        opaque_secrets: [{ arbitrary_secret_name: "frog" }],
                      },
                    ],
                  },
                },
              },
              data: {
                arbitrary_secret_name: "egg",
              },
            }
          );
        assert.deepEqual(
          actualData,
          "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
          "it should return the correct text"
        );
      });
      it("should return correct text if arbitrary_secret_name is a duplicate", () => {
        let actualData =
          craig.clusters.opaque_secrets.arbitrary_secret_name.invalidText(
            {
              name: "frog",
              secrets_group: "frog",
              arbitrary_secret_name: "frog",
            },
            {
              craig: {
                store: {
                  json: {
                    secrets_manager: [],
                    clusters: [
                      {
                        opaque_secrets: [{ arbitrary_secret_name: "frog" }],
                      },
                    ],
                  },
                },
              },
              data: {
                arbitrary_secret_name: "egg",
              },
            }
          );
        assert.deepEqual(
          actualData,
          `Name "frog" already in use`,
          "it should return the correct text"
        );
      });
      it("should return groups for secrets manager", () => {
        assert.deepEqual(
          craig.clusters.opaque_secrets.secrets_manager.groups(
            {},
            { craig: craig }
          ),
          [],
          "it should return secrets manager instances"
        );
      });
      it("should hide interval when auto rotate is false", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.interval.hideWhen({
            auto_rotate: false,
          }),
          "it should be hidden"
        );
      });
      it("should not have invalid interval when auto rotate is false", () => {
        assert.isFalse(
          craig.clusters.opaque_secrets.interval.invalid({
            auto_rotate: false,
          }),
          "it should be hidden"
        );
      });
      it("should return true when auto rotate and no interval", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.interval.invalid({
            auto_rotate: true,
            interval: "",
          }),
          "it should be hidden"
        );
      });
      it("should hide unit when auto rotate is false", () => {
        assert.isTrue(
          craig.clusters.opaque_secrets.unit.hideWhen({ auto_rotate: false }),
          "it should be hidden"
        );
      });
    });
  });
});
