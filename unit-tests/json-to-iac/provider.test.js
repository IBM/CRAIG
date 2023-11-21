const { assert } = require("chai");
const {
  ibmCloudProvider,
} = require("../../client/src/lib/json-to-iac/provider");

describe("provider terraform", () => {
  it("should return the correct data when classic is enabled", () => {
    let actualData = ibmCloudProvider({
      _options: {
        enable_classic: true,
        classic_zones: ["dal10", "dal12"],
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
  alias                 = "classic"
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
  it("should return the correct data when power vs is enabled in tok, lon, and syd", () => {
    let actualData = ibmCloudProvider({
      _options: {
        enable_power_vs: true,
        power_vs_zones: ["lon04", "tok01", "syd05"],
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
  alias            = "power_vs_lon04"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = "lon"
  zone             = "lon04"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_tok01"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = "tok"
  zone             = "tok01"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_syd05"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = "syd"
  zone             = "syd05"
  ibmcloud_timeout = 60
}

##############################################################################
`;
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
  it("should return the correct data when power vs is enabled in dal10 and wdc07 and region is us-south", () => {
    let actualData = ibmCloudProvider({
      _options: {
        prefix: "iac",
        region: "us-south",
        tags: ["hello", "world"],
        zones: 3,
        endpoints: "private",
        account_id: "",
        fs_cloud: false,
        enable_classic: true,
        dynamic_subnets: true,
        enable_power_vs: true,
        craig_version: "1.6.0",
        power_vs_zones: ["dal10", "wdc07"],
        power_vs_high_availability: true,
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
  alias                 = "classic"
  ibmcloud_timeout      = 60
  iaas_classic_username = var.iaas_classic_username
  iaas_classic_api_key  = var.iaas_classic_api_key
}

provider "ibm" {
  alias            = "power_vs_dal10"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = "us-south"
  zone             = "dal10"
  ibmcloud_timeout = 60
}

provider "ibm" {
  alias            = "power_vs_wdc07"
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = "us-east"
  zone             = "wdc07"
  ibmcloud_timeout = 60
}

##############################################################################
`;
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
});
