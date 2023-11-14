const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("iam account settings", () => {
  it("should return true if iam_account_settings mfa invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        { mfa: null },
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if iam_account_settings restrict_create_platform_apikey invalid", () => {
    assert.isTrue(
      disableSave(
        "iam_account_settings",
        { mfa: "1", restrict_create_platform_apikey: null },
        { rules: [], data: { name: "" }, isModal: true }
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
        { rules: [], data: { name: "" }, isModal: true }
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
        { rules: [], data: { name: "" }, isModal: true }
      )
    );
  });
  it("should return true if iam account settings page has bad mfa field", () => {
    assert.isTrue(
      disableSave("iam_account_settings", {
        mfa: null,
        allowed_ip_addresses: "1.1.1.1",
        max_sessions_per_identity: 1,
        restrict_create_service_id: "NOT_SET",
        restrict_create_platform_apikey: "NOT_SET",
      })
    );
  });
  it("should return true if iam account settings page has bad allowed_ip_addresses field", () => {
    assert.isTrue(
      disableSave("iam_account_settings", {
        mfa: "NONE",
        allowed_ip_addresses: "1.1.1.-sda,1.1.1.1",
        max_sessions_per_identity: 1,
        restrict_create_service_id: "NOT_SET",
        restrict_create_platform_apikey: "NOT_SET",
      })
    );
  });
  it("should return true if iam account settings page has bad max_sessions_per_identity field", () => {
    assert.isTrue(
      disableSave("iam_account_settings", {
        mfa: "NONE",
        allowed_ip_addresses: "1.1.1.1",
        max_sessions_per_identity: null,
        restrict_create_service_id: "NOT_SET",
        restrict_create_platform_apikey: "NOT_SET",
      })
    );
  });
  it("should return true if iam account settings page has bad restrict_create_service_id field", () => {
    assert.isTrue(
      disableSave("iam_account_settings", {
        mfa: "NONE",
        allowed_ip_addresses: "1.1.1.1",
        max_sessions_per_identity: 1,
        restrict_create_service_id: null,
        restrict_create_platform_apikey: "NOT_SET",
      })
    );
  });
  it("should return true if iam account settings form has bad restrict_create_platform_apikey field", () => {
    assert.isTrue(
      disableSave("iam_account_settings", {
        mfa: "NONE",
        allowed_ip_addresses: "1.1.1.1",
        max_sessions_per_identity: 1,
        restrict_create_service_id: "NOT_SET",
        restrict_create_platform_apikey: null,
      })
    );
  });
});
