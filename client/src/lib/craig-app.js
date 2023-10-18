const { kebabCase, isEmpty, keys } = require("lazy-z");
const { state } = require("./state");
const { notificationText } = require("./forms");

/**
 * handle project deselect
 * @param {*} component react component
 * @param {*} craig craig store
 */
function onProjectDeselect(component, craig) {
  craig.store.project_name = "";
  craig.store.json = new state().store.json;
  component.saveAndSendNotification(
    `Successfully cleared project selection`,
    true
  );
}

/**
 * create callback for on project select
 * @param {*} projects
 * @param {*} component
 * @param {*} craig
 * @param {*} name
 * @param {string=} message
 * @returns {Function} callback to run after save state
 */
function onProjectSelectCallback(projects, component, craig, name, message) {
  let projectKeyName = kebabCase(name);
  craig.store.project_name = projectKeyName;
  if (!projects[projectKeyName]) {
    projects[projectKeyName] = {};
  }
  craig.store.json = projects[projectKeyName].json;
  return function () {
    component.saveAndSendNotification(
      message || `Project ${name} successfully imported`,
      true
    );
  };
}

/**
 * callback function for on project delete
 * @param {*} component
 * @param {*} craig
 * @param {*} name
 * @returns {Function} function to run after setstate on project delete
 */
function onProjectDeleteCallback(component, craig, name) {
  let projectKeyName = kebabCase(name);
  return function () {
    component.saveAndSendNotification(`Successfully deleted project ${name}`);
    // deselect if project being deleted is currently selected
    if (craig.store.project_name === projectKeyName) {
      component.onProjectDeselect();
    }
  };
}

/**
 * create update notification for save and send notification
 * @param {*} pathName window.location.pathname
 * @param {*} message message to return
 * @returns {object} notification object
 */
function updateNotification(pathName, message) {
  let notification = {
    title: "Success",
    kind: "success",
    text:
      message ||
      `Successfully updated${
        pathName === "/" ? "" : " " + notificationText(pathName)
      }`,
    timeout: 3000,
  };
  return notification;
}

/**
 * save project on callback
 * @param {*} component
 * @param {*} craig
 * @param {*} projectData
 * @param {*} notification
 * @param {*} noProjectSave
 * @param {boolean=} footerToggle
 * @returns {Function} callback function
 */
function saveAndSendNotificationCallback(
  component,
  craig,
  projectData,
  notification,
  noProjectSave,
  footerToggle
) {
  return function () {
    if (noProjectSave !== true && !isEmpty(keys(projectData))) {
      let projectKeyName = kebabCase(craig.store.project_name);
      if (projectKeyName) {
        projectData[projectKeyName].json = Object.assign({}, craig.store.json);
        component.setItem("craigProjects", projectData);
      }
    }
    if (!footerToggle) component.notify(notification);
  };
}

/**
 * handle callback for saving project
 * @param {*} component
 * @param {*} craig
 * @param {*} stateData
 * @param {*} componentProps
 * @param {*} setCurrentProject
 * @returns {Function} callback function
 */
function saveProjectCallback(
  component,
  craig,
  stateData,
  componentProps,
  setCurrentProject
) {
  return function () {
    if (setCurrentProject) {
      component.onProjectSelect(
        stateData.project_name,
        `Successfully saved project ${stateData.name}`
      );
    } else {
      if (
        componentProps.data.name !== "" &&
        kebabCase(stateData.name) !== kebabCase(componentProps.data.name)
      ) {
        craig.store.project_name = kebabCase(stateData.name);
      }

      // send notification
      component.saveAndSendNotification(
        `Successfully saved project ${stateData.name}`,
        true
      );
    }
  };
}

/**
 * project should create workspace
 * @param {*} projects map of projects
 * @param {*} stateData
 * @returns {boolean} true if workspace should be created
 */
function projectShouldCreateWorkspace(projects, stateData) {
  let shouldCreateWorkspace = false;
  let projectKeyName = kebabCase(stateData.name);
  ["workspace_name", "workspace_region", "workspace_resource_group"].forEach(
    (field) => {
      if (projects[projectKeyName][field] !== stateData[field]) {
        projects[projectKeyName][field] = stateData[field];
        shouldCreateWorkspace = true;
      }
    }
  );
  return shouldCreateWorkspace;
}

/**
 * get projects and update
 * @param {*} projects
 * @param {*} stateData
 * @param {*} componentProps
 * @param {*} now date, not compiled here for unit tests
 * @returns {object} projects
 */
function getAndUpdateProjects(projects, stateData, componentProps, now) {
  let projectKeyName = kebabCase(stateData.name);
  // set unfound project
  if (!projects[projectKeyName]) {
    projects[projectKeyName] = {};
  }

  Object.assign(projects[projectKeyName], {
    name: stateData.name,
    project_name: stateData.name,
    description: stateData.description,
    use_template: stateData.use_template || true,
    template: stateData.template || "Empty Project",
    use_schematics: stateData.use_schematics,
    json: stateData.json,
    last_save: now,
  });

  if (!stateData.use_schematics) {
    delete projects[projectKeyName].workspace_name;
    delete projects[projectKeyName].workspace_url;
    delete projects[projectKeyName].workspace_region;
    delete projects[projectKeyName].workspace_resource_group;
  }

  // if the project name is changing, remove the old key from projects object
  if (
    componentProps.data.name !== "" &&
    projectKeyName !== kebabCase(componentProps.data.name)
  ) {
    delete projects[kebabCase(componentProps.data.name)];
  }

  return projects;
}

module.exports = {
  onProjectDeselect,
  onProjectSelectCallback,
  onProjectDeleteCallback,
  updateNotification,
  saveAndSendNotificationCallback,
  saveProjectCallback,
  projectShouldCreateWorkspace,
  getAndUpdateProjects,
};
