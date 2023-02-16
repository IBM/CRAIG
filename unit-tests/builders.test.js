const { assert } = require("chai");
const { buildNewEncryptionKey } = require("../client/src/lib/builders");

describe("builders", () => {
  describe("buildNewEncryptionKey", () => {
    it("should build an encryption key with interval month", () => {
      let actualData = buildNewEncryptionKey({ rotation: 3 });
      let expectedData = {
        name: `new-key`,
        root_key: true,
        payload: null,
        key_ring: null,
        force_delete: null,
        endpoint: null,
        iv_value: null,
        encrypted_nonce: null,
        rotation: 3,
        dual_auth_delete: false,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should change interval month"
      );
    });
    it("should build an encryption key with defaults", () => {
      let actualData = buildNewEncryptionKey({});
      let expectedData = {
        name: `new-key`,
        root_key: true,
        payload: null,
        key_ring: null,
        force_delete: null,
        endpoint: null,
        iv_value: null,
        encrypted_nonce: null,
        rotation: 12,
        dual_auth_delete: false,
      };
      assert.deepEqual(actualData, expectedData, "it should be default key");
    });
  });
});
