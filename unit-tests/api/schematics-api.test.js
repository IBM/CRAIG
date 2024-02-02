const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");
const testJson = require("../data-files/craig-json.json");

describe("schematics api", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
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
            res.send.calledOnceWith({
              error: "Error: failed to pack tar file",
            })
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
          resources: {
            id: "foo-123-id",
          },
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
          resources: [
            {
              id: "foo-123-id",
            },
          ],
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
              resources: [
                {
                  id: "foo-123-id",
                },
              ],
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
          resources: [
            {
              id: "foo-123-id",
            },
          ],
        },
        false
      );
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
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
              resources: [
                {
                  id: "foo-123-id",
                },
              ],
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
    it("should respond with error", () => {
      let { axios } = initMockAxios(
        {
          id: "us-south.workspace.testWorkspace",
          name: "testWorkspace",
          location: "us-south",
          resources: [],
        },
        false
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
