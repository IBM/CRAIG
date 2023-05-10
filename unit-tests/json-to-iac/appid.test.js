const { assert } = require("chai");
const {
  formatAppIdKey,
  formatAppId,
  formatAppIdRedirectUrls,
  appidTf,
} = require("../../client/src/lib/json-to-iac/appid.js");

describe("appid", () => {
  describe("formatAppIdKey", () => {
    it("should format appid key", () => {
      let actualData = formatAppIdKey(
        {
          appid: "test-appid",
          name: "test-key",
        },
        {
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
          },
          appid: [
            {
              name: "test-appid",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_key" "test_appid_key_test_key" {
  name                 = "iac-test-appid-test-key"
  resource_instance_id = ibm_resource_instance.test_appid.id
  role                 = "Writer"
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format appid key with instance from data", () => {
      let actualData = formatAppIdKey(
        {
          appid: "test-appid",
          name: "test-key",
        },
        {
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
          },
          appid: [
            {
              name: "test-appid",
              use_data: true,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_key" "test_appid_key_test_key" {
  name                 = "iac-test-appid-test-key"
  resource_instance_id = data.ibm_resource_instance.test_appid.id
  role                 = "Writer"
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAppId", () => {
    it("should format appid", () => {
      let actualData = formatAppId(
        {
          name: "test-appid",
          use_data: false,
          resource_group: "slz-service-rg",
        },
        {
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
            region: "us-south",
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_resource_instance" "test_appid" {
  name              = "iac-test-appid"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "appid"
  plan              = "graduated-tier"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format appid from data", () => {
      let actualData = formatAppId(
        {
          name: "test-appid",
          use_data: true,
          resource_group: "slz-service-rg",
        },
        {
          _options: {
            prefix: "iac",
            tags: ["hello", "world"],
            region: "us-south",
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `
data "ibm_resource_instance" "test_appid" {
  name              = "test-appid"
  resource_group_id = ibm_resource_group.slz_service_rg.id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAppIdRedirectUrls", () => {
    it("should format appid urls", () => {
      let actualData = formatAppIdRedirectUrls(
        {
          name: "test-appid",
          use_data: false,
          resource_group: "slz-service-rg",
        },
        ["test.com", "test2.com", "test3.com"]
      );
      let expectedData = `
resource "ibm_appid_redirect_urls" "test_appid_urls" {
  tenant_id = ibm_resource_instance.test_appid.guid
  urls = [
    "test.com",
    "test2.com",
    "test3.com"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format appid urls with data instance", () => {
      let actualData = formatAppIdRedirectUrls(
        {
          name: "test-appid",
          use_data: true,
          resource_group: "slz-service-rg",
        },
        ["test.com", "test2.com", "test3.com"]
      );
      let expectedData = `
resource "ibm_appid_redirect_urls" "test_appid_urls" {
  tenant_id = data.ibm_resource_instance.test_appid.guid
  urls = [
    "test.com",
    "test2.com",
    "test3.com"
  ]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("appidTf", () => {
    it("should create appid terraform", () => {
      let actualData = appidTf({
        _options: {
          prefix: "iac",
          tags: ["hello", "world"],
          region: "us-south",
        },
        appid: [
          {
            name: "test-appid",
            use_data: false,
            resource_group: "slz-service-rg",
            keys: [
              {
                appid: "test-appid",
                name: "test-key",
              },
              {
                appid: "test-appid",
                name: "test-key-2",
              },
            ],
          },
        ],
        resource_groups: [
          {
            use_prefix: false,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-workload-rg",
            use_data: false,
          },
        ],
      });
      let expectedData = `##############################################################################
# Test Appid Resources
##############################################################################

resource "ibm_resource_instance" "test_appid" {
  name              = "iac-test-appid"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "appid"
  plan              = "graduated-tier"
  location          = var.region
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_key" "test_appid_key_test_key" {
  name                 = "iac-test-appid-test-key"
  resource_instance_id = ibm_resource_instance.test_appid.id
  role                 = "Writer"
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_resource_key" "test_appid_key_test_key_2" {
  name                 = "iac-test-appid-test-key-2"
  resource_instance_id = ibm_resource_instance.test_appid.id
  role                 = "Writer"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
