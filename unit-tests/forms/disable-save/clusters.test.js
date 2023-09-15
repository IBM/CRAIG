const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("clusters", () => {
  it("should return true if a cluster has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "@@@",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
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
  it("should return true if a cluster has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "clusters",
        {
          name: "toad",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
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
          wokrers_per_subnet: 1,
          subnets: [],
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                  },
                  {
                    name: "toad",
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a cluster worker pool has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "worker_pools",
        {
          name: "a",
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "a",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "a",
                      },
                    ],
                  },
                ],
              },
            },
          },
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
        },
        {
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "toad",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "toad",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
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
          craig: {
            store: {
              json: {
                clusters: [
                  {
                    name: "frog",
                    worker_pools: [
                      {
                        name: "toad",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    worker_pools: [
                      {
                        name: "frog",
                      },
                    ],
                  },
                ],
                vpcs: [
                  {
                    name: "frog",
                    acls: [
                      {
                        name: "frog",
                        rules: [
                          {
                            name: "frog",
                          },
                          {
                            name: "mmm",
                          },
                        ],
                      },
                      {
                        name: "aaa",
                      },
                    ],
                  },
                  {
                    name: "toad",
                    acls: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "mm",
          },
        }
      ),
      "it should be true"
    );
  });
});
