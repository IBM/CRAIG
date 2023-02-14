const { assert } = require("chai");
const {
  formatAtrackerTarget,
  formatAtrackerRoute,
  atrackerTf,
} = require("../../lib/json-to-iac/atracker");

describe("atracker", () => {
  describe("formatAtrackerTarget", () => {
    it("should format a target", () => {
      let actualData = formatAtrackerTarget({
        atracker: {
          name: "atracker",
          type: "cos",
          target_name: "cos",
          bucket: "atracker",
          cos_key: "atracker-cos-key",
        },
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
      });
      let expectedData = `
resource "ibm_atracker_target" "atracker_cos_target" {
  name        = "iac-atracker-cos"
  target_type = "cloud_object_storage"
  region      = "us-south"

  cos_endpoint {
    endpoint   = "s3.private.us-south.cloud-object-storage.appdomain.cloud"
    target_crn = ibm_resource_instance.cos_object_storage.id
    bucket     = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    api_key    = ibm_resource_key.cos_object_storage_key_atracker_cos_key.credentials.apikey
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAtrackerRoute", () => {
    it("should format a route", () => {
      let actualData = formatAtrackerRoute({
        atracker: {
          enabled: false,
          name: "atracker",
          type: "cos",
          target_name: "cos",
          bucket: "atracker",
          cos_key: "atracker-cos-key",
          add_route: true,
          locations: ["us-south", "global"],
        },
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
      });
      let expectedData = `
resource "ibm_atracker_route" "atracker_cos_route" {
  name = "iac-atracker-cos-route"

  rules {
    target_ids = [ibm_atracker_target.atracker_cos_target.id]
    locations  = ["us-south","global"]
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("atrackerTf", () => {
    it("should create the correct terraform for atracker", () => {
      let actualData = atrackerTf({
        atracker: {
          enabled: false,
          name: "atracker",
          type: "cos",
          target_name: "cos",
          bucket: "atracker",
          cos_key: "atracker-cos-key",
          add_route: true,
          locations: ["us-south", "global"],
        },
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
      });
      let expectedData = `##############################################################################
# Atracker Resources
##############################################################################

resource "ibm_atracker_target" "atracker_cos_target" {
  name        = "iac-atracker-cos"
  target_type = "cloud_object_storage"
  region      = "us-south"

  cos_endpoint {
    endpoint   = "s3.private.us-south.cloud-object-storage.appdomain.cloud"
    target_crn = ibm_resource_instance.cos_object_storage.id
    bucket     = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    api_key    = ibm_resource_key.cos_object_storage_key_atracker_cos_key.credentials.apikey
  }
}

resource "ibm_atracker_route" "atracker_cos_route" {
  name = "iac-atracker-cos-route"

  rules {
    target_ids = [ibm_atracker_target.atracker_cos_target.id]
    locations  = ["us-south","global"]
  }
}

##############################################################################`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create the correct terraform for  with no route", () => {
      let actualData = atrackerTf({
        atracker: {
          enabled: false,
          name: "atracker",
          type: "cos",
          target_name: "cos",
          bucket: "atracker",
          cos_key: "atracker-cos-key",
          add_route: false,
          locations: ["us-south", "global"],
        },
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
      });
      let expectedData = `##############################################################################
# Atracker Resources
##############################################################################

resource "ibm_atracker_target" "atracker_cos_target" {
  name        = "iac-atracker-cos"
  target_type = "cloud_object_storage"
  region      = "us-south"

  cos_endpoint {
    endpoint   = "s3.private.us-south.cloud-object-storage.appdomain.cloud"
    target_crn = ibm_resource_instance.cos_object_storage.id
    bucket     = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    api_key    = ibm_resource_key.cos_object_storage_key_atracker_cos_key.credentials.apikey
  }
}

##############################################################################`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
