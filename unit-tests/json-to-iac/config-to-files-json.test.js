const { assert } = require("chai");
const { configToFilesJson } = require("../../client/src/lib/json-to-iac");
const f5nw = require("../data-files/f5-nw.json");

describe("configToFilesJson", () => {
  it("should set tmos admin password", () => {
    let expectedData = `##############################################################################
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
    let actualData = configToFilesJson(f5nw)["variables.tf"];
    assert.deepEqual(expectedData, actualData);
  });
});
