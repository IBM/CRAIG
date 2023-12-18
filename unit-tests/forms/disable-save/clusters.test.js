const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("clusters", () => {
  it("should return true if a cluster has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "@@@",
        },
        {
          craig: craig,
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster has an invalid duplicate name", () => {
    let tempCraig = state();
    tempCraig.setUpdateCallback(() => {});
    tempCraig.clusters.create({ name: "toad", subnets: [], worker_pools: [] });
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad",
        },
        {
          craig: tempCraig,
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster is openshift and has no cos", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad2",
          kube_type: "openshift",
          cos: null,
        },
        {
          craig: craig,
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster is openshift and has cos but invalid subnets", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad2",
          kube_type: "openshift",
          cos: "cos",
          workers_per_subnet: 1,
          subnets: [],
        },
        {
          craig: craig,
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  describe("worker_pools", () => {
    it("should return true if a cluster worker pool has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            name: "a--",
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a cluster worker pool has no flavor", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            name: "aaaa",
            flavor: "",
          },
          {
            craig: craig,
            data: {
              name: "aaaa",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a cluster worker pool has no subnets", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            name: "toad",
            flavor: "spicy",
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a cluster worker pool has empty subnets", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            name: "aaa",
            flavor: "spicy",
            subnets: [],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
  });
  describe("opaque_secrets", () => {
    it("should return true if a cluster opaque secret has an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          clusters: [
            {
              name: "frog",
              opaque_secrets: [
                {
                  name: "a",
                },
              ],
            },
            {
              name: "toad",
              opaque_secrets: [
                {
                  name: "duplicate",
                },
              ],
            },
          ],
        },
      };
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "duplicate",
          },
          {
            craig: tempCraig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a cluster opaque secret has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "AAAAA",
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a cluster secrets group has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "a",
            secrets_group: "AAAAAA",
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a secrets group is an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          clusters: [
            {
              name: "frog",
              opaque_secrets: [
                {
                  name: "a",
                  secrets_group: "duplicate",
                },
              ],
            },
          ],
        },
      };

      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "duplicate",
          },
          {
            craig: tempCraig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if arbitrary secret is an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          secrets_manager: [],
          clusters: [
            {
              name: "frog",
              opaque_secrets: [
                {
                  name: "a",
                  secrets_group: "a",
                  arbitrary_secret_name: "duplicate",
                },
              ],
            },
          ],
        },
      };
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            arbitrary_secret_name: "duplicate",
          },
          {
            craig: tempCraig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if username password secret is an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          secrets_manager: [],
          clusters: [
            {
              name: "frog",
              opaque_secrets: [
                {
                  name: "a",
                  secrets_group: "a",
                  arbitrary_secret_name: "a",
                  username_password_secret_name: "duplicate",
                },
              ],
            },
          ],
        },
      };
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            arbitrary_secret_name: "frog",
            username_password_secret_name: "duplicate",
            labels: [],
          },
          {
            craig: tempCraig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if secrets manager is empty", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            arbitrary_secret_name: "frog",
            username_password_secret_name: "frog",
            secrets_manager: "",
            labels: [],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if labels are empty", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            arbitrary_secret_name: "frog",
            username_password_secret_name: "frog",
            secrets_manager: "frog",
            labels: ["2@@@@2"],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if a secret label is invalid", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            labels: ["label", "invalid-label-"],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if no expiration date is selected", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            secrets_manager: "frog",
            username_password_secret_name: "frog",
            arbitrary_secret_name: "frog",
            arbitrary_secred_data: "frog",
            username_password_secret_name: "frog",
            username_password_secret_username: "frog",
            username_password_secret_password: "frog",
            labels: [],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return false if user_pass secret and arbitrary secret have diff names", () => {
      assert.isFalse(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            secrets_manager: "frog",
            username_password_secret_name: "frog",
            arbitrary_secret_name: "tadpole",
            arbitrary_secret_data: "frog",
            username_password_secret_username: "frog",
            username_password_secret_password: "frog",
            expiration_date: "never",
            arbitrary_secret_description: "frog",
            username_password_secret_description: "frog",
            labels: [],
            auto_rotate: false,
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be false"
      );
    });
    it("should return true if arbitrary secret description is invalid", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            secrets_manager: "frog",
            username_password_secret_name: "frog",
            arbitrary_secret_name: "frog",
            arbitrary_secret_data: "frog",
            arbitrary_secret_description: "@@@",
            username_password_secret_description: "frog",
            username_password_secret_username: "frog",
            username_password_secret_password: "frog",
            expiration_date: "never",
            labels: [],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true if username password secret description is invalid", () => {
      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "frog",
            secrets_manager: "frog",
            username_password_secret_name: "frog",
            arbitrary_secret_name: "frog",
            arbitrary_secret_data: "frog",
            arbitrary_secret_description: "frog",
            username_password_secret_description: "@@@@",
            username_password_secret_username: "frog",
            username_password_secret_password: "frog",
            expiration_date: "never",
            labels: [],
          },
          {
            craig: craig,
            data: {
              name: "mm",
            },
          }
        ),
        "it should be true"
      );
    });
  });
});
