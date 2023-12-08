const { assert } = require("chai");
const { disableSave, state } = require("../../../client/src/lib");
const craig = state();

describe("iam account settings", () => {
  it("should return true if iam_account_settings mfa invalid", () => {
    assert.isTrue(
      disableSave("iam_account_settings", { mfa: null }, { craig: craig })
    );
  });
  it("should return true if iam_account_settings restrict_create_platform_apikey invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        { mfa: "1", restrict_create_platform_apikey: null },
        { craig: craig }
      )
    );
  });
  it("should return true if iam_account_settings restrict_create_service_id invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "1",
          restrict_create_platform_apikey: "null",
          restrict_create_service_id: null,
        },
        { craig: craig }
      )
    );
  });
  it("should return true if iam_account_settings max_sessions_per_identity invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "1",
          restrict_create_platform_apikey: "null",
          restrict_create_service_id: "null",
          max_sessions_per_identity: null,
        },
        { craig: craig }
      )
    );
  });
  it("should return true if iam account settings page has bad mfa field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: null,
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if iam account settings page has bad allowed_ip_addresses field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.-sda,1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if iam account settings page has bad max_sessions_per_identity field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: null,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
        },
        {
          craig: craig,
        }
      )
    );
  });

  it("should return true if iam account settings page has bad restrict_create_service_id field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: null,
          restrict_create_platform_apikey: "NOT_SET",
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if iam account settings form has bad restrict_create_platform_apikey field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 1,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: null,
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if iam account settings page has bad session_expiration_in_seconds field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 3,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
          session_expiration_in_seconds: 5,
        },
        {
          craig: craig,
        }
      )
    );
  });
  it("should return true if iam account settings page has bad session_invalidation_in_seconds field", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1",
          max_sessions_per_identity: 3,
          restrict_create_service_id: "NOT_SET",
          restrict_create_platform_apikey: "NOT_SET",
          session_expiration_in_seconds: 900,
          session_invalidation_in_seconds: 5,
        },
        {
          craig: craig,
        }
      )
    );
  });
  describe("invalidText", () => {
    it("should return invalid text for allowed_ip_addresses", () => {
      assert.deepEqual(
        craig.iam_account_settings.allowed_ip_addresses.invalidText(),
        "Enter a comma separated list of IP addresses or CIDR blocks",
        "it should return text"
      );
    });
    it("should return invalid text for max_sessions_per_identity", () => {
      assert.deepEqual(
        craig.iam_account_settings.max_sessions_per_identity.invalidText(),
        "Value must be in range [1-10]",
        "it should return text"
      );
    });
    it("should return invalid text for restrict_create_service_id", () => {
      assert.deepEqual(
        craig.iam_account_settings.restrict_create_service_id.invalidText(),
        "Invalid",
        "it should return text"
      );
    });
    it("should return invalid text for restrict_create_platform_apikey", () => {
      assert.deepEqual(
        craig.iam_account_settings.restrict_create_platform_apikey.invalidText(),
        "Invalid",
        "it should return text"
      );
    });
    it("should return invalid text for session_expiration_in_seconds", () => {
      assert.deepEqual(
        craig.iam_account_settings.session_expiration_in_seconds.invalidText(),
        "Must be a whole number between 900 and 86400",
        "it should return text"
      );
    });
    it("should return invalid text for session_invalidation_in_seconds", () => {
      assert.deepEqual(
        craig.iam_account_settings.session_invalidation_in_seconds.invalidText(),
        "Must be a whole number between 900 and 86400",
        "it should return text"
      );
    });
  });
});
