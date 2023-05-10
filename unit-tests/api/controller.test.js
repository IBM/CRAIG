const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const vsiInstanceProfilesRaw = require("../data-files/vsiInstanceProfilesRaw.json");
const vsiImagesRaw = require("../data-files/vsiImagesRaw.json");
const clusterFlavorsRaw = require("../data-files/clusterFlavorRaw.json");
const clusterVersionRaw = require("../data-files/clusterVersionRaw.json");
const { initMockAxios } = require("lazy-z");

describe("controller", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  describe("getBearerToken", () => {
    let requestConfig = {
      method: "post",
      url: `https://iam.cloud.ibm.com/identity/token?grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=***`,
      headers: {
        Accept: "application/json",
      },
    };
    it("should return a access token", () => {
      let { axios } = initMockAxios(
        { access_token: "token", expiration: 1 },
        false
      );
      let testController = new controller(axios);
      return testController.getBearerToken(requestConfig).then((data) => {
        assert.deepEqual(data, "token", "it should return correct data");
      });
    });
    it("should return a access token if a non expired token exists", () => {
      let { axios } = initMockAxios(
        {
          access_token: "token",
          expiration: Math.floor(Date.now() / 1000) + 100,
        },
        false
      );
      let testController = new controller(axios);
      return testController.getBearerToken(requestConfig).then((data) => {
        assert.deepEqual(data, "token", "it should return correct data");
      });
    });
    it("should reject on error", () => {
      let { axios } = initMockAxios({ stderr: "promise rejected" }, true);
      let testController = new controller(axios);
      return testController.getBearerToken(requestConfig).catch((data) => {
        assert.deepEqual(
          data,
          { stderr: "promise rejected" },
          "it should return correct data"
        );
      });
    });
    it("should use existing token", () => {
      let { axios } = initMockAxios({});
      let testController = new controller(axios);
      testController.expiration = Math.floor(Date.now() / 1000) + 100;
      testController.token = "token";
      return testController.getBearerToken(requestConfig).then((data) => {
        assert.deepEqual(data, "token", "it should return correct data");
      });
    });
  });
  describe("vsiInstanceProfiles", () => {
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios(vsiInstanceProfilesRaw);
      let testController = new controller(axios);
      return testController
        .vsiInstanceProfiles({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(["bx2-2x8", "bx2-4x16", "bx2-8x32"])
          );
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(vsiInstanceProfilesRaw, true);
      let testController = new controller(axios);
      return testController
        .vsiInstanceProfiles({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
  });
  describe("vsiImages", () => {
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios(vsiImagesRaw);
      let testController = new controller(axios);
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(vsiImagesRaw, true);
      let testController = new controller(axios);
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
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
    it("should respond with eror", () => {
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
            "1.24.9_kubernetes (Default)",
            "1.22.17_kubernetes",
            "1.23.15_kubernetes",
            "1.25.5_kubernetes",
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
            "1.24.9_kubernetes (Default)",
            "1.22.17_kubernetes",
            "1.23.15_kubernetes",
            "1.25.5_kubernetes",
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
  describe("schematics-upload", () => {
    let { axios } = initMockAxios(
      {
        workspaces: [
          {
            name: "frog-workspace",
            id: "foo-workspace-id",
            template_data: [{ id: "123abc-id" }],
          },
        ],
      },
      false
    );
    it("should return data passed", () => {
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .uploadTar("frog-workspace", "./fake/file.tar")
        .then((data) => {
          assert.deepEqual(
            data,
            {
              data: {
                workspaces: [
                  {
                    name: "frog-workspace",
                    id: "foo-workspace-id",
                    template_data: [{ id: "123abc-id" }],
                  },
                ],
              },
            },
            "it should return correct data"
          );
        });
    });
    it("should return data passed", () => {
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .uploadTar("wrong-workspace", "./fake/file.tar")
        .then((data) => {
          assert.deepEqual(
            data,
            {
              data: {
                workspaces: [
                  {
                    name: "frog-workspace",
                    id: "foo-workspace-id",
                    template_data: [{ id: "123abc-id" }],
                  },
                ],
              },
            },
            "it should return correct data"
          );
        });
    });
    it("should reject on error", () => {
      let { axios } = initMockAxios({ stderr: "promise rejected" }, true);
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .uploadTar("wrong-workspace", "./fake/file.tar")
        .catch((data) => {
          assert.deepEqual(
            data,
            { stderr: "promise rejected" },
            "it should return correct data"
          );
        });
    });
  });
});
