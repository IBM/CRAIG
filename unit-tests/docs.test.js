const { assert } = require("chai");
const { allDocText } = require("../client/src/lib/docs");

describe("doc helper functions", () => {
  describe("allDocText", () => {
    it("should return all text when no tables", () => {
      let actualData = allDocText("power_volumes");
      let expectedData =
        "Create storage volumes for Power VS and attach them to Power VS Instances. Storage volumes must be a minimum size of 1 GB and can scale up to 2000 GB. These volumes can be set up to allow multiple instances to access the same volume. The storage tier selected determines the number of I/O operations per second (IOPS) the volume is capable of. Users can either choose Tier 1 or Tier 3 storage. Tier 1 storage is capable of 10 IOPS/GB, and Tier 3 is capable of 3 IOPS/GB. Enabling volume replication allows users to create copies of their storage volumes through the Global Mirror Change Volume (GMCV). Through this, users can protect and restore their volumes in the event of a disaster. Enabling volume sharing allows users to attach multiple Power VS instances to their volume. ";
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return text when table", () => {
      let actualData = allDocText("resource_groups");
      let expectedData = `Resource groups aid in the organization of account resources in an IBM Cloud account. Group Name Description Optional service-rg A resource group containing all IBM Cloud Services management-rg A resource group containing the compute, storage, and network services to enable the application provider's administrators to monitor, operation, and maintain the environment workload-rg A resource group containing the compute, storage, and network services to support hosted applications and operations that deliver services to the consumer edge-rg A resource group containing the compute, storage, and network services necessary for edge networking true craig-rg An example resource group power-rg A resource group for Power VS resources `;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
  });
});
