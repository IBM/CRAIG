const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("cbr", () => {
  let example_cbr_zone = {
    name: "hi",
    description: "",
    account_id: "asdfsdf",
    addresses: [
      {
        name: "asdfasdf",
        account_id: "",
        location: "",
        service_name: "",
        service_instance: "",
        service_type: "",
        type: "ipAddress",
        value: "2.2.2.2",
      },
    ],
    exclusions: [
      {
        name: "asdf",
        account_id: "",
        location: "",
        service_name: "",
        service_instance: "",
        service_type: "",
        type: "ipAddress",
        value: "2.2.2.2",
      },
    ],
  };
  let example_cbr_rule = {
    name: "hi",
    description: "description",
    enforcement_mode: "Report",
    api_type_id: "adfs",
    contexts: [
      {
        name: "hi",
        value: "hi",
      },
    ],
    resource_attributes: [
      {
        name: "hey",
        value: "hey",
      },
    ],
    tags: [
      {
        name: "hello",
        operator: "",
        value: "hello",
      },
    ],
  };

  it("should be disabled if invalid cbr rule name, description, or api type id", () => {
    let cbr_rule = Object.assign({}, example_cbr_rule);
    cbr_rule.name = "";
    cbr_rule.description = "\x00"; // char that does not match description regex
    cbr_rule.account_id = "?>@<";
    assert.isTrue(
      disableSave("cbr_rules", cbr_rule, {
        craig: { store: { json: { cbr_rules: [{ name: "hi" }] } } },
        data: { name: "hi" },
      })
    );
  });
  it("should be enabled if valid", () => {
    let cbr_rule = Object.assign({}, example_cbr_rule);
    assert.isFalse(
      disableSave("cbr_rules", cbr_rule, {
        craig: { store: { json: { cbr_rules: [{ name: "hi" }] } } },
        data: { name: "hi" },
      })
    );
  });
  it("should be disabled if invalid cbr context name or value", () => {
    let cbr_context = Object.assign({}, example_cbr_rule.contexts[0]);
    cbr_context.name = "";
    cbr_context.value = "";
    assert.isTrue(
      disableSave("contexts", cbr_context, {
        craig: {
          store: {
            json: { cbr_rules: [{ name: "hi", contexts: [{ name: "hi" }] }] },
          },
        },
        data: { name: "hi" },
      })
    );
  });
  it("should be enabled if valid cbr context", () => {
    let cbr_context = Object.assign({}, example_cbr_rule.contexts[0]);
    assert.isFalse(
      disableSave("contexts", cbr_context, {
        craig: {
          store: {
            json: { cbr_rules: [{ name: "hi", contexts: [{ name: "hi" }] }] },
          },
        },
        data: { name: "hi" },
      })
    );
  });
  it("should be disabled if invalid cbr resource attribute name or value", () => {
    let cbr_attribute = Object.assign(
      {},
      example_cbr_rule.resource_attributes[0]
    );
    cbr_attribute.name = "";
    cbr_attribute.value = "";
    assert.isTrue(
      disableSave("resource_attributes", cbr_attribute, {
        craig: {
          store: {
            json: {
              cbr_rules: [
                { name: "hi", resource_attributes: [{ name: "hey" }] },
              ],
            },
          },
        },
        data: { name: "hey" },
      })
    );
  });
  it("should be enabled if valid cbr resource attribute", () => {
    let cbr_attribute = Object.assign(
      {},
      example_cbr_rule.resource_attributes[0]
    );
    assert.isFalse(
      disableSave("resource_attributes", cbr_attribute, {
        craig: {
          store: {
            json: {
              cbr_rules: [
                { name: "hi", resource_attributes: [{ name: "hey" }] },
              ],
            },
          },
        },
        data: { name: "hey" },
      })
    );
  });
  it("should be disabled if invalid cbr tag name, operator, or value", () => {
    let cbr_tag = Object.assign({}, example_cbr_rule.tags[0]);
    cbr_tag.name = "";
    cbr_operator = "&5?_!?";
    cbr_tag.value = "";
    assert.isTrue(
      disableSave("tags", cbr_tag, {
        craig: {
          store: {
            json: {
              cbr_rules: [{ name: "hi", tags: [{ name: "hello" }] }],
            },
          },
        },
        data: { name: "hello" },
      })
    );
  });
  it("should be enabled if valid cbr tag", () => {
    let cbr_tag = Object.assign({}, example_cbr_rule.tags[0]);
    assert.isFalse(
      disableSave("tags", cbr_tag, {
        craig: {
          store: {
            json: {
              cbr_rules: [{ name: "hi", tags: [{ name: "hello" }] }],
            },
          },
        },
        data: { name: "hello" },
      })
    );
  });
  it("should be disabled if invalid cbr zone name, description, or account id", () => {
    let cbr_zone = Object.assign({}, example_cbr_zone);
    cbr_zone.name = "";
    cbr_zone.description = "\x00"; // char that does not match description regex
    cbr_zone.account_id = "?>@<";
    assert.isTrue(
      disableSave("cbr_zones", cbr_zone, {
        craig: { store: { json: { cbr_zones: [{ name: "hi" }] } } },
        data: { name: "hi" },
      })
    );
  });
  it("should be enabled if valid cbr zone", () => {
    let cbr_zone = Object.assign({}, example_cbr_zone);
    assert.isFalse(
      disableSave("cbr_zones", cbr_zone, {
        craig: { store: { json: { cbr_zones: [{ name: "hi" }] } } },
        data: { name: "hi" },
      })
    );
  });
  it("should be disabled if invalid cbr address", () => {
    let cbr_address = Object.assign({}, example_cbr_zone.addresses[0]);
    cbr_address.name = "hi";
    cbr_address.account_id = "?>@<";
    cbr_address.location = "\x00"; // char that does not match location regex
    cbr_address.type = "ipAddress";
    cbr_address.value = "not an IP";

    assert.isTrue(
      disableSave("addresses", cbr_address, {
        craig: {
          store: {
            json: {
              cbr_zones: [{ name: "hi", addresses: [{ name: "hi" }] }],
            },
          },
        },
        data: { name: "hi" },
      })
    );
  });
  it("should be enabled if valid cbr address", () => {
    let cbr_address = Object.assign({}, example_cbr_zone.addresses[0]);
    assert.isFalse(
      disableSave("addresses", cbr_address, {
        craig: {
          store: {
            json: {
              cbr_zones: [{ name: "hi", addresses: [{ name: "hi" }] }],
            },
          },
        },
        data: { name: "hi" },
      })
    );
  });
  it("should be disabled if invalid cbr exclusion", () => {
    let cbr_exclusion = Object.assign({}, example_cbr_zone.exclusions[0]);
    cbr_exclusion.name = "";
    cbr_exclusion.account_id = "?>@<";
    cbr_exclusion.location = "\x00"; // char that does not match location regex
    cbr_exclusion.service_name = "\x00"; // char that does not match regex
    cbr_exclusion.type = "ipAddress";
    cbr_exclusion.value = "not an IP";

    assert.isTrue(
      disableSave("exclusions", cbr_exclusion, {
        craig: {
          store: {
            json: {
              cbr_zones: [{ name: "hi", exclusions: [{ name: "hi" }] }],
            },
          },
        },
        data: { name: "hi" },
      })
    );
  });
  it("should be enabled if valid cbr exclusion", () => {
    let cbr_exclusion = Object.assign({}, example_cbr_zone.exclusions[0]);
    assert.isFalse(
      disableSave("exclusions", cbr_exclusion, {
        craig: {
          store: {
            json: {
              cbr_zones: [{ name: "hi", exclusions: [{ name: "hi" }] }],
            },
          },
        },
        data: { name: "hi" },
      })
    );
  });
});
