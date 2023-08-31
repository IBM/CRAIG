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
  describe("logdna", () => {
    describe("logdna.init", () => {
      it("should initialize logdna", () => {
        let state = newState();
        assert.deepEqual(
          state.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: "atracker-cos",
            bucket: "atracker-bucket",
          },
          "it should set defaults"
        );
      });
    });
    describe("logdna.onStoreUpdate", () => {
      it("should reset cos, bucket, and rg when unfound", () => {
        let state = newState();
        state.store.json.logdna = {
          enabled: false,
          plan: "",
          endpoints: "",
          platform_logs: false,
          resource_group: "aaa",
          cos: "aaa",
          bucket: "aaa",
        };
        state.update();
        assert.deepEqual(
          state.store.json.logdna,
          {
            enabled: false,
            plan: "",
            endpoints: "",
            platform_logs: false,
            resource_group: null,
            cos: null,
            bucket: null,
          },
          "it should set defaults"
        );
      });
      it("should reset bucket when unfound", () => {
        let state = newState();
        state.store.json.logdna = {
          enabled: false,
          plan: "",
          endpoints: "",
          platform_logs: false,
          resource_group: "aaa",
          cos: "cos",
          bucket: "aaa",
        };
        state.update();
        assert.deepEqual(
          state.store.json.logdna,
          {
            enabled: false,
            plan: "",
            endpoints: "",
            platform_logs: false,
            resource_group: null,
            cos: "cos",
            bucket: null,
          },
          "it should set defaults"
        );
      });
    });
    describe("logdna.save", () => {
      it("should update logdna on save", () => {
        let state = newState();
        state.logdna.save({
          name: "aaa",
        });
        assert.deepEqual(
          state.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: null,
            bucket: null,
            name: "aaa",
          },
          "it should set defaults"
        );
      });
    });
  });
  describe("sysdig", () => {
    describe("sysdig.init", () => {
      it("should initialize logdna", () => {
        let state = newState();
        assert.deepEqual(
          state.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
          },
          "it should set defaults"
        );
      });
    });
    describe("sysdig.onStoreUpdate", () => {
      it("should reset cos, bucket, and rg when unfound", () => {
        let state = newState();
        state.store.json.sysdig = {
          enabled: false,
          plan: "",
          resource_group: "aaa",
        };
        state.update();
        assert.deepEqual(
          state.store.json.sysdig,
          {
            enabled: false,
            plan: "",
            resource_group: null,
          },
          "it should set defaults"
        );
      });
    });
    describe("sysdig.save", () => {
      it("should update sysdig on save", () => {
        let state = newState();
        state.sysdig.save({
          name: "aaa",
        });
        assert.deepEqual(
          state.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
            name: "aaa",
          },
          "it should set defaults"
        );
      });
    });
  });
});
