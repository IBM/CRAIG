const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("classic_gateways", () => {
  it("should return true if a gw has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa@@@a-",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has an invalid domain", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no datacenter", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no network speed", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no public bandwidth", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no package key name", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no os key name", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no process key name", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no private_vlan", () => {
    craig.store.json.classic_vlans = [];
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no public_vlan", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vlan",
          public_vlan: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no ssh key", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vlan",
          public_vlan: "pvlan",
          ssh_key: "",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has no disk key names", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vlan",
          public_vlan: "pvlan",
          ssh_key: "key",
          disk_key_names: [],
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has memory that is not whole number", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vlan",
          public_vlan: "pvlan",
          ssh_key: "key",
          disk_key_names: ["disk"],
          memory: -1.25,
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return true if a gw has memory that is whole number not in range", () => {
    assert.isTrue(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vlan",
          public_vlan: "pvlan",
          ssh_key: "key",
          disk_key_names: ["disk"],
          memory: -1,
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  it("should return false if a gw has no public_vlan and private_network_only is true", () => {
    assert.isFalse(
      disableSave(
        "classic_gateways",
        {
          name: "aa",
          domain: "oops.com",
          datacenter: "dal10",
          network_speed: "1000",
          public_bandwidth: "64",
          package_key_name: "VIRTUAL_ROUTER_APPLIANCE_1_GPBS",
          os_key_name: "OS_JUNIPER_VSRX_19_4_UP_TO_1GBPS_STANDARD_SRIOV",
          process_key_name: "INTEL_XEON_4210_2_20",
          private_vlan: "vlan",
          public_vlan: "",
          private_network_only: true,
          ssh_key: "key",
          disk_key_names: ["HARD_DRIVE_2_00_TB_SATA_2"],
          memory: 64,
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        },
      ),
      "it should be true",
    );
  });
  describe("invalidText", () => {
    it("should return invalid text for domain", () => {
      assert.deepEqual(
        craig.classic_gateways.domain.invalidText(),
        "Enter a valid domain",
        "it should return text",
      );
    });
    it("should return invalid text for memory", () => {
      assert.deepEqual(
        craig.classic_gateways.memory.invalidText(),
        "Memory must be a whole number between 64 and 1024",
        "it should return text",
      );
    });
  });
});
