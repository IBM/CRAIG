/* this file is the main application page */

import React from "react";
import { kebabCase, titleCase } from "lazy-z";
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
import { invalidForms, state, releaseNotes } from "./lib";
import { CbrForm, ObservabilityForm } from "./components/forms";
import { JsonDocs } from "./components/pages/JsonDocs";
import Tutorial from "./components/pages/tutorial/Tutorial";
import { notificationText } from "./lib/forms/utils";
import { TemplatePage } from "./components/pages/TemplatePage";
import { templates } from "./lib/constants";

import mixedJson from "./lib/docs/templates/slz-mixed.json";
import vsiJson from "./lib/docs/templates/slz-vsi.json";
import vsiEdgeJson from "./lib/docs/templates/slz-vsi-edge.json";
import powerJson from "./lib/docs/templates/power-sap-hana.json";

const templateNameToJsonMap = {
  Mixed: mixedJson,
  VSI: vsiJson,
  "VSI Edge": vsiEdgeJson,
  "Power VS SAP Hana": powerJson,
};

const withRouter = (Page) => (props) => {
  const params = useParams();
  return <Page {...props} params={params} />;
};

const craig = new state();

class Craig extends React.Component {
  constructor(props) {
    super(props);
    try {
      let storeName =
        process.env.NODE_ENV === "development" ? "craigDevStore" : "craigStore";
      let stateInStorage = window.localStorage.getItem(storeName);
      let projectInStorage = window.localStorage.getItem("craigProjects");
      // If there is a state in browser local storage, use it instead.
      if (stateInStorage) {
        craig.store = JSON.parse(stateInStorage);
      }
      if (!projectInStorage) {
        projectInStorage = "{}";
        window.localStorage.setItem("craigProjects", projectInStorage);
      }
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
  }

  // when react component mounts, set update callback for store
  // to update components
  componentDidMount() {
    craig.setUpdateCallback(() => {
      this.saveAndSendNotification();
    });
    craig.setErrorCallback(() => {
      this.onError();
    });
  }

  // update components
  saveAndSendNotification(message) {
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
        this.notify(notification);
      }
    );
  }

  onError() {
    let notification = {
      title: "Error",
      kind: "error",
      text: "An unexpected error has occurred.",
      timeout: 3000,
    };
    this.notify(notification);
  }

  /**
   * calls window.localStore.setItem
   * @param {*} storeName
   * @param {*} store
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
      json: new state().store.json,
      template: "Mixed",
    };
  }

  /**
   * save function for project
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject if true, set project as current project
   */
  onProjectSave(stateData, componentProps, setCurrentProject) {
    let now = Date.now();
    let kname = kebabCase(stateData.name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));

    projects[kname] = {
      name: stateData.name,
      description: stateData.description,
      json: stateData.json,
      last_save: now,
      template: stateData.template,
    };

    // if the project name is changing, remove the old key from projects object
    let nameChange = false;
    if (
      componentProps.data.name !== "" &&
      kname !== kebabCase(componentProps.data.name)
    ) {
      nameChange = true;
      delete projects[kebabCase(componentProps.data.name)];
    }

    // if template is changing
    if (
      componentProps.data.template !== "" &&
      stateData.template !== componentProps.data.template
    ) {
      projects[kname].json = templateNameToJsonMap[stateData.template];
      projects[kname].template = stateData.template;
    }

    window.localStorage.setItem("craigProjects", JSON.stringify(projects));
    this.setState({ projects: { ...projects } }, () => {
      if (setCurrentProject) {
        this.onProjectSelect(
          stateData.name,
          `Successfully saved project ${stateData.name}`
        );
      } else {
        // if the project name changed and that was our current project, update name
        if (
          nameChange &&
          craig.store.project_name === componentProps.data.name
        ) {
          craig.store.project_name = kname;
        }

        // hard set store if template changes and is current project
        // not needed when project is not selected since projects state is update with correct json and is then set when user makes project selection
        craig.hardSetJson(templateNameToJsonMap[stateData.template], true);

        this.saveAndSendNotification(
          `Successfully saved project ${stateData.name}`
        );
      }
    });
  }

  /**
   * delete function for project
   * @param {string} name project name
   */
  onProjectDelete(name) {
    let kname = kebabCase(name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));

    // remove from projects
    delete projects[kname];

    window.localStorage.setItem("craigProjects", JSON.stringify(projects));
    this.setState({ projects }, () => {
      this.saveAndSendNotification(`Successfully deleted project ${name}`);

      // deselect if project being deleted is currently selected
      if (craig.store.project_name === kname) {
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
    let kname = kebabCase(name);
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));

    // update store project name and json
    craig.store.project_name = kname;
    craig.store.json = projects[kname].json;
    this.saveAndSendNotification(
      message || `Project ${name} successfully imported`
    );
  }

  /**
   * deselect function for when project selection is to be cleared
   */
  onProjectDeselect() {
    // reset store project name and json
    craig.store.project_name = "";
    craig.store.json = new state().store.json;

    this.saveAndSendNotification(`Successfully cleared project selection`);
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
            this.props.params.doc || window.location.pathname === "/summary"
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
              templates={templates}
              new={this.newProject}
              save={this.onProjectSave}
              delete={this.onProjectDelete}
              select={this.onProjectSelect}
              deselect={this.onProjectDeselect}
              deleteDisabled={() => {
                return craig.store.json.resource_groups.length === 1;
              }}
            />
          ) : window.location.pathname === "/templates" ? (
            <TemplatePage craig={craig} />
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
