const { assert } = require("chai");
const slzNetwork = require("../data-files/slz-network.json");
const slzNetworkFiles = require("../data-files/slz-network-files.json");
const appidSccTeleportNetwork = require("../data-files/appid-scc-teleport-network.json");
const appidSccTeleportNetworkFiles = require("../data-files/appid-scc-teleport-network-files.json");
const f5Network = require("../data-files/f5-nw.json");
const f5NetworkFiles = require("../data-files/f5-nw-files.json");
const {
  configToFilesJson,
} = require("../../client/src/lib/json-to-iac/config-to-files-json");

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
    it("should return correct cloud-init.tpl", () => {
      assert.deepEqual(
        actualData["cloud-init.tpl"],
        appidSccTeleportNetworkFiles["cloud-init.tpl"],
        "it should create file"
      );
    });
  });
  describe("f5-nw", () => {
    let actualData = configToFilesJson(f5Network);
    it("should return correct f5_big_ip.tf", () => {
      assert.deepEqual(
        actualData["f5_big_ip.tf"],
        f5NetworkFiles["f5_big_ip.tf"],
        "it should create file"
      );
    });
    it("should return correct f5_user_data.yaml", () => {
      assert.deepEqual(
        actualData["f5_user_data.yaml"],
        f5NetworkFiles["f5_user_data.yaml"],
        "it should create file"
      );
    });
    it("should add tmos admin password variable", () => {
      let variables = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "tmos_admin_password" {
  description = "F5 TMOS Admin Password"
  type        = string
  sensitive   = true
  default     = "Goodpassword1234!"
}

##############################################################################
`;
      assert.deepEqual(
        actualData["variables.tf"],
        variables,
        "it should create file"
      );
    });
  });
});
