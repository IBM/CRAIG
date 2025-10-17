const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../server/express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");
const { initRecursiveMockAxios } = require("../mocks/recursive-axios.mock");

describe("vsi api", () => {
  let spyFns;
  beforeEach(() => {
    res.send = new sinon.spy();
    spyFns = {
      sendDataOnTokenValid: (res, field, callback) => {
        return callback();
      },
      getBearerToken: () => {
        return new Promise((resolve) => resolve("token"));
      },
    };
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
  });

  describe("/api/vsi/us-south/instanceProfiles", () => {
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios({
        profiles: [
          { name: "bx2-2x8" },
          { name: "bx2-4x16" },
          { name: "bx2-8x32" },
        ],
      });
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = new sinon.spy(
        spyFns,
        "sendDataOnTokenValid"
      );
      testController.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return testController
        .vsiInstanceProfiles({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(["bx2-2x8", "bx2-4x16", "bx2-8x32"])
          );
          assert.isTrue(
            testController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testController.sendDataOnTokenValid.calledOnce,
            "should be true"
          );
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(
        {
          profiles: [
            { name: "bx2-2x8" },
            { name: "bx2-4x16" },
            { name: "bx2-8x32" },
          ],
          response: "response",
        },
        true
      );
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = new sinon.spy(
        spyFns,
        "sendDataOnTokenValid"
      );
      testController.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return testController
        .vsiInstanceProfiles({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith("response"));
          assert.isTrue(
            testController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testController.sendDataOnTokenValid.calledOnce,
            "should be true"
          );
        });
    });
  });
  describe("/api/vsi/us-south/images", () => {
    let data;
    beforeEach(() => {
      data = [
        {
          images: [
            {
              name: "windows-2016-amd64",
              operating_system: {
                display_name: "Windows Server 2016 Standard Edition (amd64)",
              },
            },
            {
              name: "debian-9-amd64",
              operating_system: {
                display_name:
                  "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64)",
              },
            },
            {
              name: "my-image",
              operating_system: {
                display_name:
                  "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64)",
              },
            },
          ],
          limit: 50,
          total_count: 101,
          next: {
            href: "https://us-south.iaas.cloud.ibm.com/v1/images?limit=100&start=123456",
          },
        },
        {
          images: [
            {
              name: "windows-2016-amd64",
              operating_system: {
                display_name: "Windows Server 2016 Standard Edition (amd64) 2",
              },
            },
            {
              name: "debian-9-amd64",
              operating_system: {
                display_name:
                  "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) 2",
              },
            },
            {
              name: "my-image",
              operating_system: {
                display_name:
                  "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) 2",
              },
            },
          ],
          limit: 50,
          total_count: 1,
        },
      ];
    });
    it("should respond with the correct data", () => {
      let { axios } = initRecursiveMockAxios(data, false, true);
      let testController = new controller(axios);
      testController.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      testController.sendDataOnTokenValid = new sinon.spy(
        spyFns,
        "sendDataOnTokenValid"
      );
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
          assert.deepEqual(
            res.send.lastCall.args,
            [
              [
                "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) 2 [debian-9-amd64]",
                "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) [debian-9-amd64]",
                "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) 2 [my-image]",
                "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) [my-image]",
                "Windows Server 2016 Standard Edition (amd64) 2 [windows-2016-amd64]",
                "Windows Server 2016 Standard Edition (amd64) [windows-2016-amd64]",
              ],
            ],
            "it should get images"
          );
          assert.isTrue(
            testController.getBearerToken.calledTwice,
            "should be true"
          );
          assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(
        {
          images: [
            {
              name: "windows-2016-amd64",
              operating_system: {
                display_name: "Windows Server 2016 Standard Edition (amd64)",
              },
            },
            {
              name: "debian-9-amd64",
              operating_system: {
                display_name:
                  "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64)",
              },
            },
            {
              name: "my-image",
              operating_system: {
                display_name:
                  "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64)",
              },
            },
          ],
          limit: 50,
          total_count: 101,
          next: {
            href: "https://us-south.iaas.cloud.ibm.com/v1/images?limit=100&start=123456",
          },
          data: "should be returned on err",
        },
        true,
        true
      );
      let testController = new controller(axios);
      testController.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      testController.sendDataOnTokenValid = new sinon.spy(
        spyFns,
        "sendDataOnTokenValid"
      );
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith("should be returned on err"));
          assert.isTrue(
            testController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
        });
    });
  });
  describe("/api/vsi/us-south/snapshots", () => {
    let data;
    beforeEach(() => {
      data = [{ name: "frog" }, { name: "toad" }];
    });
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios({ snapshots: data });
      let testController = new controller(axios);
      testController.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return testController
        .vsiSnapShots({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
          assert.isTrue(
            res.send.calledOnceWith(["frog", "toad"]),
            "it should get images"
          );
          assert.isTrue(testController.getBearerToken.calledOnce);
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(
        { data: "should return this on err" },
        true
      );
      let testController = new controller(axios);
      testController.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return testController
        .vsiSnapShots({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith("should return this on err"));
          assert.isTrue(testController.getBearerToken.calledOnce);
        });
    });
  });
});
