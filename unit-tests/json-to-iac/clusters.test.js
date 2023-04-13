const { assert } = require("chai");
const {
  formatCluster,
  formatWorkerPool,
  clusterTf,
} = require("../../client/src/lib/json-to-iac/clusters");
const slzNetwork = require("../data-files/slz-network.json");

describe("clusters", () => {
  describe("formatCluster", () => {
    it("should create terraform code for openshift cluster", () => {
      let actualData = formatCluster(
        {
          kms: "slz-kms",
          cos: "cos",
          entitlement: "cloud_pak",
          type: "openshift",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "workload-cluster",
          resource_group: "slz-workload-rg",
          encryption_key: "slz-vsi-volume-key",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: false,
          vpc: "workload",
          worker_pools: [],
          workers_per_subnet: 2,
          private_endpoint: false,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_container_vpc_cluster" "workload_vpc_workload_cluster_cluster" {
  name                            = "slz-workload-cluster-cluster"
  vpc_id                          = ibm_is_vpc.workload_vpc.id
  resource_group_id               = ibm_resource_group.slz_workload_rg.id
  flavor                          = "bx2.16x64"
  worker_count                    = 2
  kube_version                    = "default"
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = false
  entitlement                     = "cloud_pak"
  cos_instance_crn                = ibm_resource_instance.cos_object_storage.crn
  update_all_workers              = null
  tags = [
    "slz",
    "landing-zone"
  ]
  zones {
    name      = "us-south-1"
    subnet_id = ibm_is_subnet.workload_vsi_zone_1.id
  }
  zones {
    name      = "us-south-2"
    subnet_id = ibm_is_subnet.workload_vsi_zone_2.id
  }
  zones {
    name      = "us-south-3"
    subnet_id = ibm_is_subnet.workload_vsi_zone_3.id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
    instance_id      = ibm_resource_instance.slz_kms.guid
    private_endpoint = false
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create terraform code for iks cluster with private endpoint", () => {
      let actualData = formatCluster(
        {
          kms: "slz-kms",
          cos: null,
          entitlement: "cloud_pak",
          type: "iks",
          kube_version: "default",
          flavor: "bx2.16x64",
          name: "workload",
          resource_group: "slz-workload-rg",
          encryption_key: "slz-vsi-volume-key",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: true,
          vpc: "workload",
          worker_pools: [],
          workers_per_subnet: 2,
          private_endpoint: true,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_container_vpc_cluster" "workload_vpc_workload_cluster" {
  name                            = "slz-workload-cluster"
  vpc_id                          = ibm_is_vpc.workload_vpc.id
  resource_group_id               = ibm_resource_group.slz_workload_rg.id
  flavor                          = "bx2.16x64"
  worker_count                    = 2
  kube_version                    = "default"
  update_all_workers              = true
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = true
  tags = [
    "slz",
    "landing-zone"
  ]
  zones {
    name      = "us-south-1"
    subnet_id = ibm_is_subnet.workload_vsi_zone_1.id
  }
  zones {
    name      = "us-south-2"
    subnet_id = ibm_is_subnet.workload_vsi_zone_2.id
  }
  zones {
    name      = "us-south-3"
    subnet_id = ibm_is_subnet.workload_vsi_zone_3.id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
    instance_id      = ibm_resource_instance.slz_kms.guid
    private_endpoint = true
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatWorkerPool", () => {
    it("should create terraform code for worker pool", () => {
      let actualData = formatWorkerPool(
        {
          entitlement: "cloud_pak",
          cluster: "workload",
          flavor: "bx2.16x64",
          name: "logging-pool",
          resource_group: "slz-workload-rg",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: true,
          vpc: "workload",
          workers_per_subnet: 2,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_container_vpc_worker_pool" "workload_vpc_workload_cluster_logging_pool_pool" {
  worker_pool_name  = "slz-workload-cluster-logging-pool"
  vpc_id            = ibm_is_vpc.workload_vpc.id
  resource_group_id = ibm_resource_group.slz_workload_rg.id
  cluster           = ibm_container_vpc_cluster.workload_vpc_workload_cluster.id
  flavor            = "bx2.16x64"
  worker_count      = 2
  entitlement       = "cloud_pak"
  zones {
    name      = "us-south-1"
    subnet_id = ibm_is_subnet.workload_vsi_zone_1.id
  }
  zones {
    name      = "us-south-2"
    subnet_id = ibm_is_subnet.workload_vsi_zone_2.id
  }
  zones {
    name      = "us-south-3"
    subnet_id = ibm_is_subnet.workload_vsi_zone_3.id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("clusterTf", () => {
    it("should return cluster terraform", () => {
      let actualData = clusterTf(slzNetwork);
      let expectedData = `##############################################################################
# Workload Cluster
##############################################################################

resource "ibm_container_vpc_cluster" "workload_vpc_workload_cluster" {
  name                            = "slz-workload-cluster"
  vpc_id                          = ibm_is_vpc.workload_vpc.id
  resource_group_id               = ibm_resource_group.slz_workload_rg.id
  flavor                          = "bx2.16x64"
  worker_count                    = 2
  kube_version                    = "default"
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = false
  entitlement                     = "cloud_pak"
  cos_instance_crn                = ibm_resource_instance.cos_object_storage.crn
  update_all_workers              = null
  tags = [
    "slz",
    "landing-zone"
  ]
  zones {
    name      = "us-south-1"
    subnet_id = ibm_is_subnet.workload_vsi_zone_1.id
  }
  zones {
    name      = "us-south-2"
    subnet_id = ibm_is_subnet.workload_vsi_zone_2.id
  }
  zones {
    name      = "us-south-3"
    subnet_id = ibm_is_subnet.workload_vsi_zone_3.id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
    instance_id      = ibm_resource_instance.slz_kms.guid
    private_endpoint = false
  }
}

resource "ibm_container_vpc_worker_pool" "workload_vpc_workload_cluster_logging_pool_pool" {
  worker_pool_name  = "slz-workload-cluster-logging-pool"
  vpc_id            = ibm_is_vpc.workload_vpc.id
  resource_group_id = ibm_resource_group.slz_workload_rg.id
  cluster           = ibm_container_vpc_cluster.workload_vpc_workload_cluster.id
  flavor            = "bx2.16x64"
  worker_count      = 2
  entitlement       = "cloud_pak"
  zones {
    name      = "us-south-1"
    subnet_id = ibm_is_subnet.workload_vsi_zone_1.id
  }
  zones {
    name      = "us-south-2"
    subnet_id = ibm_is_subnet.workload_vsi_zone_2.id
  }
  zones {
    name      = "us-south-3"
    subnet_id = ibm_is_subnet.workload_vsi_zone_3.id
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("other use cases", () => {
    it("should create terraform code for iks worker pool", () => {
      slzNetwork.clusters[0].type = "iks";
      let actualData = formatWorkerPool(
        {
          entitlement: "cloud_pak",
          cluster: "workload",
          flavor: "bx2.16x64",
          name: "logging-pool",
          resource_group: "slz-workload-rg",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          update_all_workers: true,
          vpc: "workload",
          workers_per_subnet: 2,
        },
        slzNetwork
      );

      let expectedData = `
resource "ibm_container_vpc_worker_pool" "workload_vpc_workload_cluster_logging_pool_pool" {
  worker_pool_name  = "slz-workload-cluster-logging-pool"
  vpc_id            = ibm_is_vpc.workload_vpc.id
  resource_group_id = ibm_resource_group.slz_workload_rg.id
  cluster           = ibm_container_vpc_cluster.workload_vpc_workload_cluster.id
  flavor            = "bx2.16x64"
  worker_count      = 2
  zones {
    name      = "us-south-1"
    subnet_id = ibm_is_subnet.workload_vsi_zone_1.id
  }
  zones {
    name      = "us-south-2"
    subnet_id = ibm_is_subnet.workload_vsi_zone_2.id
  }
  zones {
    name      = "us-south-3"
    subnet_id = ibm_is_subnet.workload_vsi_zone_3.id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
