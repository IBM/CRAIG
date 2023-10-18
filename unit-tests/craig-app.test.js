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

describe("craig app", () => {
  describe("onProjectDeselect", () => {
    it("should set project name and send notification", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      onProjectDeselect(craigApp, craigState);
      assert.deepEqual(
        craigState.store.project_name,
        "",
        "it should reset data"
      );
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        "Successfully cleared project selection",
        "it should have correct message"
      );
    });
  });
  describe("onProjectSelectCallback", () => {
    it("should update project name, json, projects when unfound, and call save and send notification with correct text", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      let callback = onProjectSelectCallback(
        {}, // projects
        craigApp,
        craigState,
        "project-name"
      );
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Project project-name successfully imported`,
        "it should have correct message"
      );
    });
    it("should update project name, json, projects when fount, and call save and send notification with correct text", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      let callback = onProjectSelectCallback(
        {
          "project-name": {},
        }, // projects
        craigApp,
        craigState,
        "project-name"
      );
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Project project-name successfully imported`,
        "it should have correct message"
      );
    });
  });
  describe("onProjectDeleteCallback", () => {
    it("should call deselect if deleting currently selected project", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigState.store.project_name = "test";
      craigApp.onProjectDeselect = new sinon.spy();
      let callback = onProjectDeleteCallback(craigApp, craigState, "test");
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        "Successfully deleted project test",
        "it should have correct data"
      );
      assert.isTrue(
        craigApp.onProjectDeselect.calledOnce,
        "it should call on project deselect"
      );
    });
    it("should call deselect if not deleting currently selected project", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigApp.onProjectDeselect = new sinon.spy();
      let callback = onProjectDeleteCallback(craigApp, craigState, "test");
      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        "Successfully deleted project test",
        "it should have correct data"
      );
      assert.isFalse(
        craigApp.onProjectDeselect.calledOnce,
        "it should call on project deselect"
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
        "it should return correct notification"
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
        "it should return correct notification"
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
        "it should return correct notification"
      );
    });
  });
  describe("saveAndSendNotificationCallback", () => {
    it("should call notify if noProjetSave is true", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {},
        "hi",
        true
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification"
      );
    });
    it("should call not notify if footerToggle is true", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {},
        "hi",
        true,
        true
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        undefined,
        "it should send notification"
      );
    });
    it("should call notify if noProjetSave is false and no projects", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {},
        "hi"
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification"
      );
    });
    it("should call notify if noProjetSave is false, projects exist, but no store project key name", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {
          frog: {},
        },
        "hi"
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification"
      );
    });
    it("should call notify if noProjetSave is false, projects exist, with store project key name", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigState.store.project_name = "frog";
      let callback = saveAndSendNotificationCallback(
        craigApp,
        craigState,
        {
          frog: {},
        },
        "hi"
      );
      callback();
      assert.deepEqual(
        craigApp.lastNotification,
        "hi",
        "it should send notification"
      );
      assert.deepEqual(
        craigApp.lastSetItem,
        ["craigProjects", { frog: { json: craigState.store.json } }],
        "it should set item"
      );
    });
  });
  describe("saveProjectCallback", () => {
    it("should call onProjectSelect if setting current project", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigApp.onProjectSelect = new sinon.spy();
      craigState.store.project_name = "frog";
      let callback = saveProjectCallback(
        craigApp,
        craigState,
        {
          name: "frog",
          project_name: "frog",
        },
        {},
        true
      );

      callback();
      assert.isTrue(
        craigApp.onProjectSelect.calledOnceWith(
          "frog",
          `Successfully saved project frog`
        ),
        "it should send notification"
      );
    });
    it("should call saveAndSendNotification if not setting current project with same project name", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigApp.onProjectSelect = new sinon.spy();
      craigState.store.project_name = "frog";
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
        }
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Successfully saved project frog`,
        "it should send notification"
      );
    });
    it("should call saveAndSendNotification if not setting current project with new project", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigApp.onProjectSelect = new sinon.spy();
      craigState.store.project_name = "frog";
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
        }
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Successfully saved project frog`,
        "it should send notification"
      );
    });
    it("should call saveAndSendNotification if not setting current project when changing name", () => {
      let craigApp = newMockCraig();
      let craigState = new state();
      craigApp.onProjectSelect = new sinon.spy();
      craigState.store.project_name = "frog";
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
        }
      );

      callback();
      assert.deepEqual(
        craigApp.lastSaveAndSend,
        `Successfully saved project frog`,
        "it should send notification"
      );
      assert.deepEqual(
        craigState.store.project_name,
        "frog",
        "it should set project name"
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
        }
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
        }
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
        "it should set data"
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
        "it should set data"
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
        "it should set data"
      );
    });
  });
});
