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

describe("icd", () => {
  describe("icd.init", () => {
    it("should initialize icd", () => {
      let state = new newState();
      let expectedData = [];
      assert.deepEqual(
        state.store.json.icd,
        expectedData,
        "it should have icd initialized"
      );
    });
  });
  describe("icd.onStoreUpdate", () => {
    it("should set unfound icd to empty array", () => {
      let state = newState();
      state.store.json.icd = null;
      state.update();
      assert.deepEqual(state.store.json.icd, [], "it should be an empty array");
    });
  });
  describe("icd crud functions", () => {
    let icdState;
    beforeEach(() => {
      icdState = new newState();
    });
    it("should add an icd instance", () => {
      icdState.icd.create({ name: "default" });
      assert.deepEqual(
        icdState.store.json.icd,
        [
          {
            name: "default",
            resource_group: null,
            kms: null,
            encryption_key: null,
          },
        ],
        "it should create icd"
      );
    });
    it("should save an icd instance", () => {
      icdState.icd.create({ name: "default" });
      icdState.icd.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        icdState.store.json.icd,
        [
          {
            name: "default",
            resource_group: "service-rg",
            kms: null,
            encryption_key: null,
          },
        ],
        "it should create icd"
      );
    });
    it("should delete an icd instance", () => {
      icdState.icd.create({ name: "default" });
      icdState.icd.delete({}, { data: { name: "default" } });
      assert.deepEqual(icdState.store.json.icd, [], "it should create icd");
    });
  });
  describe("icd.schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    describe("name", () => {
      it("should return true for invalid name", () => {
        assert.isTrue(
          craig.icd.name.invalid({ name: "wrong-" }),
          craig,
          "it should be true"
        );
      });
    });
    describe("service", () => {
      it("should return empty string onRender when no service", () => {
        assert.deepEqual(
          craig.icd.service.onRender({}),
          "",
          "it should be empty string"
        );
      });
      it("should return string onRender when service", () => {
        assert.deepEqual(
          craig.icd.service.onRender({ service: "databases-for-postgresql" }),
          "Databases For Postgresql",
          "it should be return string"
        );
      });
      it("should return string on input change", () => {
        assert.deepEqual(
          craig.icd.service.onInputChange({
            service: "Databases For Postgresql",
          }),
          "databases-for-postgresql",
          "it should return string"
        );
      });
      it("should update stateData if service is not mongoDb", () => {
        let tempData = {
          service: "databases-for-postgresql",
          plan: "enterprise",
          group_id: "analytics",
        };
        tempData.service = craig.icd.service.onInputChange(tempData);
        assert.deepEqual(
          tempData,
          {
            service: "databases-for-postgresql",
            plan: "standard",
            group_id: "member",
          },
          "it should set data"
        );
      });
      it("should update stateData if service is mongoDb", () => {
        assert.deepEqual(
          craig.icd.service.onInputChange({
            service: "databases-for-mongodb",
          }),
          "databases-for-mongodb",
          "it should set data"
        );
      });
    });
    describe("plan", () => {
      it("should return empty string onRender when no plan", () => {
        assert.deepEqual(
          craig.icd.plan.onRender({}),
          "",
          "it should be empty string"
        );
      });
      it("should return string onRender when plan", () => {
        assert.deepEqual(
          craig.icd.plan.onRender({ plan: "standard" }),
          "Standard",
          "it should be return string"
        );
      });
      it("should return string on input change", () => {
        assert.deepEqual(
          craig.icd.plan.onInputChange({
            plan: "Enterprise",
          }),
          "enterprise",
          "it should return string"
        );
      });
      it("should return correct groups when mongodb", () => {
        craig.icd.create({
          cpu: null,
          disk: null,
          group_id: "member",
          memory: null,
          name: "test",
          plan: "standard",
          resource_group: "service-rg",
          service: "databases-for-mongodb",
          use_data: false,
          encryption_key: null,
        });
        assert.deepEqual(
          craig.icd.plan.groups(
            { service: "databases-for-mongodb" },
            { craig: craig }
          ),
          ["Standard", "Enterprise"],
          "it should return correct group for plan"
        );
      });
      it("should return correct groups when not mongodb", () => {
        craig.icd.create({
          cpu: null,
          disk: null,
          group_id: "member",
          memory: null,
          name: "test",
          plan: "standard",
          resource_group: "service-rg",
          service: "databases-for-postgresql",
          use_data: false,
          encryption_key: null,
        });
        assert.deepEqual(
          craig.icd.plan.groups(
            { service: "databases-for-postgresql" },
            { craig: craig }
          ),
          ["Standard"],
          "it should return correct group for plan"
        );
      });
      it("should be disabled when not mongodb", () => {
        craig.icd.create({
          cpu: null,
          disk: null,
          group_id: "member",
          memory: null,
          name: "test",
          plan: "standard",
          resource_group: "service-rg",
          service: "databases-for-postgresql",
          use_data: false,
          encryption_key: null,
        });
        assert.deepEqual(
          craig.icd.plan.disabled(
            { service: "databases-for-postgresql" },
            { craig: craig }
          ),
          true,
          "it should be disabled"
        );
      });
    });
    describe("group_id", () => {
      it("should return empty string onRender when no group_id", () => {
        assert.deepEqual(
          craig.icd.group_id.onRender({}),
          "",
          "it should be empty string"
        );
      });
      it("should return string onRender when group_id", () => {
        assert.deepEqual(
          craig.icd.group_id.onRender({ group_id: "analytics" }),
          "Analytics",
          "it should be return string"
        );
      });
      it("should return string on input change", () => {
        assert.deepEqual(
          craig.icd.group_id.onInputChange({
            group_id: "Analytics",
          }),
          "analytics",
          "it should return string"
        );
      });
      it("should return correct groups when mongodb", () => {
        craig.icd.create({
          cpu: null,
          disk: null,
          group_id: "member",
          memory: null,
          name: "test",
          plan: "standard",
          resource_group: "service-rg",
          service: "databases-for-mongodb",
          use_data: false,
          encryption_key: null,
        });
        assert.deepEqual(
          craig.icd.group_id.groups(
            { service: "databases-for-mongodb" },
            { craig: craig }
          ),
          ["Member", "Analytics", "Bi Connector"],
          "it should return correct group for plan"
        );
      });
      it("should return correct groups when not mongodb", () => {
        craig.icd.create({
          cpu: null,
          disk: null,
          group_id: "member",
          memory: null,
          name: "test",
          plan: "standard",
          resource_group: "service-rg",
          service: "databases-for-postgresql",
          use_data: false,
          encryption_key: null,
        });
        assert.deepEqual(
          craig.icd.group_id.groups(
            { service: "databases-for-postgresql" },
            { craig: craig }
          ),
          ["Member"],
          "it should return correct group for plan"
        );
      });
      it("should be disabled when not mongodb", () => {
        craig.icd.create({
          cpu: null,
          disk: null,
          group_id: "member",
          memory: null,
          name: "test",
          plan: "standard",
          resource_group: "service-rg",
          service: "databases-for-postgresql",
          use_data: false,
          encryption_key: null,
        });
        assert.deepEqual(
          craig.icd.group_id.disabled(
            { service: "databases-for-postgresql" },
            { craig: craig }
          ),
          true,
          "it should be disabled"
        );
      });
    });
    describe("memory", () => {
      it("should return invalid for non-number memory values", () => {
        assert.isTrue(
          craig.icd.memory.invalid(
            { memory: "hello" },
            {
              memoryMin: 1,
              memoryMax: 112,
            }
          ),
          "it should return true"
        );
      });
      it("should return invalidText for memory", () => {
        assert.deepEqual(
          craig.icd.memory.invalidText(
            {},
            {
              memoryMin: 1,
              memoryMax: 112,
            }
          ),
          "RAM must be a whole number with minimum of 1GB and a maximum 112GB per member",
          "it should return correct invalidText"
        );
      });
    });
    describe("disk", () => {
      it("should return invalidText for disk", () => {
        assert.deepEqual(
          craig.icd.disk.invalidText(
            {},
            {
              diskMin: 5,
              diskMax: 4096,
            }
          ),
          "Disk must be a whole number with minimum of 5GB and a maximum 4096GB per member",
          "it should return correct invalidText"
        );
      });
    });
    describe("encryption_key", () => {
      it("should return correct groups for encryption_key", () => {
        assert.deepEqual(
          craig.icd.encryption_key.groups({}, { craig: craig }),
          ["key", "atracker-key", "vsi-volume-key", "roks-key"],
          "it should return correct groups for encryption_key"
        );
      });
    });
  });
});
