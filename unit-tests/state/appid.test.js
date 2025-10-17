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

describe("appid", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("appid.init", () => {
    it("should initialize appid", () => {
      let expectedData = [];
      assert.deepEqual(
        craig.store.json.appid,
        expectedData,
        "it should have appid initialized",
      );
    });
  });
  describe("appid crud functions", () => {
    beforeEach(() => {
      craig.appid.create({
        name: "default",
        kms: "kms",
        encryption_key: "key",
      });
    });
    describe("appid on store update", () => {
      it("should add keys to object when unfound", () => {
        assert.deepEqual(
          craig.store.json.appid,
          [
            {
              name: "default",
              kms: "kms",
              encryption_key: "key",
              keys: [],
              resource_group: null,
            },
          ],
          "it should set keys",
        );
      });
      it("should set encryption key to null when deleted", () => {
        craig.key_management.keys.delete(
          {},
          {
            arrayParentName: "kms",
            data: { name: "key" },
            isTeleport: false,
          },
        );
        assert.deepEqual(
          craig.store.json.appid[0].encryption_key,
          null,
          "it should be null",
        );
      });
      it("should set encryption key and kms to null when kms deleted", () => {
        craig.key_management.delete(
          {},
          {
            data: { name: "kms" },
            isTeleport: false,
          },
        );
        assert.deepEqual(
          craig.store.json.appid[0].kms,
          null,
          "it should be null",
        );
        assert.deepEqual(
          craig.store.json.appid[0].encryption_key,
          null,
          "it should be null",
        );
      });
    });
    it("should add an appid instance", () => {
      assert.deepEqual(
        craig.store.json.appid,
        [
          {
            name: "default",
            kms: "kms",
            encryption_key: "key",
            keys: [],
            resource_group: null,
          },
        ],
        "it should create appid",
      );
    });
    it("should save an appid instance", () => {
      craig.appid.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } },
      );
      assert.deepEqual(
        craig.store.json.appid[0].resource_group,
        "service-rg",
        "it should create appid",
      );
    });
    it("should delete an appid instance", () => {
      craig.appid.delete({}, { data: { name: "default" } });
      assert.deepEqual(craig.store.json.appid, [], "it should create appid");
    });
  });
  describe("appid key crud functions", () => {
    beforeEach(() => {
      craig.appid.create({ name: "default", keys: [] });
      craig.appid.keys.create(
        {
          name: "test",
        },
        {
          innerFormProps: {
            arrayParentName: "default",
          },
        },
      );
    });
    it("should add an appid instance", () => {
      assert.deepEqual(
        craig.store.json.appid,
        [
          {
            name: "default",
            resource_group: null,
            keys: [
              {
                appid: "default",
                name: "test",
              },
            ],
          },
        ],
        "it should create appid key",
      );
    });
    it("should save an appid instance", () => {
      craig.appid.keys.save(
        { resource_group: "service-rg" },
        {
          data: { name: "test" },
          arrayParentName: "default",
        },
      );
      assert.deepEqual(
        craig.store.json.appid,
        [
          {
            name: "default",
            keys: [
              { name: "test", appid: "default", resource_group: "service-rg" },
            ],
            resource_group: null,
          },
        ],
        "it should save key",
      );
    });
    it("should delete an appid key", () => {
      craig.appid.keys.delete(
        {},
        {
          data: { name: "test" },
          arrayParentName: "default",
        },
      );
      assert.deepEqual(
        craig.store.json.appid.keys.length,
        0,
        "it should delete appid key",
      );
    });
  });
  describe("appid form functions", () => {
    describe("appid form", () => {
      describe("appid.shouldDisableSave", () => {
        it("should return true if the name is invalid", () => {
          let actualData = disableSave(
            "appid",
            {
              name: "@@@",
              resource_group: null,
            },
            {
              craig: craig,
              data: {
                name: "",
              },
            },
          );
          assert.isTrue(actualData, "it should be disabled");
        });
        it("should return false when name is valid, rg is invalid, and use data", () => {
          assert.isFalse(
            craig.appid.resource_group.invalid({
              name: "name",
              resource_group: "",
              use_data: true,
            }),
            "it should be enabled",
          );
        });
        it("should return true if name is valid and resource group is invalid", () => {
          let actualData = disableSave(
            "appid",
            {
              name: "valid",
              resource_group: null,
            },
            {
              craig: craig,
              data: {
                name: "",
              },
            },
          );
          assert.isTrue(actualData, "it should be disabled");
        });
      });
      describe("name", () => {
        it("should return true if appid has invalid name", () => {
          let actualData = craig.appid.name.invalid(
            { name: "@@@" },
            {
              craig: craig,
              data: {
                name: "",
              },
            },
          );
          assert.isTrue(actualData, "it should return true if name is invalid");
        });
        it("should return correct invalid text when appid has invalid name", () => {
          let actualData = craig.appid.name.invalidText(
            { name: "@@@" },
            {
              craig: craig,
              data: {
                name: "",
              },
            },
          );
          assert.deepEqual(
            actualData,
            "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
            "it should return correct text",
          );
        });
        it("should return true if appid has invalid duplicate name", () => {
          craig.appid.create({ name: "egg" });
          let actualData = craig.appid.name.invalid(
            { name: "egg" },
            {
              craig: craig,
              data: {
                name: "",
              },
            },
          );
          assert.isTrue(actualData, "it should return true if name is invalid");
        });
        it("should return correct text if appid has invalid duplicate name", () => {
          craig.appid.create({ name: "egg" });
          let actualData = craig.appid.name.invalidText(
            { name: "egg" },
            {
              craig: craig,
              data: {
                name: "",
              },
            },
          );
          assert.deepEqual(
            actualData,
            'Name "egg" already in use',
            "it should return correct text",
          );
        });
      });
      describe("encryption_keys", () => {
        it("should return correct groups for encryption keys", () => {
          assert.deepEqual(
            craig.appid.encryption_key.groups({}, { craig: craig }),
            ["key", "atracker-key", "vsi-volume-key", "roks-key"],
            "it should return groups",
          );
        });
      });
      describe("keys subform", () => {
        describe("name", () => {
          it("should return true if appid key has invalid name", () => {
            assert.isTrue(
              craig.appid.keys.name.invalid(
                { name: "@@@" },
                {
                  craig: craig,
                  data: {
                    name: "",
                  },
                },
              ),
              "it should return true if name is invalid",
            );
          });
          it("should return correct text if appid key has invalid name", () => {
            assert.deepEqual(
              craig.appid.keys.name.invalidText(
                { name: "@@@" },
                {
                  craig: craig,
                  data: {
                    name: "",
                  },
                },
              ),
              "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
              "it should return correct text",
            );
          });
          it("should return true if appid key has invalid duplicate name", () => {
            craig.appid.create({ name: "egg" });
            craig.appid.keys.create(
              { name: "egg" },
              {
                innerFormProps: {
                  arrayParentName: "egg",
                },
              },
            );
            assert.isTrue(
              craig.appid.keys.name.invalid(
                { name: "egg" },
                {
                  craig: craig,
                  data: {
                    name: "",
                  },
                },
              ),
              "it should return true if name is invalid",
            );
          });
          it("should return correct text if appid key has invalid duplicate name", () => {
            craig.appid.create({ name: "egg" });
            craig.appid.keys.create(
              { name: "egg" },
              {
                innerFormProps: {
                  arrayParentName: "egg",
                },
              },
            );
            assert.deepEqual(
              craig.appid.keys.name.invalidText(
                { name: "egg" },
                {
                  craig: craig,
                  data: {
                    name: "aa",
                  },
                },
              ),
              'Name "egg" already in use',
              "it should return correct text",
            );
          });
        });
      });
    });
  });
  describe("appid key function", () => {
    it("should disable save when invalid name", () => {
      assert.isTrue(
        disableSave("keys", { name: "@@@" }, { craig: craig }),
        "it should be disabled",
      );
    });
  });
});
