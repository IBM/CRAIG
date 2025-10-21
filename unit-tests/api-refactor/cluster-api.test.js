const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../server/express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");

describe("cluster api", () => {
  let sendDataOnTokenValid = (res, field, callback) => {
    return callback();
  };
  beforeEach(() => {
    res.send = new sinon.spy();
    sendDataOnTokenValid = new sinon.spy(sendDataOnTokenValid);
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
  });
  describe("/api/cluster/us-south/flavors", () => {
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios([
        { name: "bx2.16x64" },
        { name: "bx2.2x8" },
      ]);
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = sendDataOnTokenValid;
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith(["bx2.16x64", "bx2.2x8"]));
          assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
        });
    });
    it("should respond with the correct data and store in flavors", () => {
      let { axios } = initMockAxios([
        { name: "bx2.16x64" },
        { name: "bx2.2x8" },
      ]);
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = sendDataOnTokenValid;
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.deepEqual(
            testController.flavors,
            ["bx2.16x64", "bx2.2x8"],
            "it should save flavors",
          );
          assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
        });
    });
    it("should send flavors in controller constructor if there are flavors and the token is not expired", () => {
      let { axios } = initMockAxios([
        { name: "bx2.16x64" },
        { name: "bx2.2x8" },
      ]);
      let testController = new controller(axios);
      let mockExpiration = Math.floor(Date.now() / 1000) + 100;
      testController.expiration = mockExpiration;
      testController.flavors = ["1234"];
      testController.token = "1234";
      testController.sendDataOnTokenValid = new sinon.spy(
        testController.sendDataOnTokenValid,
      );
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith(["1234"]), "it should be true");
          assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(
        { response: "should return this when err" },
        true,
      );
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = sendDataOnTokenValid;
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith("should return this when err"));
          assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
        });
    });
  });
  describe("/api/cluster/versions", () => {
    let data = {
      kubernetes: [
        {
          major: 1,
          minor: 23,
          patch: 15,
          default: false,
          end_of_service: "",
        },
        {
          major: 1,
          minor: 24,
          patch: 9,
          default: true,
          end_of_service: "",
        },
      ],
      openshift: [
        {
          major: 4,
          minor: 10,
          patch: 43,
          default: true,
          end_of_service: "",
        },
        {
          major: 4,
          minor: 11,
          patch: 17,
          default: false,
          end_of_service: "",
        },
      ],
    };
    it("should return the correct data", () => {
      let { axios } = initMockAxios(data);
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = sendDataOnTokenValid;
      return testController.clusterVersions({}, res).then(() => {
        assert.isTrue(
          res.send.calledOnceWith([
            "4.10.43_openshift (Default)",
            "1.24.9 (Default)",
            "1.23.15",
            "4.11.17_openshift",
          ]),
        );
        assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
      });
    });
    it("should set versions in controller constructor", () => {
      let { axios } = initMockAxios(data);
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = sendDataOnTokenValid;
      return testController.clusterVersions({}, res).then(() => {
        assert.deepEqual(
          testController.versions,
          [
            "4.10.43_openshift (Default)",
            "1.24.9 (Default)",
            "1.23.15",
            "4.11.17_openshift",
          ],
          "it should have versions",
        );
        assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
      });
    });
    it("should send versions in controller constructor if there are versions and the token is not expired", () => {
      let { axios } = initMockAxios(data);
      let testController = new controller(axios);
      let mockExpiration = Math.floor(Date.now() / 1000) + 100;
      testController.expiration = mockExpiration;
      testController.versions = ["1234"];
      testController.token = "1234";
      testController.sendDataOnTokenValid = new sinon.spy(
        testController.sendDataOnTokenValid,
      );
      return testController.clusterVersions({}, res).then(() => {
        assert.isTrue(res.send.calledOnceWith(["1234"]));
        assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
      });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(data, true);
      let testController = new controller(axios);
      testController.sendDataOnTokenValid = sendDataOnTokenValid;
      return testController.clusterVersions({}, res).then(() => {
        assert.isTrue(res.send.calledOnce);
        assert.isTrue(testController.sendDataOnTokenValid.calledOnce);
      });
    });
  });
});
