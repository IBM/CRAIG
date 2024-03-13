const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("classic bare metal state", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("classic_bare_metal.init", () => {
    it("should initialize classic bare metal servers", () => {
      assert.deepEqual(
        craig.store.json.classic_bare_metal,
        [],
        "it should initialize data"
      );
    });
  });
  describe("clasic_bare_metal.create", () => {
    it("should create a bare metal instance", () => {
      craig.classic_bare_metal.create({ name: "test", domain: "test.com" });
      assert.deepEqual(
        craig.store.json.classic_bare_metal,
        [
          {
            name: "test",
            domain: "test.com",
          },
        ],
        "it should return correct data"
      );
    });
  });
  describe("classic_bare_metal.save", () => {
    it("should update a bare metal instance", () => {
      craig.classic_bare_metal.create({ name: "test", domain: "test.com" });
      craig.classic_bare_metal.save(
        { name: "frog", domain: "frog.com" },
        {
          craig: craig,
          data: {
            name: "test",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.classic_bare_metal,
        [
          {
            name: "frog",
            domain: "frog.com",
          },
        ],
        "it should return correct data"
      );
    });
  });
  describe("classic_bare_metal.delete", () => {
    it("should delete a bare metal instance", () => {
      craig.classic_bare_metal.create({ name: "test", domain: "test.com" });
      craig.classic_bare_metal.delete(
        {},
        { data: { name: "test", domain: "test.com" } }
      );
      assert.deepEqual(
        craig.store.json.classic_bare_metal,
        [],
        "it should return correct data"
      );
    });
  });
  describe("classic_bare_metal.schema", () => {
    it("save should be disabled when empty", () => {
      assert.isTrue(
        disableSave("classic_bare_metal", {}, { craig: craig }),
        "it should be disabled"
      );
    });
    it("should return return true if name is invalid", () => {
      assert.isTrue(
        craig.classic_bare_metal.name.invalid({
          name: "---",
        }),
        "it should return true"
      );
    });
    it("should return return true if domain is invalid", () => {
      assert.isTrue(
        craig.classic_bare_metal.domain.invalid({
          domain: "frog",
        }),
        "it should return true"
      );
    });
    it("should return return true if os_key_name is empty", () => {
      assert.isTrue(
        craig.classic_bare_metal.os_key_name.invalid({
          os_key_name: "",
        }),
        "it should return true"
      );
    });
    it("should return return true if package_key_name is empty", () => {
      assert.isTrue(
        craig.classic_bare_metal.package_key_name.invalid({
          package_key_name: "",
        }),
        "it should return true"
      );
    });
    it("should return return true if process_key_name is empty", () => {
      assert.isTrue(
        craig.classic_bare_metal.process_key_name.invalid({
          process_key_name: "",
        }),
        "it should return true"
      );
    });
    it("should return return true if disk_key_names is empty", () => {
      assert.isTrue(
        craig.classic_bare_metal.disk_key_names.invalid({
          disk_key_names: [],
        }),
        "it should return true"
      );
    });
    it("should hide public_bandwidth if private_network_only is true", () => {
      assert.isTrue(
        craig.classic_bare_metal.public_bandwidth.hideWhen({
          private_network_only: true,
        }),
        "it should return true"
      );
    });
  });
});
