const { assert } = require("chai");
const {
  ibmCloudProvider,
} = require("../../client/src/lib/json-to-iac/provider");

describe("provider terraform", () => {
  it("should return the correct data when classic is enabled", () => {
    let actualData = ibmCloudProvider({
      _options: {
        classic_resources: true,
      },
    });
    let expectedData = `##############################################################################
# IBM Cloud Provider
##############################################################################

provider "ibm" {
  ibmcloud_api_key      = var.ibmcloud_api_key
  region                = var.region
  ibmcloud_timeout      = 60
  iaas_classic_username = var.iaas_classic_username
  iaas_classic_api_key  = var.iaas_classic_api_key
}

##############################################################################
`;
    console.log(actualData);
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
});
