const { assert } = require("chai");
const {
  invalidName,
  invalidCrnList,
  invalidIpCommaList,
  isValidUrl,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidNewResourceName,
  invalidProjectDescription,
  invalidProjectName,
  invalidCbrRule,
  invalidCbrZone,
} = require("../../client/src/lib/forms");
const {
  invalidDescription,
  invalidCrns,
} = require("../../client/src/lib/forms/invalid-callbacks");

describe("invalid callbacks", () => {
  describe("invalidNewResourceName", () => {
    it("should return true if name has no value", () => {
      assert.isTrue(invalidNewResourceName(null), "it should be true");
    });
  });
  describe("cidrBlocksOverlap", () => {
    it("should return true to the overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "192.168.0.1/18";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "10.0.0.0/16";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
    it("should return true since they are the same cidr blocks", () => {
      let testCidr = "10.0.0.0/16";
      let actualResp = cidrBlocksOverlap(testCidr, testCidr);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "10.0.0.0/16";
      let testCidrB = "192.168.0.1/24";
      let actualResp = cidrBlocksOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
  });
  describe("invalidCrnList", () => {
    it("should return true when invalid crn in list", () => {
      assert.isTrue(
        invalidCrnList([
          "crn:v1:bluemix:public:abcdf",
          "mooseeeeeeeeeeeeeeeeee",
        ])
      );
    });
    it("should return false when no crns", () => {
      assert.isFalse(invalidCrnList([]));
    });
    it("should return true when null crns", () => {
      assert.isTrue(invalidCrnList([null]));
    });
    it("should return false when valid crn list", () => {
      assert.isFalse(
        invalidCrnList([
          "crn:v1:bluemix:public:abcdf",
          "crn:v1:bluemix:public:abcde",
        ])
      );
    });
  });
  describe("invalidIpCommaList", () => {
    it("should return false when invalid comma separated ip list is provided", () => {
      assert.isFalse(invalidIpCommaList("1.1.1.1/10, 2.2.2.2"));
    });
    it("should return true when valid comma separated ip list is provided", () => {
      assert.isTrue(invalidIpCommaList("1.1.1.-2,2.2.2.2,124.2/2"));
    });
    it("should return false when null is provided", () => {
      assert.isFalse(invalidIpCommaList(null));
    });
  });
  describe("isValidUrl", () => {
    it("should be true for empty or null string", () => {
      assert.isTrue(isValidUrl("") && isValidUrl(null) && isValidUrl("null"));
    });
    it("should be false for invalid url", () => {
      assert.isFalse(isValidUrl("invalid.url"));
    });
    it("should be true for valid url", () => {
      assert.isTrue(
        isValidUrl(
          "https://declarations.s3.us-east.cloud-object-storage.appdomain.cloud/do_declaration.json"
        )
      );
    });
  });
  describe("hasOverlappingCidr", () => {
    it("should return true if cidr exists already", () => {
      let craigData = require("../data-files/craig-json.json");
      let actualData = hasOverlappingCidr({
        store: {
          json: craigData,
        },
      })(
        {
          name: "test",
          cidr: "10.20.10.0/24",
        },
        {
          data: {
            name: "",
          },
        }
      );
      assert.isTrue(
        actualData.invalid,
        "it should return true when overlapping cidr"
      );
    });
    it("should return false for power cidrs", () => {
      let craigData = require("../data-files/craig-json.json");
      let actualData = hasOverlappingCidr({
        store: {
          json: craigData,
        },
      })(
        {
          name: "test",
          pi_cidr: "10.20.10.0/24",
        },
        {
          data: {
            name: "",
          },
        }
      );
      assert.isFalse(
        actualData.invalid,
        "it should return true when overlapping cidr"
      );
    });
    it("should return true if cidr does not already exist but does overlap", () => {
      let craigData = require("../data-files/craig-json.json");
      let actualData = hasOverlappingCidr({
        store: {
          json: craigData,
        },
      })(
        {
          name: "vsi-zone-1",
          cidr: "10.20.20.1/32",
        },
        {
          data: {
            name: "vsi-zone-1",
          },
        }
      );
      assert.isTrue(
        actualData.invalid,
        "it should return true when overlapping cidr"
      );
    });
  });
  describe("invalidCidr", () => {
    it("should return true if cidr is null", () => {
      assert.isTrue(
        invalidCidr({})({ cidr: null }, { data: { cidr: "1.2.3.4/5" } }),
        "it should return correct data"
      );
    });
    it("should return false if cidr is equal to props", () => {
      assert.isFalse(
        invalidCidr({})({ cidr: "1.2.3.4/5" }, { data: { cidr: "1.2.3.4/5" } }),
        "it should return correct data"
      );
    });
    it("should return true if cidr is not valid", () => {
      assert.isTrue(
        invalidCidr({})({ cidr: "aaa" }, { data: { cidr: "1.2.3.4/5" } }),
        "it should return correct data"
      );
    });
    it("should return true if cidr is too many addresses", () => {
      assert.isTrue(
        invalidCidr({})(
          { cidr: "10.0.0.0/11" },
          { data: { cidr: "1.2.3.4/5" } }
        ),
        "it should return correct data"
      );
    });
    it("should return true if cidr overlaps with existing cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.isTrue(
        invalidCidr(craig)({ cidr: "10.10.30.0/24" }, { data: {} }),
        "Warning: CIDR overlaps with 10.10.30.0/24",
        "it should return correct data"
      );
    });
    it("should return false if cidr does not overlap with existing cidr", () => {
      let craig = {
        store: {
          json: require("../data-files/craig-json.json"),
        },
      };
      assert.isFalse(
        invalidCidr(craig)({ cidr: "10.10.80.0/24" }, { data: {} }),
        "it should be true"
      );
    });
  });
  describe("invalidProjectName", () => {
    it("it should be false if name is unique", () => {
      last_save = Date.now();
      assert.isFalse(
        invalidProjectName(
          { name: "blue", description: "test description", json: {} },
          { projects: { test: { name: "test", last_save } } }
        ),
        "it should be false"
      );
    });
    it("it should be true if name is empty string", () => {
      assert.isTrue(
        invalidProjectName(
          { name: "", description: "test description", json: {} },
          { projects: { test: { name: "test", last_save } } }
        ),
        "it should be true"
      );
    });
    it("should be true if name is already in use", () => {
      last_save = Date.now();
      assert.isTrue(
        invalidProjectName(
          { name: "test", description: "test description", json: {} },
          { projects: { test: { name: "test", last_save } } }
        ),
        "it should be true"
      );
    });
  });
  describe("invalidProjectDescription", () => {
    it("should be false if description is empty string", () => {
      assert.isFalse(invalidProjectDescription(""), "it should be false");
    });
    it("should be true if more than 100 characters", () => {
      assert.isTrue(
        invalidProjectDescription(
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        ),
        "it should be true"
      );
    });
    it("should be true if contains invalid characters", () => {
      assert.isTrue(
        invalidProjectDescription("%%%$$@@@;{}"),
        "it should be true"
      );
    });
  });
  describe("invalidCbrRule", () => {
    it("should return false when api_type_id empty string", () => {
      assert.isFalse(invalidCbrRule("api_type_id", { api_type_id: "" }));
    });
    it("should return true when api_type_id is invalid string", () => {
      assert.isTrue(invalidCbrRule("api_type_id", { api_type_id: "?" }));
    });
    it("should return true when description contains invalid character", () => {
      assert.isTrue(invalidCbrRule("description", { description: "\x00" }));
    });
    it("should return true when description is more than 300 chars", () => {
      let longDescription = "*".repeat(301);
      assert.isTrue(
        invalidCbrRule("description", {
          description: longDescription,
        })
      );
    });
    it("should return true when empty string", () => {
      assert.isTrue(invalidCbrRule("value", { value: "" }));
    });
    it("should return true if enforcement_mode not selected", () => {
      assert.isTrue(
        invalidCbrRule("enforcement_mode", { enforcement_mode: "" })
      );
    });
    it("should return false when operator is empty", () => {
      assert.isFalse(invalidCbrRule("operator", { operator: "" }));
    });
    it("should return true when operator is not empty and doesn't match regex", () => {
      assert.isTrue(invalidCbrRule("operator", { operator: "??" }));
    });
  });
  describe("invalidCbrZone", () => {
    it("should return true when description contains invalid character", () => {
      assert.isTrue(invalidCbrZone("description", { description: "\x00" }));
    });
    it("should return true when ip address is undefined", () => {
      assert.isTrue(invalidCbrZone("value", { type: "ipAddress" }));
    });
    it("should return true when description is more than 300 chars", () => {
      let longDescription = "*".repeat(301);
      assert.isTrue(
        invalidCbrRule("description", {
          description: longDescription,
        })
      );
    });
    it("should return true when invalid ip when type is ipAddress and ip is cidr", () => {
      assert.isTrue(
        invalidCbrZone("value", { type: "ipAddress", value: "2.2.2.2/12" })
      );
    });
    it("should return true when not ip", () => {
      assert.isTrue(
        invalidCbrZone("value", { type: "ipAddress", value: "blah" })
      );
    });
    it("should return false when valid ip range", () => {
      assert.isFalse(
        invalidCbrZone("value", { type: "ipRange", value: "2.2.2.2-2.2.2.2" })
      );
    });
    it("should check that all other value/type combos match regex", () => {
      assert.isTrue(invalidCbrZone("value", { type: "vpc", value: "?@?" }));
    });
    it("should allow empty fields if not value", () => {
      assert.isFalse(invalidCbrZone("service_type", { service_type: "" }));
    });
    it("should return true if invalid field that is typed in", () => {
      assert.isTrue(
        invalidCbrZone("service_instance", { service_instance: "?@?#(#*" })
      );
    });
  });
  describe("invalidDescription", () => {
    it("should return false when description is empty string", () => {
      assert.isFalse(invalidDescription("", {}));
    });
    it("should return true when description has invalid chars", () => {
      assert.isTrue(invalidDescription("@", {}));
    });
  });
  describe("invalidCrns", () => {
    it("should return true if invalid crn list", () => {
      assert.isTrue(
        invalidCrns(
          {
            crns: ["aaa"],
          },
          "it should be true"
        )
      );
    });
  });
});
