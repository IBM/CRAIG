const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

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
  describe("cbr_rules.init", () => {
    it("should initialize cbr_rules", () => {
      let state = new newState();
      assert.deepEqual(state.store.json.cbr_rules, []);
    });
  });
  describe("cbr_rules crud operations", () => {
    let state;
    beforeEach(() => {
      state = new newState();
    });
    it("should create a cbr rule", () => {
      state.cbr_rules.create({
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
      assert.deepEqual(state.store.json.cbr_rules, expectedData);
    });
    it("should save a cbr rule", () => {
      state.cbr_rules.create({
        name: "cbr-rule",
        description: "description",
        enforcement_mode: "enabled",
        api_type_id: "frog",
        contexts: [],
        resource_attributes: [],
        tags: [],
      });
      state.cbr_rules.save(
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
    });
    it("should delete a cbr rule", () => {
      state.cbr_rules.create({
        name: "cbr-rule",
        description: "description",
        enforcement_mode: "enabled",
        api_type_id: "frog",
        contexts: [],
        resource_attributes: [],
        tags: [],
      });
      state.cbr_rules.delete(
        {},
        {
          data: {
            name: "cbr-rule",
          },
        }
      );
    });
    describe("cbr rules contexts crud", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        state.cbr_rules.create({
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
        state.cbr_rules.contexts.create(
          { name: "context", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].contexts,
          }
        );
        assert.deepEqual(state.store.json.cbr_rules[0].contexts[0], {
          name: "context",
          value: "blah",
        });
      });
      it("should update a context", () => {
        state.cbr_rules.contexts.create(
          { name: "context", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].contexts,
          }
        );
        state.cbr_rules.contexts.save(
          { name: "context-new", value: "hey" },
          {
            arrayParentName: "cbr-rule",
            data: { name: "context" },
          }
        );
        assert.deepEqual(state.store.json.cbr_rules[0].contexts[0], {
          name: "context-new",
          value: "hey",
        });
      });
      it("should delete a context", () => {
        state.cbr_rules.contexts.create(
          { name: "context", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].contexts,
          }
        );
        state.cbr_rules.contexts.delete(
          {},
          { arrayParentName: "cbr-rule", data: { name: "context" } }
        );
      });
    });
    describe("cbr rules resource attributes crud", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        state.cbr_rules.create({
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
        state.cbr_rules.resource_attributes.create(
          { name: "attribute", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].resource_attributes,
          }
        );
        assert.deepEqual(state.store.json.cbr_rules[0].resource_attributes[0], {
          name: "attribute",
          value: "blah",
        });
      });
      it("should update an attribute", () => {
        state.cbr_rules.resource_attributes.create(
          { name: "attribute", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].resource_attributes,
          }
        );
        state.cbr_rules.resource_attributes.save(
          { name: "attribute-new", value: "hey" },
          {
            arrayParentName: "cbr-rule",
            data: { name: "attribute" },
          }
        );
        assert.deepEqual(state.store.json.cbr_rules[0].resource_attributes[0], {
          name: "attribute-new",
          value: "hey",
        });
      });
      it("should delete an attribute", () => {
        state.cbr_rules.resource_attributes.create(
          { name: "attribute", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].resource_attributes,
          }
        );
        state.cbr_rules.resource_attributes.delete(
          {},
          { arrayParentName: "cbr-rule", data: { name: "attribute" } }
        );
      });
    });
    describe("cbr rules tags crud", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        state.cbr_rules.create({
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
        state.cbr_rules.tags.create(
          { name: "tag", operator: "op", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].tags,
          }
        );
        assert.deepEqual(state.store.json.cbr_rules[0].tags[0], {
          name: "tag",
          operator: "op",
          value: "blah",
        });
      });
      it("should update an attribute", () => {
        state.cbr_rules.tags.create(
          { name: "tag", operator: "op", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].tags,
          }
        );
        state.cbr_rules.tags.save(
          { name: "tag-new", operator: "op", value: "blah" },
          {
            arrayParentName: "cbr-rule",
            data: { name: "tag" },
          }
        );
        assert.deepEqual(state.store.json.cbr_rules[0].tags[0], {
          name: "tag-new",
          operator: "op",
          value: "blah",
        });
      });
      it("should delete an attribute", () => {
        state.cbr_rules.tags.create(
          { name: "tag", operator: "op", value: "blah" },
          {
            innerFormProps: { arrayParentName: "cbr-rule" },
            arrayData: state.store.json.cbr_rules[0].tags,
          }
        );
        state.cbr_rules.tags.delete(
          {},
          { arrayParentName: "cbr-rule", data: { name: "tag" } }
        );
      });
    });
  });
});
