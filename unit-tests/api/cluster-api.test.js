const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const clusterFlavorsRaw = require("../data-files/clusterFlavorRaw.json");
const clusterVersionRaw = require("../data-files/clusterVersionRaw.json");
const { initMockAxios } = require("lazy-z");

describe("cluster api", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
  });

  describe("clusterFlavors", () => {
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios(clusterFlavorsRaw);
      let testController = new controller(axios);
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith(["bx2.16x64", "bx2.2x8"]));
        });
    });
    it("should respond with the correct data and store in flavors", () => {
      let { axios } = initMockAxios(clusterFlavorsRaw);
      let testController = new controller(axios);
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.deepEqual(
            testController.flavors,
            ["bx2.16x64", "bx2.2x8"],
            "it should save flavors"
          );
        });
    });
    it("should send flavors in controller constructor if there are flavors and the token is not expired", () => {
      let { axios } = initMockAxios(clusterVersionRaw);
      let testController = new controller(axios);
      let mockExpiration = Math.floor(Date.now() / 1000) + 100;
      testController.expiration = mockExpiration;
      testController.flavors = ["1234"];
      testController.token = "1234";
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnceWith(["1234"]), "it should be true");
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(clusterFlavorsRaw, true);
      let testController = new controller(axios);
      return testController
        .clusterFlavors({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
  });
  describe("clusterVersions", () => {
    it("should return the correct data", () => {
      let { axios } = initMockAxios(clusterVersionRaw);
      let testController = new controller(axios);
      return testController.clusterVersions({}, res).then(() => {
        assert.isTrue(
          res.send.calledOnceWith([
            "4.10.43_openshift (Default)",
            "1.24.9 (Default)",
            "1.22.17",
            "1.23.15",
            "1.25.5",
            "4.7.60_openshift",
            "4.8.54_openshift",
            "4.9.52_openshift",
            "4.11.17_openshift",
          ])
        );
      });
    });
    it("should set versions in controller constructor", () => {
      let { axios } = initMockAxios(clusterVersionRaw);
      let testController = new controller(axios);
      return testController.clusterVersions({}, res).then(() => {
        assert.deepEqual(
          testController.versions,
          [
            "4.10.43_openshift (Default)",
            "1.24.9 (Default)",
            "1.22.17",
            "1.23.15",
            "1.25.5",
            "4.7.60_openshift",
            "4.8.54_openshift",
            "4.9.52_openshift",
            "4.11.17_openshift",
          ],
          "it should have versions"
        );
      });
    });
    it("should send versions in controller constructor if there are versions and the token is not expired", () => {
      let { axios } = initMockAxios(clusterVersionRaw);
      let testController = new controller(axios);
      let mockExpiration = Math.floor(Date.now() / 1000) + 100;
      testController.expiration = mockExpiration;
      testController.versions = ["1234"];
      testController.token = "1234";
      return testController.clusterVersions({}, res).then(() => {
        assert.isTrue(res.send.calledOnceWith(["1234"]));
      });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(clusterVersionRaw, true);
      let testController = new controller(axios);
      return testController.clusterVersions({}, res).then(() => {
        assert.isTrue(res.send.calledOnce);
      });
    });
  });
});
