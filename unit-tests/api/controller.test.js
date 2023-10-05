const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const vsiInstanceProfilesRaw = require("../data-files/vsiInstanceProfilesRaw.json");
const vsiImagesRaw = require("../data-files/vsiImagesRaw.json");
const clusterFlavorsRaw = require("../data-files/clusterFlavorRaw.json");
const clusterVersionRaw = require("../data-files/clusterVersionRaw.json");
const { initMockAxios } = require("lazy-z");
const testJson = require("../data-files/craig-json.json");

describe("controller", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
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
    it("should reject on no api key error", () => {
      let { axios } = initMockAxios({ stderr: "No API_KEY defined" }, true);
      let testController = new controller(axios);
      let API_KEY = process.env.API_KEY;
      delete process.env.API_KEY;
      return testController.getBearerToken(requestConfig).catch((data) => {
        assert.deepEqual(
          data,
          { stderr: "No API_KEY defined" },
          "it should return correct data"
        );

        process.env.API_KEY = API_KEY;
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
          assert.deepEqual(
            res.send.lastCall.args,
            [
              [
                "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) [debian-9-amd64]",
                "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) [my-image]",
                "Windows Server 2016 Standard Edition (amd64) [windows-2016-amd64]",
              ],
            ],
            "it should get images"
          );
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
  describe("getWorkspaceData", () => {
    it("should return empty w_id and t_id", () => {
      let { axios } = initMockAxios({
        workspaces: [
          {
            name: "foo-workspace",
            id: "1234",
            template_data: [{ id: "5678" }],
          },
        ],
      });
      let w_idActual = "";
      let t_idActual = "";
      let testController = new controller(axios);
      testController.getWorkspaceData("frog-workspace").then((data) => {
        w_idActual = data.w_id;
        t_idActual = data.t_id;
      });
      assert.isEmpty(w_idActual) && assert.isEmpty(t_idActual);
    });
    it("should reject error on bad response", () => {
      let { axios } = initMockAxios({}, true);
      let testController = new controller(axios);
      testController.getWorkspaceData("cow-workspace").then(() => {
        assert.isTrue(res.send.calledOnce);
      });
    });
  });
  describe("uploadTar", () => {
    testJson.clusters[0]["kube_type"] = "openshift";
    testJson.clusters[0].worker_pools[0].cluster = "workload";
    testJson["vpn_servers"] = [];
    it("should throw error if NO_SCHEMATICS is true", () => {
      process.env.NO_SCHEMATICS = true;
      let { axios } = initMockAxios(
        {
          has_received_file: false,
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
      let uploadTarController = new controller(axios);
      return uploadTarController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
            },
            body: {},
          },
          res
        )
        .then(() => {
          delete process.env.NO_SCHEMATICS;
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Schematics feature not supported on development.",
            })
          );
        });
    });
    it("should throw error when craig object is invalid", () => {
      let { axios } = initMockAxios(
        {
          has_received_file: false,
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
      let uploadTarController = new controller(axios);
      return uploadTarController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
            },
            body: {},
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Error: failed to parse CRAIG data",
            })
          );
        });
    });
    it("should return an error when packing tar fails", () => {
      let { axios } = initMockAxios(
        {
          has_received_file: true,
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
      let uploadTarController = new controller(axios);
      return uploadTarController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
              forceFail: true,
            },
            body: testJson,
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({ error: "Error: failed to pack tar file" })
          );
        });
    }).timeout(100000);
    it("should return correct data on successful file upload", () => {
      let { axios } = initMockAxios({
        has_received_file: true,
        workspaces: [
          {
            name: "frog-workspace",
            id: "foo-workspace-id",
            template_data: [{ id: "123abc-id" }],
          },
        ],
      });
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
            },
            body: testJson,
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              has_received_file: true,
              workspaces: [
                {
                  name: "frog-workspace",
                  id: "foo-workspace-id",
                  template_data: [{ id: "123abc-id" }],
                },
              ],
            })
          );
        });
    });
    it("should throw error when has_received_file is false", () => {
      let { axios } = initMockAxios({
        has_received_file: false,
        workspaces: [
          {
            name: "frog-workspace",
            id: "foo-workspace-id",
            template_data: [{ id: "123abc-id" }],
          },
        ],
      });
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
            },
            body: testJson,
          },
          res
        )
        .catch(() => {
          assert.isTrue(
            res.send.calledOnceWith(
              "Error: frog-workspace has not received file. In uploadTar response data, has_received_file is false"
            )
          );
        });
    });

    delete testJson.clusters[0].kube_type;
  });
  describe("createWorkspace", () => {
    it("should throw error if NO_SCHEMATICS is true", () => {
      process.env.NO_SCHEMATICS = true;
      let { axios } = initMockAxios(
        {
          id: "us-south.workspace.testWorkspace",
          name: "testWorkspace",
          region: "us-south",
        },
        false
      );
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
              resourceGroup: "foo-rg",
            },
          },
          res
        )
        .then(() => {
          delete process.env.NO_SCHEMATICS;
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Schematics feature not supported on development.",
            })
          );
        });
    });
    it("should return correct data when workspace is created", () => {
      let { axios } = initMockAxios(
        {
          id: "us-south.workspace.testWorkspace",
          name: "testWorkspace",
          region: "us-south",
        },
        false
      );
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
              resourceGroup: "foo-rg",
            },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              id: "us-south.workspace.testWorkspace",
              name: "testWorkspace",
              region: "us-south",
            })
          );
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(
        {
          id: "us-south.workspace.testWorkspace",
          name: "testWorkspace",
          location: "us-south",
        },
        true
      );
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
              region: "us-south",
              resourceGroup: "foo-rg",
            },
          },
          res
        )
        .catch(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
  });
});
