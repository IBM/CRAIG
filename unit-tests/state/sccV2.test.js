const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

/**
 * initialize slz with store update callback
 * @returns {slzStore} slz state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("scc_v2", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("scc_v2.save", () => {
    it("should update on save", () => {
      craig.scc_v2.save({
        region: "us-south",
      });
      assert.deepEqual(
        craig.store.json.scc_v2,
        {
          account_id: "${var.account_id}",
          enable: false,
          profile_attachments: [],
          region: "us-south",
          resource_group: null,
        },
        "it should save"
      );
    });
    it("should update on save when enabled", () => {
      craig.scc_v2.save({
        enable: false,
        region: "us-south",
      });
      craig.scc_v2.save({
        enable: true,
        region: "eu-de",
      });
      assert.deepEqual(
        craig.store.json.scc_v2,
        {
          account_id: "${var.account_id}",
          enable: true,
          profile_attachments: [],
          region: "eu-de",
          resource_group: null,
        },
        "it should save"
      );
    });
  });
  describe("scc_v2.delete", () => {
    it("should update", () => {
      let state = new newState();
      state.scc_v2.delete();
      let expectedData = {
        account_id: "${var.account_id}",
        profile_attachments: [],
        region: "",
        resource_group: null,
        enable: false,
      };
      assert.deepEqual(
        state.store.json.scc_v2,
        expectedData,
        "it should update values"
      );
    });
  });
  describe("scc_v2.schema", () => {
    it("should return correct groups for cos", () => {
      assert.deepEqual(
        craig.scc_v2.cos.groups({}, { craig: craig }),
        ["atracker-cos", "cos"],
        "it should return correct data"
      );
    });
    it("should have correct invalid for cos", () => {
      assert.isFalse(
        craig.scc_v2.cos.invalid({}, { craig: craig }),
        "it should be valid"
      );
      assert.isTrue(
        craig.scc_v2.cos.invalid({ use_cos: true }, { craig: craig }),
        "it should be valid"
      );
    });
    it("should return correct groups for buckets", () => {
      assert.deepEqual(
        craig.scc_v2.bucket.groups({}, { craig: craig }),
        [],
        "it should return correct data"
      );
      assert.deepEqual(
        craig.scc_v2.bucket.groups(
          {
            use_cos: true,
            cos: "atracker-cos",
          },
          { craig: craig }
        ),
        ["atracker-bucket"],
        "it should return correct data"
      );
    });
    it("should have correct invalid for bucket", () => {
      assert.isFalse(
        craig.scc_v2.bucket.invalid({}, { craig: craig }),
        "it should be valid"
      );
      assert.isTrue(
        craig.scc_v2.bucket.invalid({ use_cos: true }, { craig: craig }),
        "it should be valid"
      );
    });
    it("should have correct invalid text for bucket", () => {
      assert.deepEqual(
        craig.scc_v2.bucket.invalidText({}, { craig: craig }),
        "Select an Object Storage instance",
        "it should have correct invalid text"
      );
      assert.deepEqual(
        craig.scc_v2.bucket.invalidText({ cos: "frog" }, { craig: craig }),
        "Select a storage bucket",
        "it should have correct invalid text"
      );
    });
    it("should return correct name on render", () => {
      assert.deepEqual(
        craig.scc_v2.name.onRender(),
        "scc",
        "it should return correct text"
      );
    });
    it("should return correct name helper text", () => {
      assert.deepEqual(
        craig.scc_v2.name.helperText({}, { craig: craig }),
        "iac-scc",
        "it should return correct text"
      );
    });
  });
  describe("scc_v2.profile_attachments", () => {
    beforeEach(() => {
      craig.scc_v2.save({
        enable: true,
        region: "eu-de",
      });
    });
    it("should create a profile attachment", () => {
      craig.scc_v2.profile_attachments.create({
        name: "frog",
        profile: "FS Cloud",
      });
      assert.deepEqual(
        craig.store.json.scc_v2.profile_attachments,
        [
          {
            name: "frog",
            profile: "FS Cloud",
          },
        ],
        "it should create an attachment"
      );
    });
    it("should save a profile attachment", () => {
      craig.scc_v2.profile_attachments.create({
        name: "frog",
        profile: "FS Cloud",
      });
      craig.scc_v2.profile_attachments.save(
        {
          name: "frog2",
          profile: "FS Cloud",
        },
        {
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.scc_v2.profile_attachments,
        [
          {
            name: "frog2",
            profile: "FS Cloud",
          },
        ],
        "it should create an attachment"
      );
    });
    it("should delete a profile attachment", () => {
      craig.scc_v2.profile_attachments.create({
        name: "frog",
        profile: "FS Cloud",
      });
      craig.scc_v2.profile_attachments.delete(
        {},
        {
          data: {
            name: "frog",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.scc_v2.profile_attachments,
        [],
        "it should create an attachment"
      );
    });
    describe("scc_v2.profile_attachments.schema", () => {
      it("should be invalid when has a duplicate name", () => {
        craig.scc_v2.profile_attachments.create({
          name: "frog",
          profile: "FS Cloud",
        });
        assert.isTrue(
          craig.scc_v2.profile_attachments.name.invalid(
            { name: "frog" },
            { craig: craig }
          ),
          "it should be disabled"
        );
      });
      it("should render schedule correctly", () => {
        assert.deepEqual(
          craig.scc_v2.profile_attachments.schedule.onRender({
            schedule: "every_30_days",
          }),
          "Every 30 Days",
          "it should render schedule"
        );
      });
      it("should set schedule input change correctly", () => {
        assert.deepEqual(
          craig.scc_v2.profile_attachments.schedule.onInputChange({
            schedule: "Every 30 Days",
          }),
          "every_30_days",
          "it should render schedule"
        );
      });
      it("should disable save when invalid name", () => {
        assert.isTrue(
          disableSave("profile_attachments", { name: "@@@" }, { craig: craig }),
          "it should be disabled"
        );
      });
    });
  });
});
