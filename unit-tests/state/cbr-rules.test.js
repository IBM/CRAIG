const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const craig = state();

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("cbr_rules", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("cbr_rules.init", () => {
    it("should initialize cbr_rules", () => {
      assert.deepEqual(
        craig.store.json.cbr_rules,
        [],
        "should initialize with empty array"
      );
    });
  });
  describe("cbr_rules crud operations", () => {
    it("should create a cbr rule", () => {
      craig.cbr_rules.create({
        name: "cbr-rule",
        description: "description",
        enforcement_mode: "enabled",
        api_type_id: "frog",
        contexts: [],
        resource_attributes: [],
        tags: [],
      });
      let expectedData = [
        {
          name: "cbr-rule",
          description: "description",
          enforcement_mode: "enabled",
          api_type_id: "frog",
          contexts: [],
          resource_attributes: [],
          tags: [],
        },
      ];
      assert.deepEqual(
        craig.store.json.cbr_rules,
        expectedData,
        "it should return correct cbr rule"
      );
    });
    it("should save a cbr rule", () => {
      craig.cbr_rules.create({
        name: "cbr-rule",
        description: "description",
        enforcement_mode: "enabled",
        api_type_id: "frog",
        contexts: [],
        resource_attributes: [],
        tags: [],
      });
      craig.cbr_rules.save(
        {
          api_type_id: "new",
          description: "hi",
          enforcement_mode: "disabled",
          name: "new-cbr-rule-name",
        },
        {
          data: {
            name: "cbr-rule",
          },
        }
      );
      let expectedData = [
        {
          name: "new-cbr-rule-name",
          description: "hi",
          enforcement_mode: "disabled",
          api_type_id: "new",
          contexts: [],
          resource_attributes: [],
          tags: [],
        },
      ];
      assert.deepEqual(
        craig.store.json.cbr_rules,
        expectedData,
        "it should return correct cbr rule"
      );
    });
    it("should delete a cbr rule", () => {
      craig.cbr_rules.create({
        name: "cbr-rule",
        description: "description",
        enforcement_mode: "enabled",
        api_type_id: "frog",
        contexts: [],
        resource_attributes: [],
        tags: [],
      });
      craig.cbr_rules.delete(
        {},
        {
          data: {
            name: "cbr-rule",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.cbr_rules,
        [],
        "it should delete cbr rule"
      );
    });
    describe("cbr rules contexts crud", () => {
      beforeEach(() => {
        craig.cbr_rules.create({
          name: "cbr-rule",
          description: "description",
          enforcement_mode: "enabled",
          api_type_id: "frog",
          contexts: [],
          resource_attributes: [],
          tags: [],
        });
      });
      it("should create a context", () => {
        craig.cbr_rules.contexts.create(
          { name: "context", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].contexts,
          }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].contexts[0],
          {
            name: "context",
            value: "blah",
          },
          "it should return correct cbr rule context"
        );
      });
      it("should update a context", () => {
        craig.cbr_rules.contexts.create(
          { name: "context", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].contexts,
          }
        );
        craig.cbr_rules.contexts.save(
          { name: "context-new", value: "hey" },
          {
            arrayParentName: "cbr-rule",
            data: { name: "context" },
          }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].contexts[0],
          {
            name: "context-new",
            value: "hey",
          },
          "it should return correct cbr rule context"
        );
      });
      it("should delete a context", () => {
        craig.cbr_rules.contexts.create(
          { name: "context", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].contexts,
          }
        );
        craig.cbr_rules.contexts.delete(
          {},
          { arrayParentName: "cbr-rule", data: { name: "context" } }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].contexts,
          [],
          "it should delete cbr rule context"
        );
      });
    });
    describe("cbr rules resource attributes crud", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        craig.cbr_rules.create({
          name: "cbr-rule",
          description: "description",
          enforcement_mode: "enabled",
          api_type_id: "frog",
          contexts: [],
          resource_attributes: [],
          tags: [],
        });
      });
      it("should create an attribute", () => {
        craig.cbr_rules.resource_attributes.create(
          { name: "attribute", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].resource_attributes,
          }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].resource_attributes[0],
          {
            name: "attribute",
            value: "blah",
          },
          "it should return correct cbr rule resource attribute"
        );
      });
      it("should update an attribute", () => {
        craig.cbr_rules.resource_attributes.create(
          { name: "attribute", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].resource_attributes,
          }
        );
        craig.cbr_rules.resource_attributes.save(
          { name: "attribute-new", value: "hey" },
          {
            arrayParentName: "cbr-rule",
            data: { name: "attribute" },
          }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].resource_attributes[0],
          {
            name: "attribute-new",
            value: "hey",
          },
          "it should return correct cbr rule resource attribute"
        );
      });
      it("should delete an attribute", () => {
        craig.cbr_rules.resource_attributes.create(
          { name: "attribute", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].resource_attributes,
          }
        );
        craig.cbr_rules.resource_attributes.delete(
          {},
          { arrayParentName: "cbr-rule", data: { name: "attribute" } }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].resource_attributes,
          [],
          "it should delete cbr rule resource attribute"
        );
      });
    });
    describe("cbr rules tags crud", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        craig.cbr_rules.create({
          name: "cbr-rule",
          description: "description",
          enforcement_mode: "enabled",
          api_type_id: "frog",
          contexts: [],
          resource_attributes: [],
          tags: [],
        });
      });
      it("should create an attribute", () => {
        craig.cbr_rules.tags.create(
          { name: "tag", operator: "op", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].tags,
          }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].tags[0],
          {
            name: "tag",
            operator: "op",
            value: "blah",
          },
          "it should return correct cbr rule tag"
        );
      });
      it("should update an attribute", () => {
        craig.cbr_rules.tags.create(
          { name: "tag", operator: "op", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: craig.store.json.cbr_rules[0].tags,
          }
        );
        craig.cbr_rules.tags.save(
          { name: "tag-new", operator: "op", value: "blah" },
          {
            arrayParentName: "cbr-rule",
            data: { name: "tag" },
          }
        );
        assert.deepEqual(
          craig.store.json.cbr_rules[0].tags[0],
          {
            name: "tag-new",
            operator: "op",
            value: "blah",
          },
          "it should return correct cbr rule tag"
        );
      });
      it(
        "should delete an attribute",
        () => {
          craig.cbr_rules.tags.create(
            { name: "tag", operator: "op", value: "blah" },
            {
              innerFormProps: { arrayParentName: "cbr-rule" },
              arrayData: craig.store.json.cbr_rules[0].tags,
            }
          );
          craig.cbr_rules.tags.delete(
            {},
            { arrayParentName: "cbr-rule", data: { name: "tag" } }
          );
          assert.deepEqual(craig.store.json.cbr_rules[0].tags, []);
        },
        "it should delete cbr rule tag"
      );
    });
    describe("cbr_rules.onStoreUpdate", () => {
      it("should initialize context to empty array", () => {
        craig.cbr_rules.create({
          name: "cbr-rule",
          description: "description",
          enforcement_mode: "enabled",
          api_type_id: "frog",
        });
        craig.update();
        assert.deepEqual(
          craig.store.json.cbr_rules[0].contexts,
          [],
          "it should initialize with empty contexts array"
        );
      });
      it("should make cbr rules empty if undefined", () => {
        craig.store.json.cbr_rules = undefined;
        craig.update();
        assert.deepEqual(
          craig.store.json.cbr_rules,
          [],
          "it shoud return empty array"
        );
      });
    });
  });
  describe("cbr-rules.schema", () => {
    it("should return true when a cbr context with the same name", () => {
      assert.isTrue(
        craig.cbr_rules.contexts.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_rules: [
                    {
                      name: "hi",
                      contexts: [
                        {
                          name: "test",
                        },
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
              name: "frog",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true when a cbr rule with the same name", () => {
      assert.isTrue(
        craig.cbr_rules.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_rules: [
                    {
                      name: "test",
                    },
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
    it("should return true when a cbr resource attribute with the same name", () => {
      assert.isTrue(
        craig.cbr_rules.resource_attributes.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_rules: [
                    {
                      name: "hi",
                      resource_attributes: [
                        {
                          name: "test",
                        },
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
              name: "frog",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return true when a cbr tag with the same name", () => {
      assert.isTrue(
        craig.cbr_rules.tags.name.invalid(
          {
            name: "test",
          },
          {
            craig: {
              store: {
                json: {
                  cbr_rules: [
                    {
                      name: "hi",
                      tags: [
                        {
                          name: "test",
                        },
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
              name: "frog",
            },
          }
        ),
        "it should be true"
      );
    });
    it("should return correct groups for enfocement mode", () => {
      assert.deepEqual(
        craig.cbr_rules.enforcement_mode.groups(),
        ["Enabled", "Disabled", "Report"],
        "it should return correct text"
      );
    });
    it("should return false for valid enforcement mode", () => {
      assert.isFalse(
        craig.cbr_rules.enforcement_mode.invalid({
          enforcement_mode: "Enabled",
        }),
        "it should return correct text"
      );
    });
  });
});
