const { assert } = require("chai");
const { buildNewEncryptionKey } = require("../client/src/lib/builders");

describe("builders", () => {
  describe("buildNewEncryptionKey", () => {
    it("should build an encryption key with rotation", () => {
      let actualData = buildNewEncryptionKey({ rotation: 3 });
      let expectedData = {
        name: `new-key`,
        root_key: true,
        key_ring: null,
        force_delete: null,
        endpoint: null,
        rotation: 3,
        dual_auth_delete: false,
      };
      assert.deepEqual(actualData, expectedData, "it should change rotation ");
    });
    it("should build an encryption key with defaults", () => {
      let actualData = buildNewEncryptionKey({});
      let expectedData = {
        name: `new-key`,
        root_key: true,
        key_ring: null,
        force_delete: null,
        endpoint: null,
        rotation: 12,
        dual_auth_delete: false,
      };
      assert.deepEqual(actualData, expectedData, "it should be default key");
    });
  });
});
