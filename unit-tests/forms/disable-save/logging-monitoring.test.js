const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");

describe("logdna", () => {
  it("should be disabled when invalid plan", () => {
    let actualData = disableSave(
      "logdna",
      {
        resource_group: "service-rg",
        plan: "",
        bucket: "test",
        enabled: true,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid resource group", () => {
    let actualData = disableSave(
      "logdna",
      {
        resource_group: "",
        plan: "tier-2",
        bucket: "test",
        enabled: true,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid bucket", () => {
    let actualData = disableSave(
      "logdna",
      {
        resource_group: "service-rg",
        plan: "tier-2",
        bucket: "",
        enabled: true,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when enable is false", () => {
    let actualData = disableSave(
      "logdna",
      {
        resource_group: "",
        plan: "",
        bucket: "",
        enabled: false,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
});

describe("sysdig", () => {
  it("should be disabled when invalid resource group", () => {
    let actualData = disableSave(
      "sysdig",
      {
        resource_group: "",
        plan: "tier-2",
        enabled: true,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should be disabled when invalid plan", () => {
    let actualData = disableSave(
      "sysdig",
      {
        resource_group: "service-rg",
        plan: "",
        enabled: true,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isTrue(actualData, "it should be disabled");
  });
  it("should not be disabled when enable is false", () => {
    let actualData = disableSave(
      "sysdig",
      {
        resource_group: "",
        plan: "",
        enabled: false,
      },
      {
        data: {
          name: "test",
        },
        craig: state(),
      }
    );
    assert.isFalse(actualData, "it should not be disabled");
  });
});
