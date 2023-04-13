const { assert } = require("chai");
const {
  formatSshKey,
  sshKeyTf,
} = require("../../client/src/lib/json-to-iac/ssh-keys");
const slzNetwork = require("../data-files/slz-network.json");

// ssh-key at end
describe("ssh keys", () => {
  describe("formatSshKey", () => {
    it("should create correct ssh key", () => {
      let actualData = formatSshKey(
        {
          name: "slz-ssh-key",
          public_key: "public-key",
          resource_group: "slz-management-rg",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_ssh_key" "slz_ssh_key" {
  name           = "slz-slz-ssh-key"
  public_key     = var.slz_ssh_key_public_key
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return dorrect data"
      );
    });
    it("should create correct ssh key from data", () => {
      let actualData = formatSshKey(
        {
          name: "slz-ssh-key",
          public_key: "public-key",
          resource_group: "slz-management-rg",
          use_data: true,
        },
        slzNetwork
      );
      let expectedData = `
data "ibm_is_ssh_key" "slz_ssh_key" {
  name = "slz-ssh-key"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("sshKeyTf", () => {
    it("should return the correct ssh keys", () => {
      let actualData = sshKeyTf(slzNetwork);
      let expectedData = `##############################################################################
# SSH Keys
##############################################################################

resource "ibm_is_ssh_key" "slz_ssh_key" {
  name           = "slz-slz-ssh-key"
  public_key     = var.slz_ssh_key_public_key
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
