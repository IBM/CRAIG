import React from "react";
import { ClickableTile, Button } from "@carbon/react";
import { DeleteModal } from "icse-react-assets";
import { ProjectFormModal } from "./ProjectFormModal";
import { JSONModal } from "./JSONModal";
import { azsort } from "lazy-z";
import {
  Edit,
  TrashCan,
  StarFilled,
  Add,
  View,
  Star,
} from "@carbon/icons-react";
import "./project.css";

class Projects extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      viewJSONModalOpen: false,
      deleteModalOpen: false,
    };

    /* do not delete, for debugging */
    // this.state.debug = true

    this.toggleModal = this.toggleModal.bind(this);
    this.toggleViewJSONModal = this.toggleViewJSONModal.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(nextState) !== JSON.stringify(this.state)
    );
  }

  toggleModal() {
    this.setState({ modalOpen: !this.state.modalOpen });
  }

  toggleViewJSONModal() {
    this.setState({ viewJSONModalOpen: !this.state.viewJSONModalOpen });
  }

  toggleDeleteModal() {
    this.setState({ deleteModalOpen: !this.state.deleteModalOpen });
  }

  render() {
    return (
      <div className="projects">
        {this.state.modalOpen && (
          <ProjectFormModal
            open={this.state.modalOpen}
            data={this.state.modalData}
            onClose={this.toggleModal}
            onSubmit={this.props.save}
            projects={this.props.projects}
          />
        )}
        {this.state.viewJSONModalOpen && (
          <JSONModal
            open={this.state.viewJSONModalOpen}
            data={this.state.viewJSONModalData}
            onClose={this.toggleViewJSONModal}
            onSubmit={() => {
              this.toggleViewJSONModal();
            }}
          />
        )}
        {this.state.deleteModalOpen && (
          <DeleteModal
            modalOpen={this.state.deleteModalOpen}
            name={this.state.deleteProject}
            onModalClose={this.toggleDeleteModal}
            onModalSubmit={() => {
              this.props.delete(this.state.deleteProject);
              this.toggleDeleteModal();
            }}
          />
        )}
        <div className="header marginBottom">
          <div className="headerItem">
            <h1 className="bold">CRAIG</h1>
          </div>
          <div className="headerItem line">
            <p>Cloud Resource and Infrastructure-as-Code Generator</p>
          </div>
        </div>
        <div id="projects" className="body">
          <h3 className="marginBottomXs">Projects</h3>
          <p className="marginBottom">
            Create, deploy, and manage scalable infrastructure on IBM Cloud with
            CRAIG. Choose from the below saved Projects, import an existing
            configuration as a Project, or create a new configuration and save
            it as a Project to work on later.
          </p>
          <div className="marginBottomXs">
            <legend className="cds--label">Create a Project</legend>
            <Button
              id={"new-project"}
              kind="tertiary"
              className="newProjectButton"
              onClick={() => {
                this.setState({
                  modalData: this.props.new(),
                });
                this.toggleModal();
              }}
              iconDescription="Create new project"
              renderIcon={Add}
            >
              Create New Project
            </Button>
          </div>
          {/* hide projects section if there are none */}
          {Object.keys(this.props.projects).length > 0 && (
            <div className="projectTiles">
              <legend className="cds--label">Select a Project</legend>
              <div>
                {/* projects */}
                {Object.keys(this.props.projects)
                  .sort(azsort)
                  .map((kname) => {
                    return (
                      <ClickableTile
                        key={kname}
                        id={kname}
                        value={kname}
                        className={
                          "projectTile " +
                          (this.props.current_project === kname
                            ? "selected"
                            : "notSelected")
                        }
                        onClick={(event) => {
                          if (
                            !event.target.id.startsWith("edit") &&
                            !event.target.id.startsWith("delete") &&
                            !event.target.id.startsWith("view-json")
                          ) {
                            if (
                              // deselection only allowed when debug is true
                              this.props.current_project === kname &&
                              this.state.debug
                            ) {
                              this.props.deselect();
                            } else if (
                              // not already selected
                              this.props.current_project !== kname
                            ) {
                              this.props.select(
                                this.props.projects[kname].name
                              );
                            }
                          }
                        }}
                      >
                        {/* name */}
                        <div className="projectTileHeader marginBottom">
                          <h4 className="bold">
                            {this.props.projects[kname].name}
                          </h4>
                          {this.props.current_project === kname ? (
                            <StarFilled />
                          ) : (
                            <Star />
                          )}
                        </div>
                        {/* details */}
                        <div className="projectDetails marginBottom">
                          {this.props.projects[kname].description && (
                            <div className="marginBottomSmall">
                              <h3 className="smallerText marginBottomXs">
                                Description:
                              </h3>
                              <p className="smallerText italic">
                                {this.props.projects[kname].description}
                              </p>
                            </div>
                          )}
                          <div className="marginBottomXs">
                            <h3 className="smallerText marginBottomXs">
                              Last Saved:
                            </h3>
                            <p className="smallerText italic">
                              {new Date(
                                this.props.projects[kname].last_save
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {/* actions */}
                        <div>
                          <hr />
                          <h3 className="smallerText marginBottom">
                            Get Started with your project
                          </h3>
                          <Button
                            id={"edit-" + kname}
                            kind="tertiary"
                            className="projectTileButton marginBottomSmall"
                            onClick={() => {
                              this.setState({
                                modalData: this.props.projects[kname],
                              });
                              this.toggleModal();
                            }}
                            iconDescription="Edit Project Details"
                            renderIcon={Edit}
                          >
                            Edit Details
                          </Button>
                          <Button
                            id={"view-json-" + kname}
                            kind="tertiary"
                            className="projectTileButton marginBottomSmall"
                            onClick={() => {
                              this.setState({
                                viewJSONModalData: {
                                  name: this.props.projects[kname].name,
                                  json: this.props.projects[kname].json,
                                },
                              });
                              this.toggleViewJSONModal();
                            }}
                            iconDescription="View JSON"
                            renderIcon={View}
                          >
                            View JSON
                          </Button>
                          <Button
                            id={"delete-" + kname}
                            kind="danger--tertiary"
                            className="projectTileButton"
                            onClick={() => {
                              this.setState({
                                deleteProject: kname,
                              });
                              this.toggleDeleteModal();
                            }}
                            iconDescription="Delete Project"
                            renderIcon={TrashCan}
                          >
                            Delete Project
                          </Button>
                        </div>
                      </ClickableTile>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Projects;
