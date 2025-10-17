/* this file is the main application page */

import React from "react";
import {
  kebabCase,
  titleCase,
  contains,
  distinct,
  splatContains,
  getObjectFromArray,
  eachKey,
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
  PageNotFound,
} from "./components";
import { invalidForms, state } from "./lib";
import { ObservabilityForm } from "./components/forms";
import { JsonDocs } from "./components/pages/JsonDocs";
import Stats from "./components/pages/Stats";
import Tutorial from "./components/pages/tutorial/Tutorial";
import {
  LoadingModal,
  ValidationModal,
} from "./components/pages/projects/LoadingModal";
import {
  getAndUpdateProjects,
  onProjectDeleteCallback,
  onProjectDeselect,
  onProjectSelectCallback,
  projectFetch,
  projectShouldCreateWorkspace,
  saveAndSendNotificationCallback,
  saveProjectCallback,
  updateNotification,
} from "./lib/craig-app";
import { CloudServicesPage } from "./components/pages/cloud-services";
import VpcDiagramPage from "./components/pages/vpc/Vpc.js";
import VpcDeploymentsDiagramPage from "./components/pages/vpc/VpcDeployments.js";
import { Overview } from "./components/pages/diagrams/Overview.js";
import PowerDiagram from "./components/pages/power/Power.js";
import VpcConnectivityPage from "./components/pages/vpc/Connectivity.js";
import ClassicDiagram from "./components/pages/classic/Classic.js";
import * as htmlToImage from "html-to-image";
import FileSaver from "file-saver";

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
        current_project: craig.store.project_name,
        showOverviewForDownload: false,
        workspaceAction: "create",
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
    this.showAndSnapshot = this.showAndSnapshot.bind(this);
    this.afterValidation = this.afterValidation.bind(this);
    this.removeInvalidReferences = this.removeInvalidReferences.bind(this);
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

  showAndSnapshot(callback) {
    this.setState({ showOverviewForDownload: true }, () => {
      htmlToImage
        .toBlob(document.getElementById("overview-big"))
        .then(function (blob) {
          callback(blob);
        })
        .then(() => {
          this.setState({ showOverviewForDownload: false });
        });
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
        footerToggle,
      ),
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
      Date.now(),
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
        workspaceAction: "create",
      },
      () => {
        this.toggleLoadingModal();
        return projectFetch(
          fetch,
          {
            workspace_name,
            workspace_region,
            workspace_resource_group,
          },
          reject,
          // project resolve callback
          (url) => {
            projects[projectKeyName].workspace_url = url;
            this.setState(
              {
                loadingDone: true,
                clickedWorkspaceUrl: projects[projectKeyName].workspace_url,
              },
              () => {
                this.setItem("craigProjects", projects);
                resolve();
              },
            );
          },
          // project reject callback
          (err) => {
            this.setState({
              schematicsFailed: true,
              loadingDone: true,
              workspaceAction: "create",
            });
            console.error(err);
          },
        );
      },
    );
  }

  /**
   * handle project save in state
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject
   * @param {Function} callback
   */
  saveProject(stateData, componentProps, setCurrentProject, callback) {
    let projects = this.getProject(stateData, componentProps);
    this.saveAndSendNotification(
      `Successfully saved project ${stateData.name}`,
      true,
    );
    window.localStorage.setItem("craigProjects", JSON.stringify(projects));

    this.setState(
      { projects: { ...projects } },
      saveProjectCallback(
        this,
        craig,
        stateData,
        componentProps,
        setCurrentProject,
        callback,
      ),
    );
  }

  /**
   * save function for project
   * @param {*} stateData
   * @param {*} componentProps
   * @param {boolean} setCurrentProject if true, set project as current project
   * @param {Function} callback
   */
  onProjectSave(stateData, componentProps, setCurrentProject, callback) {
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
        this.saveProject(
          stateData,
          componentProps,
          setCurrentProject,
          callback,
        );
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
          },
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
   * @param {Function} callback
   */
  onProjectSelect(name, message, callback) {
    let projects = JSON.parse(window.localStorage.getItem("craigProjects"));
    let projectKeyName = kebabCase(name);
    let invalidItems = {
      vsi: [],
      clusters: [],
      power_images: [],
    };
    // update store project name and json
    craig.store.project_name = projectKeyName;
    craig.store.json = projects[projectKeyName].json;
    this.setState({ current_project: projectKeyName }, () => {
      // callback function for when fetch tasks are complete
      let updateCheckDone = () => {
        this.setState(
          {
            store: craig.store,
          },
          onProjectSelectCallback(projects, this, craig, name, message, () => {
            if (callback) callback(invalidItems);
          }),
        );
      };

      // should check components for update
      let componentsShouldUpdate =
        craig.store.json.vsi.length > 0 ||
        craig.store.json.clusters.length > 0 ||
        craig.store.json.power.length > 0;

      // if components need to be updated
      if (componentsShouldUpdate) {
        let completedTasks = 0;
        let tasks = 0;
        let powerZones = [];
        let dataPowerWorkspaces = [];

        // callback function to run when fetch complete
        let completeTasks = () => {
          completedTasks++;
          if (completedTasks === tasks) {
            updateCheckDone();
          }
        };

        // add number of tasks based on checks that need to be made
        if (craig.store.json.vsi.length > 0) tasks++;
        if (craig.store.json.clusters.length > 0) tasks++;
        if (craig.store.json.power.length > 0) {
          craig.store.json.power.forEach((workspace) => {
            if (!workspace.use_data) {
              powerZones = distinct(powerZones.concat(workspace.zone));
            } else {
              dataPowerWorkspaces.push({
                zone: workspace.zone,
                name: workspace.name,
              });
            }
          });
          tasks += powerZones.length;
          tasks += dataPowerWorkspaces.length;
        }

        if (craig.store.json.power.length > 0) {
          dataPowerWorkspaces.forEach((workspace) => {
            fetch(`/api/power/${workspace.zone}/images?name=${workspace.name}`)
              .then((res) => res.json())
              .then((foundImages) => {
                let powerWorkspace = getObjectFromArray(
                  craig.store.json.power,
                  "name",
                  workspace.name,
                );
                powerWorkspace.images.forEach((image) => {
                  if (
                    !splatContains(
                      foundImages,
                      "imageID",
                      image.imageID || image.pi_image_id,
                    )
                  ) {
                    invalidItems.power_images.push({
                      workspace: workspace.name,
                      image: image.name,
                      zone: workspace.zone,
                    });
                  }
                });
                completeTasks();
              })
              .catch((err) => {
                console.error("Error fetching Power VS images\n\n", err);
                completeTasks();
              });
          });

          powerZones.forEach((zone) => {
            fetch(`/api/power/${zone}/images`)
              .then((res) => res.json())
              .then((foundImages) => {
                craig.store.json.power.forEach((workspace) => {
                  workspace.images.forEach((image) => {
                    if (
                      !splatContains(
                        foundImages,
                        "imageID",
                        image.imageID || image.pi_image_id,
                      ) &&
                      !workspace.use_data &&
                      workspace.zone === zone
                    ) {
                      invalidItems.power_images.push({
                        workspace: workspace.name,
                        image: image.name,
                        zone: workspace.zone,
                      });
                    }
                  });
                  workspace.imageNames.forEach((name) => {
                    if (
                      !splatContains(foundImages, "name", name) &&
                      !workspace.use_data &&
                      workspace.zone === zone
                    ) {
                      invalidItems.power_images.push({
                        workspace: workspace.name,
                        image: name,
                        zone: workspace.zone,
                      });
                    }
                  });
                });
                completeTasks();
              })
              .catch((err) => {
                console.error("Error fetching Power VS images\n\n", err);
                completeTasks();
              });
          });
        }
        if (craig.store.json.clusters.length > 0) {
          // get cluster versions
          fetch("/api/cluster/versions")
            .then((res) => res.json())
            .then((data) => {
              // replace ` (Default)`
              let versions = data.map((item) => {
                return item.replace(/\s.+/g, "");
              });
              craig.store.json.clusters.forEach((cluster) => {
                // if cluster has a kube version and the version is not returned by the API call
                // add to list
                if (
                  !contains(versions, cluster.kube_version) &&
                  cluster.kube_version
                ) {
                  invalidItems.clusters.push({
                    cluster: cluster.name,
                    kube_version: cluster.kube_version,
                  });
                }
              });
              completeTasks();
            })
            .catch((err) => {
              console.error("Error fetching cluster versions\n\n", err);
              completeTasks();
            });
        }

        if (craig.store.json.vsi.length > 0) {
          // get vsi image names
          fetch(craig.vsi.image_name.apiEndpoint({}, { craig: craig }))
            .then((res) => res.json())
            .then((data) => {
              craig.store.json.vsi.forEach((vsi) => {
                // if vsi has an image name and this image is not returned by the API call
                // add to list
                if (!contains(data, vsi.image_name) && vsi.image_name) {
                  invalidItems.vsi.push({
                    vsi: vsi.name,
                    image: vsi.image_name,
                  });
                }
              });
            })
            .then(() => {
              completeTasks();
            })
            .catch((err) => {
              console.error("Error fetching VSI images\n\n", err);
              completeTasks();
            });
        }
      } else updateCheckDone();
    });
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

  /**
   * on validation modal done
   * @param {*} invalidItems
   */
  afterValidation(invalidItems) {
    let noItemsInvalid = true;
    // if any arrays in the map of invalid items have a name contained within
    // set to false
    eachKey(invalidItems, (item) => {
      if (invalidItems[item].length > 0) {
        noItemsInvalid = false;
      }
    });
    // if no items are invalid, hide modal. otherwise save invalid items to state
    if (noItemsInvalid)
      this.setState({
        showValidationModal: false,
        loadingModalOpen: false,
        awaitingValidation: false,
      });
    else
      this.setState({
        invalidItems,
        awaitingValidation: false,
        showValidationModal: true,
        loadingModalOpen: false,
      });
  }

  /**
   * remove invalid references
   */
  removeInvalidReferences() {
    // for each item that is checked
    eachKey(this.state.invalidItems, (item) => {
      if (item === "power_images") {
        craig.store.json.power.forEach((workspace) => {
          if (
            // if the workspace is in the list of invalid items
            splatContains(
              this.state.invalidItems.power_images,
              "workspace",
              workspace.name,
            )
          ) {
            // get a list of image objects for this workspace
            let workspaceImages = this.state.invalidItems.power_images.filter(
              (image) => {
                if (image.workspace === workspace.name) {
                  return image;
                }
              },
            );

            // set image names to filter out images
            workspace.imageNames = workspace.imageNames.filter((name) => {
              if (!splatContains(workspaceImages, "image", name)) {
                return name;
              }
            });

            // remove references in instances to unfound images
            craig.store.json.power_instances.forEach((instance) => {
              if (
                instance.workspace === workspace.name &&
                !contains(workspace.imageNames, instance.image)
              ) {
                instance.image = null;
              }
            });
          }
        });
      } else {
        // for each item in the json store field
        craig.store.json[item].forEach((resource) => {
          // if the resource name is contained in the list of invalid items
          // set the reference to null
          if (
            item === "vsi"
              ? splatContains(
                  this.state.invalidItems[item],
                  "vsi",
                  resource.name,
                )
              : contains(this.state.invalidItems[item], resource.name)
          ) {
            if (item === "vsi" && resource.image_name) {
              resource.image_name = null;
              resource.image = null;
            } else if (item === "clusters" && resource.kube_version) {
              resource.kube_version = null;
            }
          }
        });
      }
    });
    // reset invalid items and hide validation modal
    this.setState({ invalidItems: {}, showValidationModal: false }, () => {
      // force update state store to ensure changes are saved
      craig.update();
      window.location.reload();
    });
  }

  render() {
    window.localStorage.setItem("craigVisited", true);
    return !this.state.visited ? (
      <Tutorial />
    ) : (
      <>
        {this.state.showOverviewForDownload ? (
          // this is only shown when getting an image for the screengrab,
          // otherwise will not be rendered
          // the first div is a container for the overview image
          // the second div is there to mask the first while creting the image
          <>
            <div
              id="hide-me"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: "-1000",
              }}
            >
              <Overview craig={craig} imagePadding />
            </div>
            <div
              id="overview-front"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: "-999",
                height: "100%",
                width: "100%",
                backgroundColor: "white",
              }}
            ></div>
          </>
        ) : (
          ""
        )}
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
          current_project={this.state.current_project}
          invalidForms={invalidForms(craig)}
          craig={craig}
          onProjectSave={this.onProjectSave}
          saveAndSendNotification={this.saveAndSendNotification}
          beta={this.props.params.v2Page}
          showAndSnapshot={this.showAndSnapshot}
          onValidationClick={() => {
            this.setState(
              { loadingModalOpen: true, awaitingValidation: true },
              () => {
                this.onProjectSelect(
                  this.state.projects[this.state.store.project_name]
                    .project_name,
                  "",
                  this.afterValidation,
                );
              },
            );
          }}
        >
          {this.state.showValidationModal && (
            <ValidationModal
              invalidItems={this.state.invalidItems}
              afterValidation={() => {
                this.setState({
                  showValidationModal: false,
                  invalidItems: {},
                });
              }}
              removeInvalidReferences={this.removeInvalidReferences}
            />
          )}
          {this.props.params.doc ? (
            this.props.params.doc === "about" ? (
              <About />
            ) : this.props.params.doc === "json" ? (
              <JsonDocs />
            ) : this.props.params.doc === "releaseNotes" ? (
              <ReleaseNotes />
            ) : (
              <PageNotFound />
            )
          ) : window.location.pathname === "/projects" ||
            window.location.pathname === "/v2/projects" ||
            window.location.pathname === "/v2" ? (
            <Projects
              craig={craig}
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
          ) : window.location.pathname === "/" ||
            window.location.pathname === "/v2/settings" ? (
            <Home craig={craig} />
          ) : window.location.pathname === "/summary" ? (
            <Summary
              craig={craig}
              onProjectSave={this.onProjectSave}
              projects={this.state.projects}
              nav={this.props.craigRouter.nav}
            />
          ) : window.location.pathname === "/v2/services" ? (
            <CloudServicesPage craig={craig} />
          ) : window.location.pathname === "/v2/vpc" ? (
            <VpcDiagramPage craig={craig} />
          ) : window.location.pathname === "/v2/vpcDeployments" ? (
            <VpcDeploymentsDiagramPage craig={craig} />
          ) : window.location.pathname === "/v2/connectivity" ? (
            <VpcConnectivityPage craig={craig} />
          ) : window.location.pathname === "/v2/power" ? (
            <PowerDiagram craig={craig} />
          ) : window.location.pathname === "/v2/classic" ? (
            <ClassicDiagram craig={craig} />
          ) : window.location.pathname === "/v2/overview" ? (
            <Overview craig={craig} />
          ) : window.location.pathname === "/form/observability" ? (
            <ObservabilityForm craig={craig} />
          ) : window.location.pathname === "/stats" ? (
            <Stats craig={craig} />
          ) : window.location.pathname === "/v2/stats" ? (
            <Stats craig={craig} />
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
            action={this.state.workspaceAction}
            project={this.state.clickedProject}
            workspace={this.state.clickedWorkspace}
            workspace_url={this.state.clickedWorkspaceUrl}
            open={this.state.loadingModalOpen}
            completed={this.state.loadingDone}
            toggleModal={this.toggleLoadingModal}
            // props for retry
            projects={this.state.projects}
            failed={this.state.schematicsFailed}
            retryCallback={() => {}}
            customHeading={
              this.state.awaitingValidation ? "Validating Images" : undefined
            }
          />
        )}
      </>
    );
  }
}

export default withRouter(Craig);
