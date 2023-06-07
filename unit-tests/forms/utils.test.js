const { assert } = require("chai");
const { notificationText } = require("../../client/src/lib/forms");

describe("notificationText", () => {
  it('should remove "/form/" from path', () => {
    const result = notificationText("/form/resourceGroups");
    assert.strictEqual(result.includes("/form/"), false);
  });

  it("should convert the path to title case", () => {
    const result = notificationText("/form/example");
    assert.strictEqual(result, "Example");
  });

  it('should replace "I D" with "ID"', () => {
    const result = notificationText("/form/appID");
    assert.strictEqual(result, "App ID");
  });

  it('should replace "Vpcs" with "VPCs"', () => {
    const result = notificationText("/form/vpcs");
    assert.strictEqual(result, "VPCs");
  });

  it('should replace "Nacls" with "Network ACLs"', () => {
    const result = notificationText("/form/nacls");
    assert.strictEqual(result, "Network ACLs");
  });

  it('should replace "Vpe" with "Virtual Private Endpoints"', () => {
    const result = notificationText("/form/vpe");
    assert.strictEqual(result, "Virtual Private Endpoints");
  });

  it('should replace "Vpn" with "VPN"', () => {
    const result = notificationText("/form/vpn");
    assert.strictEqual(result, "VPN");
  });

  it('should replace "Ssh" with "SSH"', () => {
    const result = notificationText("/form/ssh");
    assert.strictEqual(result, "SSH");
  });

  it('should replace "Lb" with "Load Balancers"', () => {
    const result = notificationText("/form/lb");
    assert.strictEqual(result, "Load Balancers");
  });

  it('should replace "Dns" with "DNS"', () => {
    const result = notificationText("/form/dns");
    assert.strictEqual(result, "DNS");
  });

  it('should replace "F 5" with "F5"', () => {
    const result = notificationText("/form/f5");
    assert.strictEqual(result, "F5");
  });

  it('should replace "Iam" with "IAM"', () => {
    const result = notificationText("/form/iamAccountSettings");
    assert.strictEqual(result, "IAM Account Settings");
  });

  it('should replace "Cbr" with "Context Based Restrictions"', () => {
    const result = notificationText("/form/cbr");
    assert.strictEqual(result, "Context Based Restrictions");
  });
});
