import React from "react";
import { Button } from "@carbon/react";
import { DeleteModal } from "icse-react-assets";
import { ProjectFormModal } from "./ProjectFormModal";
import { JSONModal } from "./JSONModal";
import { azsort } from "lazy-z";
import { Add } from "@carbon/icons-react";
import "./project.css";
import { ProjectTile } from "./ProjectTile";

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
    this.newProject = this.newProject.bind(this);
    this.onProjectSelect = this.onProjectSelect.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onViewClick = this.onViewClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
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

  newProject() {
    this.setState(
      {
        modalData: this.props.new(),
      },
      () => {
        this.toggleModal();
      }
    );
  }

  /**
   * on project select
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onProjectSelect(keyName) {
    return (event) => {
      if (
        !event.target.id.startsWith("edit") &&
        !event.target.id.startsWith("delete") &&
        !event.target.id.startsWith("view-json")
      ) {
        if (
          // deselection only allowed when debug is true
          this.props.current_project === keyName &&
          this.state.debug
        ) {
          this.props.deselect();
        } else if (
          // not already selected
          this.props.current_project !== keyName
        ) {
          this.props.select(this.props.projects[keyName].name);
        }
      }
    };
  }

  /**
   * on edit click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onEditClick(keyName) {
    return () => {
      this.setState(
        {
          modalData: this.props.projects[keyName],
        },
        () => {
          this.toggleModal();
        }
      );
    };
  }

  /**
   * on view click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onViewClick(keyName) {
    return () => {
      this.setState(
        {
          viewJSONModalData: {
            name: this.props.projects[keyName].name,
            json: this.props.projects[keyName].json,
          },
        },
        () => {
          this.toggleViewJSONModal();
        }
      );
    };
  }

  /**
   * on delete click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onDeleteClick(keyName) {
    return () => {
      this.setState(
        {
          deleteProject: keyName,
        },
        () => {
          this.toggleDeleteModal();
        }
      );
    };
  }

  render() {
    let projectKeys = Object.keys(this.props.projects).sort(azsort);
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
              id="new-project"
              kind="tertiary"
              className="newProjectButton"
              onClick={this.newProject}
              iconDescription="Create new project"
              renderIcon={Add}
            >
              Create New Project
            </Button>
          </div>
          {/* hide projects section if there are none */}
          {projectKeys.length > 0 && (
            <div className="projectTiles">
              <legend className="cds--label">Select a Project</legend>
              <div>
                {/* projects */}
                {projectKeys.map((keyName) => (
                  <ProjectTile
                    key={keyName}
                    keyName={keyName}
                    data={this.props.projects[keyName]}
                    current_project={this.props.current_project}
                    onProjectSelect={this.onProjectSelect(keyName)}
                    onEditClick={this.onEditClick(keyName)}
                    onViewClick={this.onViewClick(keyName)}
                    onDeleteClick={this.onDeleteClick(keyName)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Projects;
