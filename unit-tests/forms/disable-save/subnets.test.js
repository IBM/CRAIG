const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("subnets", () => {
  it("should return true if subnet tier has invalid name", () => {
    assert.isTrue(
      disableSave(
        "subnetTier",
        { name: "frog" },
        {
          vpc_name: "test",
          data: {
            name: "todd",
          },
          craig: {
            store: {
              subnetTiers: {
                test: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return false if subnet tier has same name as props", () => {
    assert.isFalse(
      disableSave(
        "subnetTier",
        { name: "todd", advanced: false },
        {
          vpc_name: "test",
          data: {
            name: "todd",
          },
          craig: {
            store: {
              subnetTiers: {
                test: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if advanced subnet tier has no zones", () => {
    assert.isTrue(
      disableSave(
        "subnetTier",
        {
          name: "todd",
          advanced: true,
          network_acl: "frog",
          select_zones: [],
        },
        {
          vpc_name: "test",
          data: {
            name: "todd",
          },
          craig: {
            store: {
              subnetTiers: {
                test: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
        }
      ),
      "it should be disabled"
    );
  });
  it("should return true if subnet has invalid network acl", () => {
    assert.isTrue(
      disableSave("subnet", { network_acl: null }, {}),
      "it should be true"
    );
  });
  it("should return true if advanced subnet tier has invalid cidr", () => {
    assert.isTrue(
      disableSave("subnet", { tier: "frog", cidr: "aaaa" }, {}),
      "it should be true"
    );
  });
  it("should return true if advanced subnet tier has invalid cidr block (overlapping ok)", () => {
    assert.isTrue(
      disableSave("subnet", { tier: "frog", cidr: "1.2.3.4/5" }, {}),
      "it should be true"
    );
  });
  it("should return true if advanced subnet tier has invalid name", () => {
    assert.isTrue(
      disableSave(
        "subnet",
        { tier: "frog", cidr: "1.2.3.4/15", name: "@@@@" },
        {
          data: {
            name: "",
          },
          vpc_name: "test",
        },
        {
          store: {
            json: {
              vpcs: [
                {
                  name: "test",
                  subnets: [
                    {
                      name: "egg",
                    },
                  ],
                },
              ],
            },
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if advanced subnet tier has invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "subnet",
        { tier: "frog", cidr: "1.2.3.4/15", name: "egg" },
        {
          data: {
            name: "frog",
          },
          vpc_name: "test",
        },
        {
          store: {
            json: {
              vpcs: [
                {
                  name: "test",
                  subnets: [
                    {
                      name: "egg",
                    },
                  ],
                },
              ],
            },
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if advanced subnet tier has null cidr", () => {
    assert.isTrue(
      disableSave(
        "subnet",
        { tier: "fro222g", cidr: null, name: "egg" },
        {
          data: {
            name: "frog",
          },
          vpc_name: "test",
        },
        {
          store: {
            json: {
              vpcs: [
                {
                  name: "test",
                  subnets: [
                    {
                      name: "egg",
                    },
                  ],
                },
              ],
            },
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if advanced subnet tier has invalid network acl", () => {
    assert.isTrue(
      disableSave(
        "subnet",
        { tier: "frog", cidr: "1.2.3.4/15", name: "toad", network_acl: "" },
        {
          data: {
            name: "frog",
          },
          vpc_name: "test",
        },
        {
          store: {
            json: {
              vpcs: [
                {
                  name: "test",
                  subnets: [
                    {
                      name: "egg",
                    },
                  ],
                },
              ],
            },
          },
        }
      ),
      "it should be true"
    );
  });
});
