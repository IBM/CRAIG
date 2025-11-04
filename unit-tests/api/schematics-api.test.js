const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");
const { state } = require("../../client/src/lib/state");

describe("schematics api", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
    spyFns = {
      getBearerToken: () => {
        return new Promise((resolve) => resolve("token"));
      },
      getWorkspaceData: (workspaceName, region) => {
        return new Promise((resolve) => resolve(workspaceName, region));
      },
    };
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
    delete process.env.NO_SCHEMATICS;
    delete process.env.ACCOUNT_ID;
  });
  describe("getWorkspaceData", () => {
    it("should catch when token fails", () => {
      let { axios } = initMockAxios({}, true);
      let axiosSpy = new sinon.spy(axios);
      let api = new controller(axiosSpy);
      api.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return api.getWorkspaceData("bad name").catch((err) => {
        assert.isTrue(
          api.getBearerToken.calledOnce,
          "it should try to fetch token",
        );
        assert.deepEqual(
          axiosSpy.lastCall.args,
          [
            {
              method: "get",
              url: `https://undefined.schematics.cloud.ibm.com/v1/workspaces`,
              headers: {
                Accept: "application/json",
                Authorization: null,
              },
            },
          ],
          "it should call axios with correct args",
        );
        assert.deepEqual(err, {}, "it should reject with error");
      });
    });
    it("should catch when no matching workspace is found", () => {
      let { axios } = initMockAxios({
        workspaces: [
          {
            name: "frog",
          },
          {
            name: "toad",
          },
        ],
      });
      let axiosSpy = new sinon.spy(axios);
      let api = new controller(axiosSpy);
      api.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return api.getWorkspaceData("bad name").catch((err) => {
        assert.isTrue(
          api.getBearerToken.calledOnce,
          "it should try to fetch token",
        );
        assert.deepEqual(
          axiosSpy.lastCall.args,
          [
            {
              method: "get",
              url: `https://undefined.schematics.cloud.ibm.com/v1/workspaces`,
              headers: {
                Accept: "application/json",
                Authorization: null,
              },
            },
          ],
          "it should call axios with correct args",
        );
        assert.deepEqual(
          err,
          "No workspace found with name bad name",
          "it should reject with error",
        );
      });
    });
    it("should return correct data when workspace is found", () => {
      let { axios } = initMockAxios({
        workspaces: [
          {
            name: "frog",
          },
          {
            name: "toad",
            id: "toad",
            template_data: [
              {
                id: "toad-id",
              },
            ],
          },
        ],
      });
      let axiosSpy = new sinon.spy(axios);
      let api = new controller(axiosSpy);
      api.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return api.getWorkspaceData("toad").then((data) => {
        assert.isTrue(
          api.getBearerToken.calledOnce,
          "it should try to fetch token",
        );
        assert.deepEqual(
          axiosSpy.lastCall.args,
          [
            {
              method: "get",
              url: `https://undefined.schematics.cloud.ibm.com/v1/workspaces`,
              headers: {
                Accept: "application/json",
                Authorization: null,
              },
            },
          ],
          "it should call axios with correct args",
        );
        assert.deepEqual(
          data,
          { w_id: "toad", t_id: "toad-id" },
          "it should return correct workspace and template data ids",
        );
      });
    });
  });
  describe("/api/schematics/tar/:workspaceName/:region", () => {
    //tests uploadTar function
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
        false,
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
          res,
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Schematics feature not supported on development.",
            }),
            "it should be true",
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
        false,
      );
      let uploadTarController = new controller(axios);
      uploadTarController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken",
      );
      uploadTarController.getWorkspaceData = new sinon.spy(
        spyFns,
        "getWorkspaceData",
      );
      return uploadTarController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
            },
            body: {},
          },
          res,
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Error: failed to parse CRAIG data",
            }),
            "it should be true",
          );
          assert.isTrue(
            uploadTarController.getBearerToken.calledOnce,
            "it should be true",
          );
          assert.isTrue(
            uploadTarController.getWorkspaceData.calledOnceWith(
              "frog-workspace",
            ),
            "it should be true",
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
        false,
      );
      let uploadTarController = new controller(axios);
      uploadTarController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken",
      );
      uploadTarController.getWorkspaceData = new sinon.spy(
        spyFns,
        "getWorkspaceData",
      );
      let craig = new state();
      craig.setUpdateCallback(() => {});
      craig.update();
      // craig.store.json.ssh_keys[0].public_key = "NONE"
      return uploadTarController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
              forceFail: true,
            },
            body: craig.store.json,
          },
          res,
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Error: failed to pack tar file",
            }),
            "it should be true",
          );
          assert.isTrue(
            uploadTarController.getBearerToken.calledOnce,
            "it should be true",
          );
          assert.isTrue(
            uploadTarController.getWorkspaceData.calledOnceWith(
              "frog-workspace",
            ),
            "it should be true",
          );
        });
    });
    it("should return correct data on successful file upload", () => {
      let craig = new state();
      craig.setUpdateCallback(() => {});
      craig.update();
      craig.store.json.ssh_keys[0].public_key = "NONE";
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
      testSchematicsController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken",
      );
      testSchematicsController.getWorkspaceData = new sinon.spy(
        spyFns,
        "getWorkspaceData",
      );
      testSchematicsController.createBlob = new sinon.spy(
        testSchematicsController.createBlob,
      );
      return testSchematicsController
        .uploadTar(
          {
            params: {
              workspaceName: "frog-workspace",
            },
            body: craig.store.json,
          },
          res,
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
            }),
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.getBearerToken.calledOnce,
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.getWorkspaceData.calledOnceWith(
              "frog-workspace",
            ),
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.createBlob.calledOnce,
            "it should be true",
          );
        });
    });
    it("should throw error when has_received_file is false", () => {
      let craig = new state();
      craig.setUpdateCallback(() => {});
      craig.update();
      craig.store.json.ssh_keys[0].public_key = "NONE";
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
      testSchematicsController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken",
      );
      testSchematicsController.getWorkspaceData = new sinon.spy(
        spyFns,
        "getWorkspaceData",
      );
      testSchematicsController.createBlob = new sinon.spy(
        testSchematicsController.createBlob,
      );
      return testSchematicsController
        .uploadTar(
          {
            has_received_file: false,
            params: {
              workspaceName: "frog-workspace",
            },
            body: craig.store.json,
          },
          res,
        )
        .then(() => {
          assert.deepEqual(
            res.send.lastCall.args,
            [
              Error(
                "frog-workspace has not received file. In uploadTar response data, has_received_file is false",
              ),
            ],
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.getBearerToken.calledOnce,
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.getWorkspaceData.calledOnceWith(
              "frog-workspace",
            ),
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.createBlob.calledOnce,
            "it should be true",
          );
        });
    });
  });
  describe("getResourceGroupID", () => {
    it("should catch when token fails", () => {
      let { axios } = initMockAxios({}, true);
      let axiosSpy = new sinon.spy(axios);
      let api = new controller(axiosSpy);
      api.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return api.getResourceGroupID("bad name").catch((err) => {
        assert.isTrue(
          api.getBearerToken.calledOnce,
          "it should try to fetch token",
        );
        assert.deepEqual(
          axiosSpy.lastCall.args,
          [
            {
              method: "get",
              url: `https://resource-controller.cloud.ibm.com/v2/resource_groups`,
              headers: {
                Accept: "application/json",
                Authorization: "Bearer null",
              },
              params: {
                name: "bad name",
              },
            },
          ],
          "it should call axios with correct args",
        );
        assert.deepEqual(err, {}, "it should reject with error");
      });
    });
    it("should return correct data when rg is found", () => {
      let { axios } = initMockAxios({
        hello: "world",
      });
      let axiosSpy = new sinon.spy(axios);
      let api = new controller(axiosSpy);
      api.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return api.getResourceGroupID("toad").then((data) => {
        assert.isTrue(
          api.getBearerToken.calledOnce,
          "it should try to fetch token",
        );
        assert.deepEqual(
          axiosSpy.lastCall.args,
          [
            {
              method: "get",
              url: `https://resource-controller.cloud.ibm.com/v2/resource_groups`,
              headers: {
                Accept: "application/json",
                Authorization: "Bearer null",
              },
              params: {
                name: "toad",
              },
            },
          ],
          "it should call axios with correct args",
        );
        assert.deepEqual(
          data,
          { hello: "world" },
          "it should return correct resource group ID",
        );
      });
    });
    it("should return correct data when rg is found and ACCOUNT_ID is supplied", () => {
      process.env.ACCOUNT_ID = "1234";
      let { axios } = initMockAxios({
        hello: "world",
      });
      let axiosSpy = new sinon.spy(axios);
      let api = new controller(axiosSpy);
      api.getBearerToken = new sinon.spy(spyFns, "getBearerToken");
      return api.getResourceGroupID("toad").then((data) => {
        assert.isTrue(
          api.getBearerToken.calledOnce,
          "it should try to fetch token",
        );
        assert.deepEqual(
          axiosSpy.lastCall.args,
          [
            {
              method: "get",
              url: `https://resource-controller.cloud.ibm.com/v2/resource_groups`,
              headers: {
                Accept: "application/json",
                Authorization: "Bearer null",
              },
              params: {
                account_id: "1234",
                name: "toad",
              },
            },
          ],
          "it should call axios with correct args",
        );
        assert.deepEqual(
          data,
          { hello: "world" },
          "it should return correct resource group ID",
        );
      });
    });
  });
  describe("/api/schematics/:workspaceName/:region/:resourceGroup", () => {
    //tests createWorkspace function
    //createWorkspace catch block returns res.send({error}) so .then is used here
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
        false,
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
          res,
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              error: "Schematics feature not supported on development.",
            }),
            "it should be true",
          );
        });
    });
    it("should throw error if no region is provided", () => {
      let { axios } = initMockAxios(
        {
          id: "us-south.workspace.testWorkspace",
          name: "testWorkspace",
          resources: {
            id: "foo-123-id",
          },
        },
        false,
      );
      let testSchematicsController = new controller(axios);
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
            },
          },
          res,
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith({
              error: "No region provided for workspace.",
            }),
            "it should be true",
          );
        });
    });
    it("should respond with error for unfound resource group", () => {
      let { axios } = initMockAxios(
        {
          id: "us-south.workspace.testWorkspace",
          name: "testWorkspace",
          location: "us-south",
        },
        true,
      );
      let testSchematicsController = new controller(axios);
      testSchematicsController.getResourceGroupID = new sinon.spy(function () {
        return new Promise((resolve) => {
          resolve({
            resources: [],
          });
        });
      });
      testSchematicsController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken",
      );
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
              region: "us-south",
              resourceGroup: "foo-rg",
            },
          },
          res,
        )
        .then(() => {
          assert.deepEqual(
            res.send.lastCall.args,
            [{ error: "> Provided resource group not found." }],
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.getResourceGroupID.calledOnce,
            "it should be true",
          );
        });
    });
    it("should return correct data when workspace is created in specified resource group", () => {
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
        false,
      );
      let testSchematicsController = new controller(axios);
      testSchematicsController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken",
      );
      return testSchematicsController
        .createWorkspace(
          {
            params: {
              workspaceName: "testWorkspace",
              resourceGroup: "foo-rg",
              region: "us-south",
            },
          },
          res,
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
            }),
            "it should be true",
          );
          assert.isTrue(
            testSchematicsController.getBearerToken.calledOnce,
            "it should be true",
          );
        });
    });
  });
});
