/* this file is the main application page */

import React from "react";
import {
  kebabCase,
  titleCase,
  keys,
  isEmpty,
  isNullOrEmptyString,
} from "lazy-z";
import { useParams } from "react-router-dom";
import {
  About,
  Home,
  NavigationRedirectModal,
  PageTemplate,
  ReleaseNotes,
  Summary,
  Projects,
  NewFormPage,
} from "./components";
import { invalidForms, state } from "./lib";
import { CbrForm, ObservabilityForm } from "./components/forms";
import { JsonDocs } from "./components/pages/JsonDocs";
import Tutorial from "./components/pages/tutorial/Tutorial";
import { notificationText } from "./lib/forms/utils";
import { template_dropdown_map } from "./lib/constants";

const withRouter = (Page) => (props) => {
  const params = useParams();
  return <Page {...props} params={params} />;
};

const craig = new state();

class Craig extends React.Component {
  constructor(props) {
    super(props);
    try {
      // set store name to separate dev and prod environments
      let storeName =
        process.env.NODE_ENV === "development" ? "craigDevStore" : "craigStore";
      // get state based on environment
      let stateInStorage = window.localStorage.getItem(storeName);
      // get map of projects
      let projectInStorage = window.localStorage.getItem("craigProjects");
      // If there is a state in browser local storage, use it instead.
      if (stateInStorage) {
        craig.store = JSON.parse(stateInStorage);
      }
      // if there are no projects, set projects to be empty json
      if (!projectInStorage) {
        projectInStorage = "{}";
        window.localStorage.setItem("craigProjects", projectInStorage);
      }

      // set state for application
      this.state = {
        hideCodeMirror: craig.store.hideCodeMirror,
        hideFooter: craig.store.hideFooter,
        jsonInCodeMirror: craig.store.jsonInCodeMirror,
        notifications: [],
        storeName: storeName,
        projects: JSON.parse(projectInStorage),
        store: craig.store,
        visited: window.localStorage.getItem("craigVisited"),
      };
    } catch (err) {
      // if there are initialization errors, redirect user to reset state path
      // this is probably caused by an incorrectly configured state
      window.location.pathname = "/resetState";
    }
    this.toggleHide = this.toggleHide.bind(this);
    this.saveAndSendNotification = this.saveAndSendNotification.bind(this);
    this.setItem = this.setItem.bind(this);
    this.onError = this.onError.bind(this);
    this.notify = this.notify.bind(this);
    this.onTabClick = this.onTabClick.bind(this);
    this.onProjectSave = this.onProjectSave.bind(this);
    this.onProjectDelete = this.onProjectDelete.bind(this);
    this.onProjectSelect = this.onProjectSelect.bind(this);
    this.onProjectDeselect = this.onProjectDeselect.bind(this);
    this.getProject = this.getProject.bind(this);
    this.projectFetch = this.projectFetch.bind(this);
    this.saveProject = this.saveProject.bind(this);
  }

  // when react component mounts, set update callback for store
  // to update components
  componentDidMount() {
    craig.setUpdateCallback(() => {
      // save state
      this.saveAndSendNotification();
    });
    craig.setErrorCallback(() => {
      this.onError();
    });
  }

  /**
   * update components
   * @param {string} message
   * @param {boolean=} noProjectSave no project save
   */
  saveAndSendNotification(message, noProjectSave) {
    // Save state to local storage
    this.setItem(this.state.storeName, craig.store);
    // Show a notification when state is updated successfully
    let updatedForm =
      window.location.pathname === "/"
        ? "" // options and import json notification should be just successfully updated
        : notificationText(window.location.pathname);
    let notification = {
      title: "Success",
      kind: "success",
      text: message || `Successfully updated ${updatedForm}`,
      timeout: 3000,
    };
    this.setState(
      {
        store: craig.store,
      },
      () => {
        let projectData = JSON.parse(
          window.localStorage.getItem("craigProjects")
        );
        if (!noProjectSave && !isEmpty(keys(projectData))) {
          let projectKeyName = kebabCase(craig.store.project_name);
          projectData[projectKeyName].json = { ...craig.store.json };
          this.setItem("craigProjects", projectData);
        }
        this.notify(notification);
      }
    );
  }

  /**
   * display errors to user
   * @param {string=} message error text
   */
  onError(message) {
    let notification = {
      title: "Error",
      kind: "error",
      text: message || "An unexpected error has occurred.",
      timeout: 3000,
    };
    this.notify(notification);
  }

  /**
   * calls window.localStore.setItem
   * @param {string} storeName name of store
   * @param {object} store store data
   */
  setItem(storeName, store) {
    window.localStorage.setItem(storeName, JSON.stringify(store));
  }

  /**
   * toggle hide/show ui element
   * @param {string} value name of element store value
   */
  toggleHide(value) {
    craig.toggleStoreValue(value);
    this.setState({ [value]: craig.store[value] });
  }

  /**
   * show notifications
   * @param {*} notification
   */
  notify(notification) {
    this.setState((prevState) => ({
      notifications: [...prevState.notifications, notification],
    }));
  }

  /**
   * handle click between code mirror values
   * @param {string} tab tab name
   */
  onTabClick(tab) {
    let value = tab === "Terraform" ? false : true;
    craig.setStoreValue("jsonInCodeMirror", value);
    this.setState({ jsonInCodeMirror: value });
  }

  /**
   * project with brand new state
   */
  newProject() {
    return {
      name: "",
      description: "",
      use_template: false,
      use_schematics: false,
      json: template_dropdown_map["Empty Project"].template,
      template: "Mixed",
    };
  }

  /**
   * get project from data
   * @param {*} stateData
   * @param {*} componentProps
   * @returns Projects and project key name
   */
  getProject(stateData, componentProps) {
    let now = Date.now();
    let projectKeyName = kebabCase(stateData.name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));
    let shouldCreateWorkspace = false;
    let nameChange = false;

    if (!projects[projectKeyName]) {
      projects[projectKeyName] = {};
    }

    Object.assign(projects[projectKeyName], {
      name: stateData.name,
      project_name: stateData.name,
      description: stateData.description,
      use_template: stateData.use_template,
      template: stateData.template,
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
      nameChange = true;
      delete projects[kebabCase(componentProps.data.name)];
    }

    // set unfound project data
    ["workspace_name", "workspace_region", "workspace_resource_group"].forEach(
      (field) => {
        if (projects[projectKeyName][field] !== stateData[field]) {
          projects[projectKeyName][field] = stateData[field];
          shouldCreateWorkspace = true;
        }
      }
    );

    return {
      projectKeyName,
      projects,
      nameChange,
      shouldCreateWorkspace,
    };
  }

  /**
   * handle fetch for projects
   * @param {*} projects
   * @param {string} projectKeyName
   * @param {*} resolve
   * @param {*} reject
   * @returns {Promise} fetch promise
   */
  projectFetch(projects, projectKeyName, resolve, reject) {
    let { workspace_name, workspace_region, workspace_resource_group } =
      projects[projectKeyName];
    return fetch(
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
          projects[
            projectKeyName
          ].workspace_url = `https://cloud.ibm.com/schematics/workspaces/${data.id}`;
          resolve();
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  }

  /**
   * handle project save in state
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject
   */
  saveProject(stateData, componentProps, setCurrentProject) {
    let { projects, projectKeyName, nameChange } = this.getProject(
      stateData,
      componentProps
    );
    this.saveAndSendNotification(
      `Successfully saved project ${stateData.name}`,
      true
    );

    window.localStorage.setItem("craigProjects", JSON.stringify(projects));
    this.setState({ projects: { ...projects } }, () => {
      if (setCurrentProject) {
        this.onProjectSelect(
          stateData.project_name,
          `Successfully saved project ${stateData.name}`
        );
      } else {
        // if the project name changed and that was our current project, update name
        if (nameChange) {
          craig.store.project_name = projectKeyName;
        }

        this.saveAndSendNotification(
          `Successfully saved project ${stateData.name}`,
          true
        );
      }
    });
  }

  /**
   * save function for project
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject if true, set project as current project
   */
  onProjectSave(stateData, componentProps, setCurrentProject) {
    let { projects, projectKeyName, shouldCreateWorkspace } = this.getProject(
      stateData,
      componentProps
    );

    return new Promise((resolve, reject) => {
      if (!stateData.use_schematics || !shouldCreateWorkspace) {
        return resolve();
      } else
        return this.projectFetch(projects, projectKeyName, resolve, reject);
    })
      .then(() => {
        this.saveProject(stateData, componentProps, setCurrentProject);
      })
      .catch((err) => {
        console.error(err);
        this.onError(`Create failed with error: ${err}`);
      });
  }

  /**
   * delete function for project
   * @param {string} name project name
   */
  onProjectDelete(name) {
    let projectKeyName = kebabCase(name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));

    // remove from projects
    delete projects[projectKeyName];

    window.localStorage.setItem("craigProjects", JSON.stringify(projects));
    this.setState({ projects }, () => {
      this.saveAndSendNotification(`Successfully deleted project ${name}`);

      // deselect if project being deleted is currently selected
      if (craig.store.project_name === projectKeyName) {
        this.onProjectDeselect();
      }
    });
  }

  /**
   * load function for when project is selected
   * @param {string} name project name
   * @param {string=} message message to be display in notification
   */
  onProjectSelect(name, message) {
    let projectKeyName = kebabCase(name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));
    // update store project name and json
    craig.store.project_name = projectKeyName;
    craig.store.json = projects[projectKeyName].json;
    this.setState(
      {
        store: craig.store,
      },
      () => {
        this.saveAndSendNotification(
          message || `Project ${name} successfully imported`,
          true
        );
      }
    );
  }

  /**
   * deselect function for when project selection is to be cleared
   */
  onProjectDeselect() {
    // reset store project name and json
    craig.store.project_name = "";
    craig.store.json = new state().store.json;

    this.saveAndSendNotification(
      `Successfully cleared project selection`,
      true
    );
  }

  render() {
    window.localStorage.setItem("craigVisited", true);
    return !this.state.visited ? (
      <Tutorial />
    ) : (
      <>
        <NavigationRedirectModal craig={craig} />
        <PageTemplate
          hideCodeMirror={
            this.props.params.doc ||
            window.location.pathname === "/summary" ||
            window.location.pathname === "/projects"
              ? true
              : this.state.hideCodeMirror
          } // always hide if about
          hideFooter={this.state.hideFooter}
          toggleHide={this.toggleHide}
          json={craig.store.json}
          project={this.state.projects[this.state.store.project_name]}
          nav={this.props.craigRouter.nav}
          form={this.props.params.form}
          storeName={this.state.storeName}
          jsonInCodeMirror={this.state.jsonInCodeMirror}
          notifications={this.state.notifications}
          notify={this.notify}
          onTabClick={this.onTabClick}
          current_project={craig.store.project_name}
          invalidForms={invalidForms(craig)}
          craig={craig}
        >
          {this.props.params.doc ? (
            this.props.params.doc === "about" ? (
              <About />
            ) : this.props.params.doc === "json" ? (
              <JsonDocs />
            ) : (
              <ReleaseNotes />
            )
          ) : window.location.pathname === "/projects" ? (
            <Projects
              current_project={craig.store.project_name}
              projects={this.state.projects}
              new={this.newProject}
              save={this.onProjectSave}
              delete={this.onProjectDelete}
              select={this.onProjectSelect}
              deselect={this.onProjectDeselect}
              notify={this.notify}
              deleteDisabled={() => {
                return craig.store.json.resource_groups.length === 1;
              }}
            />
          ) : window.location.pathname === "/" ? (
            <Home craig={craig} />
          ) : window.location.pathname === "/summary" ? (
            <Summary
              craig={craig}
              onProjectSave={this.onProjectSave}
              projects={this.state.projects}
              nav={this.props.craigRouter.nav}
            />
          ) : window.location.pathname === "/form/cbr" ? (
            <CbrForm craig={craig} />
          ) : window.location.pathname === "/form/observability" ? (
            <ObservabilityForm craig={craig} />
          ) : this.props.params.form ? (
            <NewFormPage form={this.props.params.form} craig={craig} />
          ) : (
            // if no form yet, render name
            titleCase(this.props.params.form)
          )}
        </PageTemplate>
      </>
    );
  }
}

export default withRouter(Craig);
