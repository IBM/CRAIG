const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

function newTempCraig(store) {
  let craig = state();
  craig.store = store;
  return craig;
}

describe("ssh keys", () => {
  it("should return true when the ssh key name already exists", () => {
    let craig = newTempCraig({
      resourceGroups: ["hi"],
      json: {
        ssh_keys: [{ name: "honk", public_key: "1234" }],
      },
    });
    assert.isTrue(
      disableSave(
        "ssh_keys",
        {
          name: "honk",
          resource_group: "hi",
          public_key:
            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        },
        {
          data: {
            data: "test",
          },
          craig: craig,
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true when the ssh key has no rg", () => {
    assert.isTrue(
      disableSave(
        "ssh_keys",
        {
          name: "honk",
          resource_group: "",
          public_key:
            "ssh-rsAAAAB3NzaC1yc2thisisaninvalidsshkey... test@fakeemail.com",
        },
        {
          data: {
            data: "test",
          },
          craig: state(),
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true when the public key value already exists", () => {
    let craig = newTempCraig({
      resourceGroups: ["hi"],
      json: {
        ssh_keys: [
          {
            name: "honk",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
          },
        ],
      },
    });
    assert.isTrue(
      disableSave(
        "ssh_keys",
        {
          name: "test",
          resource_group: "hi",
          public_key:
            "ssh-rsa AAAAB3NzaC1yc2thisisafakesshkeyDSKLFHSJSADFHGASJDSHDBASJKDASDASWDAS+/DSFSDJKFGXFVJDZHXCDZVZZCDKJFGSDJFZDHCVBSDUCZCXZKCHT= test@fakeemail.com",
        },
        {
          data: {
            data: "test",
          },
          craig: craig,
        }
      ),
      "it should be disabled"
    );
  });
  it("should not check invalidSshKey when using data", () => {
    assert.isFalse(
      disableSave(
        "ssh_keys",
        {
          name: "test",
          resource_group: "hi",
          public_key: "honk",
          use_data: true,
        },
        {
          data: {
            data: "test",
          },
          craig: state(),
        }
      ),
      "it should be enabled"
    );
  });
});
