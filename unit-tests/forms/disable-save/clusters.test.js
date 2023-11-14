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
  it("should return true if a cluster opaque secret has an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "opaque_secrets",
        {
          name: "duplicate",
        },
        {
          craig: {
            store: {
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
  it("should return true if a cluster opaque secret has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "opaque_secrets",
        {
          name: "AAAAA",
        },
        {
          craig: {
            store: {
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
  it("should return true if a cluster serets group has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "opaque_secrets",
        {
          name: "a",
          secrets_group: "AAAAAA",
        },
        {
          craig: {
            store: {
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
                  ,
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
  it("should return true if a secrets group is an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "opaque_secrets",
        {
          name: "frog",
          secrets_group: "duplicate",
        },
        {
          craig: {
            store: {
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
  it("should return true if arbitrary secret is an invalid duplicate name", () => {
    assert.isTrue(
      disableSave(
        "opaque_secrets",
        {
          name: "frog",
          secrets_group: "frog",
          arbitrary_secret_name: "duplicate",
        },
        {
          craig: {
            store: {
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
  it("should return true if username password secret is an invalid duplicate name", () => {
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
          craig: {
            store: {
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
          craig: {
            store: {
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
                        username_password_secret_name: "a",
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
          craig: {
            store: {
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
                        username_password_secret_name: "a",
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
  it("should return true if a secret label is invalid", () => {
    assert.isTrue(
      disableSave(
        "opaque_secrets",
        {
          name: "frog",
          labels: ["label", "invalid-label-"],
        },
        {
          craig: {
            store: {
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
        craig: {
          store: {
            json: {
              secrets_manager: [],
              clusters: [
                {
                  name: "frog",
                  opaque_secrets: [
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
      },
      {
        craig: {
          store: {
            json: {
              secrets_manager: [],
              clusters: [
                {
                  name: "frog",
                  opaque_secrets: [
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
        craig: {
          store: {
            json: {
              secrets_manager: [],
              clusters: [
                {
                  name: "frog",
                  opaque_secrets: [
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
        craig: {
          store: {
            json: {
              secrets_manager: [],
              clusters: [
                {
                  name: "frog",
                  opaque_secrets: [
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
