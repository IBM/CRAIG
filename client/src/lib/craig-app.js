const {
  kebabCase,
  isEmpty,
  keys,
  isNullOrEmptyString,
  deepEqual,
} = require("lazy-z");
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
  craig.hardSetJson(projects[projectKeyName].json, true);
  craig.store.json._options.template = projects[projectKeyName].template;

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
        pathName === "/"
          ? ""
          : " " + notificationText(pathName).replace(/v\s2/g, "v2")
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
    componentProps.data &&
    componentProps.data.name !== "" &&
    projectKeyName !== kebabCase(componentProps.data.name)
  ) {
    delete projects[kebabCase(componentProps.data.name)];
  }

  return projects;
}

/**
 * allow project fetch to be unit tested
 * @param {*} reactFetch react fetch
 * @param {*} workspace object describing workspace
 * @param {*} reject promise reject callback
 * @param {*} resolveCallback callback to run when resolve
 * @param {*} rejectCallback callback to run on reject
 * @returns {Promise} fetch promise
 */
function projectFetch(
  reactFetch,
  workspace,
  reject,
  resolveCallback,
  rejectCallback
) {
  let { workspace_name, workspace_region, workspace_resource_group } =
    workspace;
  return reactFetch(
    `/api/schematics/${workspace_name}` +
      (workspace_region ? "/" + workspace_region : "") +
      (workspace_resource_group ? "/" + workspace_resource_group : ""),
    { method: "POST" }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        reject(data.error);
      } else if (isNullOrEmptyString(data.id)) {
        reject("Workspace did not create. Missing ID.");
      } else {
        resolveCallback(
          `https://cloud.ibm.com/schematics/workspaces/${data.id}`
        );
      }
    })
    .catch((err) => {
      rejectCallback();
      reject(err);
    });
}

/**
 * on request submit json modal
 * @param {*} event
 * @param {*} stateData
 * @param {*} componentProps
 * @param {*} resolveCallback
 * @returns {Function}
 */
function onRequestSubmitJSONModal(
  event,
  stateData,
  componentProps,
  resolveCallback
) {
  // if edit mode, ignore enter key to allow for new lines in text area
  if (!stateData.readOnlyJSON && event.code === "Enter") {
    return resolveCallback(false);
  }

  if (componentProps.import) {
    return onRequestProjectImport(stateData, (project) => {
      componentProps.onProjectSave(project, componentProps, true);
      resolveCallback(true);
    });
  } else {
    return onRequestOverrideProjectJSON(
      stateData,
      componentProps,
      (project) => {
        if (project) {
          componentProps.onProjectSave(
            project,
            componentProps,
            componentProps.current_project === stateData.name // update if current project
          );
        }
        resolveCallback(true);
      }
    );
  }
}

/**
 * on request project import
 * @param {*} stateData
 * @param {*} resolveCallback
 * @returns {Function}
 */
function onRequestProjectImport(stateData, resolveCallback) {
  let now = new Date();
  let date = now.toLocaleDateString().replaceAll("/", "-");
  let time = now.toLocaleTimeString().replaceAll(":", "-").replaceAll(" ", "-");

  let name = "new-import-project-" + date + "-" + time.toLowerCase();
  let project = {
    name,
    project_name: name,
    json: stateData.json,
    description: `Imported Project`,
  };

  return resolveCallback(project);
}

/**
 * on request override project json
 * @param {*} stateData
 * @param {*} componentProps
 * @param {*} resolveCallback
 * @returns {Function}
 */
function onRequestOverrideProjectJSON(
  stateData,
  componentProps,
  resolveCallback
) {
  let invalidTextData = stateData.json === undefined;
  let textAreaDidChange =
    componentProps.data && !deepEqual(componentProps.data.json, stateData.json);

  if (invalidTextData || !textAreaDidChange) {
    // invalid OR no changes, so no need to save
    return resolveCallback();
  }

  let project = { ...componentProps.data };
  project.json = stateData.json;

  return resolveCallback(project);
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
  projectFetch,
  onRequestSubmitJSONModal,
  onRequestProjectImport,
  onRequestOverrideProjectJSON,
};
