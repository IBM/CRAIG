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
import { LoadingModal } from "./components/pages/projects/LoadingModal";
import {
  getAndUpdateProjects,
  onProjectDeleteCallback,
  onProjectDeselect,
  onProjectSelectCallback,
  projectShouldCreateWorkspace,
  saveAndSendNotificationCallback,
  saveProjectCallback,
  updateNotification,
} from "./lib/craig-app";

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
        loadingModalOpen: false,
        loadingDone: false,
        schematicsFailed: false,
        clickedProject: "",
        clickedWorkspace: "",
        clickedWorkspaceUrl: "",
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
    this.toggleLoadingModal = this.toggleLoadingModal.bind(this);
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
   * @param {boolean=} footerToggle hide notification when toggling footer
   */
  saveAndSendNotification(message, noProjectSave, footerToggle) {
    this.setItem(this.state.storeName, craig.store);
    let projectData = JSON.parse(window.localStorage.getItem("craigProjects"));
    this.setState(
      {
        store: craig.store,
      },
      saveAndSendNotificationCallback(
        this,
        craig,
        projectData,
        updateNotification(window.location.pathname, message),
        noProjectSave,
        footerToggle
      )
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
   * get project from data
   * @param {*} stateData
   * @param {*} componentProps
   * @returns Projects and project key name
   */
  getProject(stateData, componentProps) {
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));
    return getAndUpdateProjects(
      projects,
      stateData,
      componentProps,
      Date.now()
    );
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
    this.setState(
      {
        clickedProject: projects[projectKeyName].name,
        clickedWorkspace: workspace_name,
        // fix data before retry
        loadingModalOpen: false,
        loadingDone: false,
        schematicsFailed: false,
      },
      () => {
        this.toggleLoadingModal();
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
              this.setState(
                {
                  loadingDone: true,
                  clickedWorkspaceUrl: projects[projectKeyName].workspace_url,
                },
                () => {
                  this.setItem("craigProjects", projects);
                  resolve();
                }
              );
            }
          })
          .catch((err) => {
            this.setState({ schematicsFailed: true, loadingDone: true });
            console.error(err);
            reject(err);
          });
      }
    );
  }

  /**
   * handle project save in state
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject
   */
  saveProject(stateData, componentProps, setCurrentProject) {
    let projects = this.getProject(stateData, componentProps);
    this.saveAndSendNotification(
      `Successfully saved project ${stateData.name}`,
      true
    );
    window.localStorage.setItem("craigProjects", JSON.stringify(projects));

    this.setState(
      { projects: { ...projects } },
      saveProjectCallback(
        this,
        craig,
        stateData,
        componentProps,
        setCurrentProject
      )
    );
  }

  /**
   * save function for project
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject if true, set project as current project
   */
  onProjectSave(stateData, componentProps, setCurrentProject) {
    let projects = this.getProject(stateData, componentProps);
    let projectKeyName = kebabCase(stateData.name);

    return new Promise((resolve, reject) => {
      if (
        !stateData.use_schematics ||
        !projectShouldCreateWorkspace(projects, stateData)
      ) {
        return resolve();
      } else
        return this.projectFetch(projects, projectKeyName, resolve, reject);
    })
      .then(() => {
        this.saveProject(stateData, componentProps, setCurrentProject);
      })
      .catch((err) => {
        this.setState(
          {
            loadingModalOpen: true,
            loadingDone: true,
            schematicsFailed: true,
          },
          () => {
            console.error(err);
            this.onError(`Create failed with error: ${err}`);
          }
        );
      });
  }

  /**
   * delete function for project
   * @param {string} name project name
   */
  onProjectDelete(name) {
    // get project data
    let projectKeyName = kebabCase(name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));
    // remove from projects
    delete projects[projectKeyName];
    window.localStorage.setItem("craigProjects", JSON.stringify(projects));
    this.setState({ projects }, onProjectDeleteCallback(this, craig, name));
  }

  /**
   * load function for when project is selected
   * @param {string} name project name
   * @param {string=} message message to be display in notification
   */
  onProjectSelect(name, message) {
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));
    let projectKeyName = kebabCase(name);
    // update store project name and json
    craig.store.project_name = projectKeyName;
    craig.store.json = projects[projectKeyName].json;

    this.setState(
      {
        store: craig.store,
      },
      onProjectSelectCallback(projects, this, craig, name, message)
    );
  }

  /**
   * deselect function for when project selection is to be cleared
   */
  onProjectDeselect() {
    onProjectDeselect(this, craig);
  }

  toggleLoadingModal() {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen,
      loadingDone: false,
      schematicsFailed: false,
    });
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
          onProjectSave={this.onProjectSave}
          saveAndSendNotification={this.saveAndSendNotification}
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
              onProjectSave={this.onProjectSave}
              onProjectDelete={this.onProjectDelete}
              onProjectSelect={this.onProjectSelect}
              onProjectDeselect={this.onProjectDeselect}
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
        {this.state.loadingModalOpen && (
          <LoadingModal
            className="alignItemsCenter"
            action="create"
            project={this.state.clickedProject}
            workspace={this.state.clickedWorkspace}
            open={this.state.loadingModalOpen}
            completed={this.state.loadingDone}
            workspace_url={this.state.clickedWorkspaceUrl}
            toggleModal={this.toggleLoadingModal}
            failed={this.state.schematicsFailed}
            // props for retry
            projects={this.state.projects}
            retryCallback={this.onProjectSave}
          />
        )}
      </>
    );
  }
}

export default withRouter(Craig);
