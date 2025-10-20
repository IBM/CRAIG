const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize slz with store update callback
 * @returns {slzStore} slz state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("observability", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("logdna", () => {
    describe("logdna.init", () => {
      it("should initialize logdna", () => {
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: "atracker-cos",
            bucket: "atracker-bucket",
          },
          "it should set defaults",
        );
      });
    });
    describe("logdna.onStoreUpdate", () => {
      it("should reset cos, bucket, and rg when unfound", () => {
        craig.store.json.logdna = {
          enabled: false,
          plan: "",
          endpoints: "",
          platform_logs: false,
          resource_group: "aaa",
          cos: "aaa",
          bucket: "aaa",
        };
        craig.update();
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "",
            endpoints: "",
            platform_logs: false,
            resource_group: null,
            cos: null,
            bucket: null,
            secrets_manager: null,
          },
          "it should set defaults",
        );
      });
    });
    describe("logdna.save", () => {
      it("should update logdna on save", () => {
        craig.logdna.save({
          name: "aaa",
        });
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: null,
            bucket: null,
            name: "aaa",
            secrets_manager: null,
          },
          "it should set defaults",
        );
      });
      it("should update logdna on save with found bucket", () => {
        craig.secrets_manager.create({ name: "frog" });
        craig.sysdig.save({ secrets_manager: "frog" });
        craig.logdna.save({
          name: "aaa",
          bucket: "management-bucket",
        });
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: "cos",
            bucket: "management-bucket",
            name: "aaa",
            secrets_manager: "frog",
          },
          "it should set defaults",
        );
      });
    });
  });
  describe("sysdig", () => {
    describe("sysdig.init", () => {
      it("should initialize logdna", () => {
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
          },
          "it should set defaults",
        );
      });
    });
    describe("sysdig.onStoreUpdate", () => {
      it("should reset cos, bucket, and rg when unfound", () => {
        craig.store.json.sysdig = {
          enabled: false,
          plan: "",
          resource_group: "aaa",
        };
        craig.update();
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "",
            resource_group: null,
            secrets_manager: null,
          },
          "it should set defaults",
        );
      });
    });
    describe("sysdig.save", () => {
      it("should update sysdig on save", () => {
        craig.sysdig.save({
          name: "aaa",
        });
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
            name: "aaa",
            secrets_manager: null,
          },
          "it should set defaults",
        );
      });
      it("should update sysdig on save with logdna secrets manager", () => {
        craig.secrets_manager.create({
          name: "aaa",
        });
        craig.logdna.save({
          secrets_manager: "aaa",
        });
        craig.sysdig.save({
          name: "aaa",
        });
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
            name: "aaa",
            secrets_manager: "aaa",
          },
          "it should set defaults",
        );
      });
    });
  });
  describe("schema", () => {
    describe("logdna & sysdig", () => {
      it("should return helper text for name", () => {
        assert.deepEqual(
          craig.logdna.name.helperText({}, { craig: craig }),
          "iac-logdna",
          "it should return",
        );
      });
      it("should hide store secrets when no secrets manager", () => {
        assert.isTrue(
          craig.logdna.store_secrets.hideWhen({}, { craig: craig }),
          "it should be hidden",
        );
        assert.isTrue(
          craig.sysdig.store_secrets.hideWhen({}, { craig: craig }),
          "it should be hidden",
        );
      });
      it("should return correct secrets manager groups", () => {
        assert.deepEqual(
          craig.logdna.secrets_manager.groups({}, { craig: craig }),
          [],
          "it should return list of secrets manager",
        );
      });
      it("should return correct text when no secrets manager selected", () => {
        assert.deepEqual(
          craig.logdna.secrets_manager.invalidText({}, { craig: craig }),
          "No secrets manager instances",
          "it should return list of secrets nabager",
        );
        craig.secrets_manager.create({ name: "frog" });
        assert.deepEqual(
          craig.logdna.secrets_manager.invalidText({}, { craig: craig }),
          "Select a secrets manager",
          "it should return list of secrets nabager",
        );
      });
      it("should hide secrets manager when not storing secrets", () => {
        assert.isTrue(
          craig.sysdig.secrets_manager.hideWhen({}, { craig: craig }),
          "it should be hidden",
        );
      });
      it("should return list of cos buckets", () => {
        assert.deepEqual(
          craig.logdna.bucket.groups({}, { craig: craig }),
          ["atracker-bucket", "management-bucket", "workload-bucket"],
          "it should return list of buckets",
        );
      });
      it("should have valid secrets manager when store secrets is false and secrets manager is null", () => {
        assert.isFalse(
          craig.logdna.secrets_manager.invalid({}),
          "it should be valid",
        );
      });
      it("should not have valid secrets manager when store secrets is true and secrets manager is null", () => {
        assert.isTrue(
          craig.logdna.secrets_manager.invalid({ store_secrets: true }),
          "it should not be valid",
        );
      });
      it("should return helper text for name", () => {
        assert.deepEqual(
          craig.sysdig.name.helperText({}, { craig: craig }),
          "iac-sysdig",
          "it should return",
        );
      });
      it("should return plan on render", () => {
        assert.deepEqual(
          craig.logdna.plan.onRender({ plan: "30-day" }),
          "30 Day",
          "it should return correct text",
        );
      });
      it("should return false when not enabled for resource group invalid", () => {
        assert.isFalse(
          craig.logdna.resource_group.invalid({ enabled: false }),
          "it should be false",
        );
        assert.isFalse(
          craig.sysdig.resource_group.invalid({ enabled: false }),
          "it should be false",
        );
      });
    });
  });
});
