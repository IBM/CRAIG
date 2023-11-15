const { assert } = require("chai");
const { state, disableSave } = require("../../../client/src/lib");
const craig = state();

describe("classic ssh keys", () => {
  it("should return true if classic ssh key is in use and has invalid name", () => {
    assert.isTrue(
      disableSave(
        "classic_ssh_keys",
        {
          name: "classic----",
          public_key:
            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        },
        {
          classic: true,
          craig: craig,
          data: {
            name: "hi",
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if classic ssh key is in use and has invalid ssh public key", () => {
    assert.isTrue(
      disableSave(
        "classic_ssh_keys",
        {
          name: "classic-key",
          public_key: "wrong",
        },
        {
          classic: true,
          craig: craig,
          data: {
            name: "hi",
          },
        }
      )
    );
  });
});
