const { assert } = require("chai");
const resourceGroupTf = require("../../lib/json-to-iac/resource-groups");

// append rg, prefix - added only when not use data
describe("resource groups", () => {
  it("should return terraform code for json resource group", () => {
    let testData = {
      _options: {
        tags: ["hello", "world"],
        prefix: "ut",
      },
      resource_groups: [
        {
          use_data: false,
          name: "slz-service-rg",
        },
        {
          use_data: false,
          name: "slz-management-rg",
        },
        {
          use_data: true,
          name: "slz-workload-rg",
          use_prefix: true,
        },
      ],
    };
    let expectedData = `##############################################################################
# Resource Groups
##############################################################################

resource "ibm_resource_group" "slz_service_rg" {
  name = "ut-slz-service-rg"
  tags = ["hello","world"]
}

resource "ibm_resource_group" "slz_management_rg" {
  name = "ut-slz-management-rg"
  tags = ["hello","world"]
}

data "ibm_resource_group" "slz_workload_rg" {
  name = "slz-workload-rg"
}

##############################################################################`;

    let actualData = resourceGroupTf(testData);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct terraform"
    );
  });
});
