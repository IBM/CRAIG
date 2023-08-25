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

describe("secrets_manager", () => {
  describe("secrets_manager.init", () => {
    it("should initialize secrets_manager", () => {
      let state = new newState();
      let expectedData = [];
      assert.deepEqual(
        state.store.json.secrets_manager,
        expectedData,
        "it should have secrets_manager initialized"
      );
    });
  });
  describe("secrets_manager crud functions", () => {
    let secrets_managerState;
    beforeEach(() => {
      secrets_managerState = new newState();
    });
    it("should add an secrets_manager instance", () => {
      secrets_managerState.secrets_manager.create({ name: "default" });
      assert.deepEqual(
        secrets_managerState.store.json.secrets_manager,
        [
          {
            name: "default",
            resource_group: null,
            encryption_key: null,
            kms: null,
            secrets: [],
          },
        ],
        "it should create secrets_manager"
      );
    });
    it("should save an secrets_manager instance", () => {
      secrets_managerState.secrets_manager.create({
        name: "default",
        encryption_key: "key",
      });
      secrets_managerState.secrets_manager.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        secrets_managerState.store.json.secrets_manager,
        [
          {
            name: "default",
            resource_group: "service-rg",
            encryption_key: "key",
            kms: "kms",
            secrets: [],
          },
        ],
        "it should create secrets_manager"
      );
    });
    it("should update cluster.opaque_secrets.secret_manager name when secrets manager is renamed", () => {
      let state = new newState();
      state.secrets_manager.create({
        name: "default",
        encryption_key: "key",
      });
      state.secrets_manager.save(
        { name: "new-name" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        state.store.json.clusters[0].opaque_secrets[0].secrets_manager,
        "new-name",
        "it should update cluster.opaque_secrets"
      );
    });
    it("should not update cluster.opaque_secrets.secret_manager when unrelated secrets manager is renamed", () => {
      let state = new newState();
      state.secrets_manager.create({
        name: "new-secret-manager",
        encryption_key: "key",
      });
      state.secrets_manager.save(
        { name: "updated-name" },
        { data: { name: "new-secret-manager" } }
      );
      assert.deepEqual(
        state.store.json.clusters[0].opaque_secrets[0].secrets_manager,
        "default",
        "it should not update cluster.opaque_secrets"
      );
    });
    it("should not update empty cluster secrets when secrets manager updates", () => {
      let state = new newState();
      state.store.json.clusters[0].opaque_secrets = [];
      state.secrets_manager.create({
        name: "new-secret-manager",
        encryption_key: "key",
      });
      state.secrets_manager.save(
        { name: "updated-name" },
        { data: { name: "new-secret-manager" } }
      );
      assert.deepEqual(
        state.store.json.clusters[0].opaque_secrets,
        [],
        "it should not update cluster.opaque_secrets"
      );
    });
    it("should delete an secrets_manager instance", () => {
      secrets_managerState.secrets_manager.create({ name: "default" });
      secrets_managerState.secrets_manager.delete(
        {},
        { data: { name: "default" } }
      );
      assert.deepEqual(
        secrets_managerState.store.json.secrets_manager,
        [],
        "it should create secrets_manager"
      );
    });
  });
});
