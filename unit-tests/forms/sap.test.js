const { assert } = require("chai");
const {
  calculateSapHanaMemory,
  calculateSapDataVolumeSize,
  calculateSapLogVolumeSize,
  calculateSapSharedVolumeSize,
  getSapVolumeList,
} = require("../../client/src/lib/forms/sap");

describe("sap hana functions", () => {
  describe("calculateSapHanaMemory", () => {
    it("should return correct auto calculated size for profile ush1-4x128", () => {
      let actualData = calculateSapHanaMemory("uh1-4x128");
      let expectedData = 256;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
    it("should return correct auto calculated size for profile ush1-4x128", () => {
      let actualData = calculateSapHanaMemory("uh1-4x768");
      let expectedData = 768;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
  });
  describe("calculateSapDataVolumeSize", () => {
    it("should return the correct value for profile ush1-4x128", () => {
      let actualData = calculateSapDataVolumeSize("uh1-4x128");
      let expectedData = 71;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
  });
  describe("calculateSapLogVolumeSize", () => {
    it("should return the correct value for profile ush1-4x128", () => {
      let actualData = calculateSapLogVolumeSize("uh1-4x128");
      let expectedData = 33;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
    it("should return the correct value for profile bh1-120x12000", () => {
      let actualData = calculateSapLogVolumeSize("bh1-120x12000");
      let expectedData = 512;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
  });
  describe("calculateSapSharedVolumeSize", () => {
    it("should return the correct value for profile ush1-4x128", () => {
      let actualData = calculateSapSharedVolumeSize("uh1-4x128");
      let expectedData = 256;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
    it("should return the correct value for profile bh1-120x12000", () => {
      let actualData = calculateSapSharedVolumeSize("bh1-120x12000");
      let expectedData = 1024;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct memory",
      );
    });
  });
  describe("getSapVolumeList", () => {
    it("should return correct volumes for profile ush1-4x128", () => {
      let actualData = getSapVolumeList("ush1-4x128");
      let expectedData = [
        {
          name: "data-1",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 71,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "data-2",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 71,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "data-3",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 71,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "data-4",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 71,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-1",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 33,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-2",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 33,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-3",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 33,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-4",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 33,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "shared",
          pi_volume_type: "tier3",
          mount: "/hana/shared",
          pi_volume_size: 256,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected volumes",
      );
      let totalSize = 0;
      actualData.forEach((volume) => {
        totalSize += volume.pi_volume_size;
      });
      assert.isAtLeast(totalSize, 500, "it should meet minimum storage");
    });
    it("should return correct volumes for profile bh1-140x14000", () => {
      let actualData = getSapVolumeList("bh1-140x14000");
      let expectedData = [
        {
          name: "data-1",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 3851,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "data-2",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 3851,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "data-3",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 3851,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "data-4",
          pi_volume_type: "tier1",
          mount: "/hana/data",
          pi_volume_size: 3851,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-1",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 512,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-2",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 512,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-3",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 512,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "log-4",
          pi_volume_type: "tier1",
          mount: "/hana/log",
          pi_volume_size: 512,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
        {
          name: "shared",
          pi_volume_type: "tier3",
          mount: "/hana/shared",
          pi_volume_size: 1024,
          sap: true,
          workspace: undefined,
          attachments: [],
          storage_option: "Storage Type",
          affinity_type: null,
          zone: undefined,
        },
      ];
      let totalSize = 0;
      actualData.forEach((volume) => {
        totalSize += volume.pi_volume_size;
      });
      assert.isAtLeast(totalSize, 15970, "it should meet minimum storage");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return expected volumes",
      );
    });
  });
});
