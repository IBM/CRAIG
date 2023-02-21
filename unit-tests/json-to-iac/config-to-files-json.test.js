const { assert } = require("chai");
const slzNetwork = require("../data-files/slz-network.json");
const slzNetworkFiles = require("../data-files/slz-network-files.json");
const appidSccTeleportNetwork = require("../data-files/appid-scc-teleport-network.json");
const appidSccTeleportNetworkFiles = require("../data-files/appid-scc-teleport-network-files.json");
const { configToFilesJson } = require("../../client/src/lib/json-to-iac/config-to-files-json");

describe("configToFilesJson", () => {
  describe("slzNetwork", () => {
    let actualData = configToFilesJson(slzNetwork);

    it("should return correct versions.tf", () => {
      assert.deepEqual(
        actualData["versions.tf"],
        slzNetworkFiles["versions.tf"],
        "it should create file"
      );
    });
    it("should return correct secrets_manager.tf", () => {
      assert.deepEqual(
        actualData["secrets_manager.tf"],
        null,
        "it should create file"
      );
    });
    it("should return correct main.tf", () => {
      assert.deepEqual(
        actualData["main.tf"],
        slzNetworkFiles["main.tf"],
        "it should create file"
      );
    });
    it("should return correct variables.tf", () => {
      assert.deepEqual(
        actualData["variables.tf"],
        slzNetworkFiles["variables.tf"],
        "it should create file"
      );
    });
    it("should return correct vpc.tf", () => {
      assert.deepEqual(
        actualData["vpc.tf"],
        slzNetworkFiles["vpc.tf"],
        "it should create file"
      );
    });
    it("should return correct object_storage.tf", () => {
      
      assert.deepEqual(
        actualData["object_storage.tf"],
        slzNetworkFiles["object_storage.tf"],
        "it should create file"
      );
    });
    it("should return correct key_management.tf", () => {
      assert.deepEqual(
        actualData["key_management.tf"],
        slzNetworkFiles["key_management.tf"],
        "it should create file"
      );
    });
    it("should return correct resource_groups.tf", () => {
      assert.deepEqual(
        actualData["resource_groups.tf"],
        slzNetworkFiles["resource_groups.tf"],
        "it should create file"
      );
    });
    it("should return correct flow_logs.tf", () => {
      assert.deepEqual(
        actualData["flow_logs.tf"],
        slzNetworkFiles["flow_logs.tf"],
        "it should create file"
      );
    });
    it("should return correct virtual_private_endpoints.tf", () => {
      assert.deepEqual(
        actualData["virtual_private_endpoints.tf"],
        slzNetworkFiles["virtual_private_endpoints.tf"],
        "it should create file"
      );
    });
    it("should return correct security_groups.tf", () => {
      assert.deepEqual(
        actualData["security_groups.tf"],
        slzNetworkFiles["security_groups.tf"],
        "it should create file"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      assert.deepEqual(
        actualData["vpn_gateways.tf"],
        slzNetworkFiles["vpn_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct ssh_keys.tf", () => {
      assert.deepEqual(
        actualData["ssh_keys.tf"],
        slzNetworkFiles["ssh_keys.tf"],
        "it should create file"
      );
    });
    it("should return correct transit_gateways.tf", () => {
      assert.deepEqual(
        actualData["transit_gateways.tf"],
        slzNetworkFiles["transit_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct clusters.tf", () => {
      assert.deepEqual(
        actualData["clusters.tf"],
        slzNetworkFiles["clusters.tf"],
        "it should create file"
      );
    });
    it("should return correct virtual_servers.tf", () => {
      assert.deepEqual(
        actualData["virtual_servers.tf"],
        slzNetworkFiles["virtual_servers.tf"],
        "it should create file"
      );
    });
    it("should return correct appid.tf", () => {
      assert.deepEqual(
        actualData["appid.tf"],
        slzNetworkFiles["appid.tf"],
        "it should create file"
      );
    });
    it("should return correct teleport_vsi.tf", () => {
      assert.deepEqual(
        actualData["teleport_vsi.tf"],
        slzNetworkFiles["teleport_vsi.tf"],
        "it should create file"
      );
    });
    it("should return correct scc.tf", () => {
      assert.deepEqual(
        actualData["scc.tf"],
        slzNetworkFiles["scc.tf"],
        "it should create file"
      );
    });
    describe("other use cases", () => {
      it("should return correct variables when no ssh keys are added", () => {
        let nw = { ...slzNetwork };
        nw.ssh_keys = [];
        nw.vsi = [];
        nw.load_balancers = [];
        assert.deepEqual(
          configToFilesJson(nw)["variables.tf"],
          `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

##############################################################################\n`,
          "it should create file"
        );
      });
    });
  });
  describe("appidSccTeleportNetwork", () => {
    let actualData = configToFilesJson(appidSccTeleportNetwork);
    const fs=require("fs");
    fs.writeFileSync("test.json", JSON.stringify(actualData, null, 2))
    it("should return correct versions.tf", () => {
      assert.deepEqual(
        actualData["versions.tf"],
        appidSccTeleportNetworkFiles["versions.tf"],
        "it should create file"
      );
    });
    it("should return correct main.tf", () => {
      assert.deepEqual(
        actualData["main.tf"],
        appidSccTeleportNetworkFiles["main.tf"],
        "it should create file"
      );
    });
    it("should return correct variables.tf", () => {
      assert.deepEqual(
        actualData["variables.tf"],
        appidSccTeleportNetworkFiles["variables.tf"],
        "it should create file"
      );
    });
    it("should return correct vpc.tf", () => {
      assert.deepEqual(
        actualData["vpc.tf"],
        appidSccTeleportNetworkFiles["vpc.tf"],
        "it should create file"
      );
    });
    it("should return correct object_storage.tf", () => {
      assert.deepEqual(
        actualData["object_storage.tf"],
        appidSccTeleportNetworkFiles["object_storage.tf"],
        "it should create file"
      );
    });
    it("should return correct key_management.tf", () => {
      assert.deepEqual(
        actualData["key_management.tf"],
        appidSccTeleportNetworkFiles["key_management.tf"],
        "it should create file"
      );
    });
    it("should return correct resource_groups.tf", () => {
      assert.deepEqual(
        actualData["resource_groups.tf"],
        appidSccTeleportNetworkFiles["resource_groups.tf"],
        "it should create file"
      );
    });
    it("should return correct flow_logs.tf", () => {
      assert.deepEqual(
        actualData["flow_logs.tf"],
        appidSccTeleportNetworkFiles["flow_logs.tf"],
        "it should create file"
      );
    });
    it("should return correct virtual_private_endpoints.tf", () => {
      assert.deepEqual(
        actualData["virtual_private_endpoints.tf"],
        appidSccTeleportNetworkFiles["virtual_private_endpoints.tf"],
        "it should create file"
      );
    });
    it("should return correct security_groups.tf", () => {
      assert.deepEqual(
        actualData["security_groups.tf"],
        appidSccTeleportNetworkFiles["security_groups.tf"],
        "it should create file"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      assert.deepEqual(
        actualData["vpn_gateways.tf"],
        appidSccTeleportNetworkFiles["vpn_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct ssh_keys.tf", () => {
      assert.deepEqual(
        actualData["ssh_keys.tf"],
        appidSccTeleportNetworkFiles["ssh_keys.tf"],
        "it should create file"
      );
    });
    it("should return correct transit_gateways.tf", () => {
      assert.deepEqual(
        actualData["transit_gateways.tf"],
        appidSccTeleportNetworkFiles["transit_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct clusters.tf", () => {
      assert.deepEqual(
        actualData["clusters.tf"],
        appidSccTeleportNetworkFiles["clusters.tf"],
        "it should create file"
      );
    });
    it("should return correct secrets_manager.tf", () => {
      assert.deepEqual(
        actualData["secrets_manager.tf"],
        appidSccTeleportNetworkFiles["secrets_manager.tf"],
        "it should create file"
      );
    });
    it("should return correct appid.tf", () => {
      assert.deepEqual(
        actualData["appid.tf"],
        appidSccTeleportNetworkFiles["appid.tf"],
        "it should create file"
      );
    });
    it("should return correct teleport_vsi.tf", () => {
      assert.deepEqual(
        actualData["teleport_vsi.tf"],
        appidSccTeleportNetworkFiles["teleport_vsi.tf"],
        "it should create file"
      );
    });
    it("should return correct scc.tf", () => {
      assert.deepEqual(
        actualData["scc.tf"],
        appidSccTeleportNetworkFiles["scc.tf"],
        "it should create file"
      );
    });
    it("should return correct virtual_servers.tf", () => {
      assert.deepEqual(
        actualData["virtual_servers.tf"],
        appidSccTeleportNetworkFiles["virtual_servers.tf"],
        "it should create file"
      );
    });
  });
});
