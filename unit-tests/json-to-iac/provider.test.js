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
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
  it("should return the correct data when power vs is enabled", () => {
    let actualData = ibmCloudProvider({
      _options: {
        enable_power_vs: true,
        power_vs_zones: ["az-1", "az-2"],
      },
    });
    let expectedData = `##############################################################################
# IBM Cloud Provider
##############################################################################

provider "ibm" {
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_az_1"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "az-1"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_az_2"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  zone             = "az-2"
  ibmcloud_timeout = 60
}

##############################################################################
`;
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
});
