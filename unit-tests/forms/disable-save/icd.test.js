const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("icd", () => {
  it("should return true if a database instance has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "@@@",
          resource_group: "managment-rg",
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has an duplicate name", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "toad",
          resource_group: "managment-rg",
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has an invalid resource group", () => {
    assert.isTrue(
      disableSave(
        "icd",
        { name: "frog", resource_group: null, use_data: false },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has an invalid service", () => {
    assert.isTrue(
      disableSave(
        "icd",
        { name: "frog", resource_group: "managment-rg", service: null },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has a non-whole number memory input", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "frog",
          resource_group: "managment-rg",
          memory: 1.1,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          memoryMin: 1,
          memoryMax: 112,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has an invalid integer memory input", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "frog",
          resource_group: "managment-rg",
          memory: -100,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          memoryMin: 1,
          memoryMax: 112,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has a non-whole number disk input", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "frog",
          resource_group: "managment-rg",
          memory: 100,
          disk: 1.1,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          memoryMin: 1,
          memoryMax: 112,
          diskMin: 5,
          diskMax: 4096,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has an invalid integer disk input", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "frog",
          resource_group: "managment-rg",
          memory: 100,
          disk: 2,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          memoryMin: 1,
          memoryMax: 112,
          diskMin: 5,
          diskMax: 4096,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has a non-whole number cpu input", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "frog",
          resource_group: "managment-rg",
          memory: 100,
          disk: 100,
          cpu: 1.1,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          memoryMin: 1,
          memoryMax: 112,
          diskMin: 5,
          diskMax: 4096,
          cpuMin: 0,
          cpuMax: 28,
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a database instance has an invalid integer cpu input", () => {
    assert.isTrue(
      disableSave(
        "icd",
        {
          name: "frog",
          resource_group: "managment-rg",
          memory: 100,
          disk: 100,
          cpu: -100,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          memoryMin: 1,
          memoryMax: 112,
          diskMin: 5,
          diskMax: 4096,
          cpuMin: 0,
          cpuMax: 28,
        }
      ),
      "it should be true"
    );
  });
  it("should return false otherwise", () => {
    assert.isFalse(
      disableSave(
        "icd",
        {
          name: "test",
          resource_group: "managment-rg",
          use_data: false,
          plan: "standard",
          kms: null,
          encryption_key: null,
          service: "databases-for-postgresql",
          group_id: "member",
          memory: "",
          disk: "",
          cpu: 0,
        },
        {
          craig: {
            store: {
              json: {
                icd: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
              },
            },
          },
          data: {
            name: "frog",
          },
          cpuMin: 3,
          cpuMax: 28,
        }
      ),
      "it should be false"
    );
  });
});
