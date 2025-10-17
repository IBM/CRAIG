const { assert } = require("chai");
const {
  onProjectSelectCallback,
  onProjectDeselect,
  onProjectDeleteCallback,
  updateNotification,
  saveAndSendNotificationCallback,
  saveProjectCallback,
  projectShouldCreateWorkspace,
  getAndUpdateProjects,
  projectFetch,
  onRequestProjectImport,
  onRequestOverrideProjectJSON,
  onRequestSubmitJSONModal,
} = require("../client/src/lib/craig-app");
const { state } = require("../client/src/lib");
const sinon = require("sinon");

function mockCraig() {
  this.lastSetItem;
  this.setItem = function (itemName, data) {
    this.lastSetItem = [itemName, data];
  };
  this.notify = function (data) {
    this.lastNotification = data;
  };
  this.onProjectSelect = function (projectName, message) {
    this.lastProjectSelect = [projectName, message];
  };
  this.saveAndSendNotification = function (message) {
    this.lastSaveAndSend = message;
  };
}

function newMockCraig() {
  return new mockCraig();
}

/**
 * create a mock react fetch
 * @param {boolean} shouldReject function should reject
 * @param {*} data arbitrary data to return if shouldReject is false
 */
function mockFetch(shouldReject, data) {
  this.fetchPromise = function (url, options) {
    return new Promise((resolve, reject) => {
      if (shouldReject) {
        reject("This is an error!");
      } else {
        resolve({
          json: function () {
            return data;
          },
        });
      }
    });
  };
}

describe("craig app", () => {
  let craigApp;
  let craigState;
  beforeEach(() => {
    craigApp = newMockCraig();
    craigState = new state();
    craigState.setUpdateCallback(() => {});
  });
  describe("onProjectDeselect", () => {
    it("should set project name and send notification", () => {
      onProjectDeselect(craigApp, craigState);
      assert.deepEqual(
        craigState.store.project_name,
        "",
        "it should reset data",
      );
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        "Successfully cleared project selection",
        "it should have correct message",
      );
    });
  });
  describe("onProjectSelectCallback", () => {
    it("should update project name, json, projects when unfound, and call save and send notification with correct text", () => {
      let callback = onProjectSelectCallback(
        {}, // projects
        craigApp,
        craigState,
        "project-name",
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Project project-name successfully imported`,
        "it should have correct message",
      );
    });
    it("should update project name, json, projects when found, and call save and send notification with correct text", () => {
      let callback = onProjectSelectCallback(
        {
          "project-name": {},
        }, // projects
        craigApp,
        craigState,
        "project-name",
      );
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Project project-name successfully imported`,
        "it should have correct message",
      );
    });
    it("should update project name, json, projects when found with json data, and call save and send notification with correct text", () => {
      let callback = onProjectSelectCallback(
        {
          "project-name": { json: { _options: {} } },
        }, // projects
        craigApp,
        craigState,
        "project-name",
      );
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Project project-name successfully imported`,
        "it should have correct message",
      );
    });
    it("should update project name, json, projects when found with project info, and call save and send notification with correct text", () => {
      let callback = onProjectSelectCallback(
        {
          "project-name": {},
        }, // projects
        craigApp,
        craigState,
        "project-name",
      );
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Project project-name successfully imported`,
        "it should have correct message",
      );
    });
    it("should update project name, json, projects when found with project info, and call save and send notification with correct text and call callback", () => {
      let called = false;
      let callback = onProjectSelectCallback(
        {
          "project-name": {},
        }, // projects
        craigApp,
        craigState,
        "project-name",
        "message",
        () => {
          called = true;
        },
      );
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `message`,
        "it should have correct message",
      );
      assert.isTrue(called, "it should be called");
    });
  });
  describe("onProjectDeleteCallback", () => {
    it("should call deselect if deleting currently selected project", () => {
      craigState.store.project_name = "test";
      craigApp.onProjectDeselect = new sinon.spy();
      let callback = onProjectDeleteCallback(craigApp, craigState, "test");
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        "Successfully deleted project test",
        "it should have correct data",
      );
      assert.isTrue(
        craigApp.onProjectDeselect.calledOnce,
        "it should call on project deselect",
      );
    });
    it("should call deselect if not deleting currently selected project", () => {
      craigApp.onProjectDeselect = new sinon.spy();
      let callback = onProjectDeleteCallback(craigApp, craigState, "test");
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        "Successfully deleted project test",
        "it should have correct data",
      );
      assert.isFalse(
        craigApp.onProjectDeselect.calledOnce,
        "it should call on project deselect",
      );
    });
  });
  describe("updateNotification", () => {
    it("should return notifcation for saving with message", () => {
      let expectedData = {
        title: "Success",
        kind: "success",
        text: "message",
        timeout: 3000,
      };
      let actualData = updateNotification("/", "message");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct notification",
      );
    });
    it("should return notifcation for saving from root '/' and no message", () => {
      let expectedData = {
        title: "Success",
        kind: "success",
        text: "Successfully updated",
        timeout: 3000,
      };
      let actualData = updateNotification("/");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct notification",
      );
    });
    it("should return notifcation for saving from /form/loadBalancer and no message", () => {
      let expectedData = {
        title: "Success",
        kind: "success",
        text: "Successfully updated Load Balancer",
        timeout: 3000,
      };
      let actualData = updateNotification("/form/loadBalancer");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct notification",
      );
    });
  });
  describe("saveAndSendNotificationCallback", () => {
    it("should call notify if noProjetSave is true", () => {
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {},
        "hi",
        true,
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification",
      );
    });
    it("should call not notify if footerToggle is true", () => {
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {},
        "hi",
        true,
        true,
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        undefined,
        "it should send notification",
      );
    });
    it("should call notify if noProjetSave is false and no projects", () => {
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {},
        "hi",
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification",
      );
    });
    it("should call notify if noProjetSave is false, projects exist, but no store project key name", () => {
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {
          frog: {},
        },
        "hi",
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification",
      );
    });
    it("should call notify if noProjetSave is false, projects exist, with store project key name", () => {
      craigState.store.project_name = "frog";
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {
          frog: {},
        },
        "hi",
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification",
      );
      assert.deepEqual(
        craigApp.lastSetItem,
        ["craigProjects", { frog: { json: craigState.store.json } }],
        "it should set item",
      );
    });
  });
  describe("saveProjectCallback", () => {
    beforeEach(() => {
      craigApp.onProjectSelect = new sinon.spy();
      craigState.store.project_name = "frog";
    });
    it("should call onProjectSelect if setting current project", () => {
      let callback = saveProjectCallback(
        craigApp,
        craigState,
        {
          name: "frog",
          project_name: "frog",
        },
        {},
        true,
      );

      callback();
      assert.isTrue(
        craigApp.onProjectSelect.calledOnceWith(
          "frog",
          `Successfully saved project frog`,
        ),
        "it should send notification",
      );
    });
    it("should call saveAndSendNotification if not setting current project with same project name", () => {
      let callback = saveProjectCallback(
        craigApp,
        craigState,
        {
          name: "frog",
          project_name: "frog",
        },
        {
          data: {
            name: "frog",
          },
        },
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Successfully saved project frog`,
        "it should send notification",
      );
    });
    it("should call saveAndSendNotification if not setting current project with new project", () => {
      let callback = saveProjectCallback(
        craigApp,
        craigState,
        {
          name: "frog",
          project_name: "frog",
        },
        {
          data: {
            name: "",
          },
        },
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Successfully saved project frog`,
        "it should send notification",
      );
    });
    it("should call saveAndSendNotification if not setting current project when changing name", () => {
      let callback = saveProjectCallback(
        craigApp,
        craigState,
        {
          name: "frog",
          project_name: "frog",
        },
        {
          data: {
            name: "egg",
          },
        },
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Successfully saved project frog`,
        "it should send notification",
      );
      assert.deepEqual(
        craigState.store.project_name,
        "frog",
        "it should set project name",
      );
    });
  });
  describe("projectShouldCreateWorkspace", () => {
    it("should return false if no workspace should be created", () => {
      let actualData = projectShouldCreateWorkspace(
        {
          frog: {},
        },
        {
          name: "frog",
          use_schematics: false,
        },
      );
      assert.isFalse(actualData, "it should be false");
    });
    it("should return true if a workspace should be created", () => {
      let actualData = projectShouldCreateWorkspace(
        {
          frog: {},
        },
        {
          name: "frog",
          workspace_name: "ws",
        },
      );
      assert.isTrue(actualData, "it should be true");
    });
  });
  describe("getAndUpdateProjects", () => {
    it("should set project key value for project name if unfound", () => {
      let projects = {};
      let projectState = { name: "frog", use_schematics: true };
      getAndUpdateProjects(projects, projectState, {
        data: {
          name: "",
        },
      });
      assert.deepEqual(
        projects.frog,
        {
          description: undefined,
          name: "frog",
          project_name: "frog",
          json: undefined,
          last_save: undefined,
          use_schematics: true,
          use_template: true,
          template: "Empty Project",
        },
        "it should set data",
      );
    });
    it("should delete project data for schematics when not using schematics", () => {
      let projects = {
        frog: {
          workspace_name: "deleted",
          workspace_url: "deleted",
          workspace_region: "deleted",
          workspace_resource_group: "deleted",
        },
      };
      let projectState = {
        description: undefined,
        name: "frog",
        project_name: "frog",
        json: undefined,
        last_save: undefined,
        use_schematics: false,
        use_template: undefined,
        template: undefined,
      };
      getAndUpdateProjects(projects, projectState, {
        data: {
          name: "frog",
        },
      });
      assert.deepEqual(
        projects.frog,
        {
          description: undefined,
          name: "frog",
          project_name: "frog",
          json: undefined,
          last_save: undefined,
          use_schematics: false,
          use_template: true,
          template: "Empty Project",
        },
        "it should set data",
      );
    });
    it("should delete project data from projects when changing name", () => {
      let projects = {
        frog: {
          workspace_name: "deleted",
          workspace_url: "deleted",
          workspace_region: "deleted",
          workspace_resource_group: "deleted",
        },
        egg: {},
      };
      let projectState = {
        description: undefined,
        name: "frog",
        project_name: "frog",
        json: undefined,
        last_save: undefined,
        use_schematics: false,
        use_template: undefined,
        template: undefined,
      };
      getAndUpdateProjects(projects, projectState, {
        data: {
          name: "egg",
        },
      });
      assert.deepEqual(
        projects,
        {
          frog: {
            description: undefined,
            name: "frog",
            project_name: "frog",
            json: undefined,
            last_save: undefined,
            use_schematics: false,
            use_template: true,
            template: "Empty Project",
          },
        },
        "it should set data",
      );
    });
  });
  describe("projectFetch", () => {
    it("should reject and call rejectCallback on a failure", () => {
      let rejectSpy = new sinon.spy();
      let rejectCallbackSpy = new sinon.spy();
      let reactFetch = new mockFetch(true);
      return projectFetch(
        reactFetch.fetchPromise,
        {
          workspace_region: "region",
          workspace_name: "name",
          workspace_resource_group: null,
        },
        rejectSpy,
        () => {},
        rejectCallbackSpy,
      ).catch(() => {
        assert.isTrue(rejectSpy.calledOnce, "it should be called once");
        assert.isTrue(rejectCallbackSpy.calledOnce, "it should call spy once");
      });
    });
    it("should reject when there is an error in the json", () => {
      let rejectSpy = new sinon.spy();
      let reactFetch = new mockFetch(false, {
        error: "this is an error",
      });
      return projectFetch(
        reactFetch.fetchPromise,
        {
          workspace_region: "region",
          workspace_name: "name",
          workspace_resource_group: null,
        },
        rejectSpy,
        () => {},
        () => {},
      ).then(() => {
        assert.isTrue(rejectSpy.calledOnce, "it should be called once");
      });
    });
    it("should reject when json is returned where id is null", () => {
      let rejectSpy = new sinon.spy();
      let reactFetch = new mockFetch(false, {
        id: null,
      });
      return projectFetch(
        reactFetch.fetchPromise,
        {
          workspace_region: "region",
          workspace_name: "name",
          workspace_resource_group: null,
        },
        rejectSpy,
        () => {},
        () => {},
      ).then(() => {
        assert.isTrue(rejectSpy.calledOnce, "it should be called once");
      });
    });
    it("should otherwise call resolve callback with workspace url", () => {
      let reactFetch = new mockFetch(false, {
        id: "yes",
      });
      let resolveCallbackSpy = new sinon.spy();
      return projectFetch(
        reactFetch.fetchPromise,
        {
          workspace_region: null,
          workspace_name: "name",
          workspace_resource_group: "rg",
        },
        () => {},
        resolveCallbackSpy,
        () => {},
      ).then(() => {
        assert.isTrue(
          resolveCallbackSpy.calledOnce,
          "it should be called once",
        );
      });
    });
  });
  describe("onRequestSubmitJSONModal", () => {
    it("should not close if in edit mode and the Enter key is clicked", () => {
      onRequestSubmitJSONModal(
        { code: "Enter" },
        { readOnlyJSON: false },
        {},
        (shouldClose) => {
          assert.isFalse(shouldClose, "should be false");
        },
      );
    });
    it("should import", () => {
      let componentProps = {};
      componentProps.import = true;
      componentProps.onProjectSave = sinon.spy();
      onRequestSubmitJSONModal(
        {},
        { readOnlyJSON: false },
        componentProps,
        (shouldClose) => {
          assert.isTrue(shouldClose, "should be true");
          assert.isTrue(
            componentProps.onProjectSave.calledOnce,
            "it should call on project save",
          );
        },
      );
    });
    it("should override json", () => {
      let stateData = { json: { test: "test1234" } };
      let componentProps = {};
      componentProps.data = { json: { test: "test123" } };
      componentProps.onProjectSave = sinon.spy();
      onRequestSubmitJSONModal({}, stateData, componentProps, (shouldClose) => {
        assert.isTrue(shouldClose, "should be true");
        assert.isTrue(
          componentProps.onProjectSave.calledOnce,
          "it should call on project save",
        );
      });
    });
    it("should not override json if json hasn't changed", () => {
      let stateData = { json: { test: "test123" } };
      let componentProps = {};
      componentProps.data = { json: { test: "test123" } };
      componentProps.onProjectSave = sinon.spy();
      onRequestSubmitJSONModal({}, stateData, componentProps, (shouldClose) => {
        assert.isTrue(shouldClose, "should be true");
        assert.isTrue(
          componentProps.onProjectSave.notCalled,
          "it should call on project save",
        );
      });
    });
  });
  describe("onRequestProjectImport", () => {
    it("should create new imported project with expect name", () => {
      let json = {};
      onRequestProjectImport({ json }, (project) => {
        assert.isTrue(
          project.name.startsWith("new-import-project-"),
          "it should be true",
        );
      });
    });
    it("should create new imported project with expected description", () => {
      let json = {};
      onRequestProjectImport({ json }, (project) => {
        assert.equal(
          project.description,
          "Imported Project",
          "it should be equal",
        );
      });
    });
    it("should create new imported project with expected json", () => {
      let json = { test: "test123" };
      onRequestProjectImport({ json }, (project) => {
        assert.deepEqual(project.json, json, "it should be equal");
      });
    });
  });
  describe("onRequestOverrideProjectJSON", () => {
    it("should only override json in existing project", () => {
      let existingProject = { name: "existing-project", json: {} };
      let stateData = { json: { test: "test123" } };
      onRequestOverrideProjectJSON(
        stateData,
        { data: existingProject },
        (project) => {
          assert.deepEqual(project.json, stateData.json, "it should be equal");
        },
      );
    });
    it("should not override name when overriding json in existing project", () => {
      let existingProject = { name: "existing-project", json: {} };
      let stateData = { json: { test: "test123" } };
      onRequestOverrideProjectJSON(
        stateData,
        { data: existingProject },
        (project) => {
          assert.deepEqual(
            project.name,
            existingProject.name,
            "it should be equal",
          );
        },
      );
    });
    it("should not override if no changes detected", () => {
      let existingProject = {
        name: "existing-project",
        json: { test: "test123" },
      };
      let stateData = { json: { test: "test123" } };
      onRequestOverrideProjectJSON(
        stateData,
        { data: existingProject },
        (project) => {
          assert.deepEqual(project, undefined, "it should be undefined");
        },
      );
    });
    it("should not override if json is undefined", () => {
      let existingProject = {
        name: "existing-project",
        json: { test: "test123" },
      };
      onRequestOverrideProjectJSON({}, { data: existingProject }, (project) => {
        assert.deepEqual(project, undefined, "it should be undefined");
      });
    });
  });
});
