import { Button, Modal } from "@carbon/react";
import { deepEqual } from "lazy-z";
import React from "react";
import { ArrowRight, FolderAdd } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { DownloadCopyButtonSet } from "../utils/downloadCopyButtons/DownloadCopyButtonSet";
import { ProjectFormModal } from "../pages/projects/ProjectFormModal";
import { templates } from "../utils";
import { template_dropdown_map } from "../../lib/constants";

class NoProjectModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectModal: false,
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle() {
    this.setState({ projectModal: !this.state.projectModal });
  }

  render() {
    let existingData = deepEqual(
      this.props.craig.store.json._options,
      template_dropdown_map["Mixed"].template._options
    );
    return (
      <>
        {this.state.projectModal ? (
          <ProjectFormModal
            open
            data={{
              name: "",
              description: "",
              json: this.props.craig.store.json,
              template: "Empty Project",
              use_template: true,
            }}
            onClose={this.handleToggle}
            onSubmit={(stateData, componentProps) => {
              this.props.onProjectSave(stateData, componentProps, true);
              window.location.pathname = "/projects";
            }}
            projects={{}}
            nav={this.props.navigate}
            templates={templates}
            noProjectSave
          />
        ) : (
          <Modal
            className="cds--modal cds--modal-tall is-visible cds--modal--danger leftTextAlign"
            passiveModal
            danger
            alert
            preventCloseOnClickOutside
            modalHeading="No Project Selected"
          >
            <div className="marginBottomSmall">
              <p>
                No CRAIG project is selected. Create a new project or select an
                existing one from the <a href="/projects">Projects Page</a> to
                customize your environment.{" "}
              </p>
            </div>
            {existingData && (
              <div className="marginBottomSmall">
                <DownloadCopyButtonSet
                  json={this.props.craig.store.json}
                  disabled={false}
                  tertiaryDownload
                />
              </div>
            )}
            <div>
              {existingData && (
                <>
                  <Button
                    onClick={this.handleToggle}
                    renderIcon={FolderAdd}
                    className="marginRightMed"
                    iconDescription="Save as Project"
                    templates={templates}
                  >
                    Save as New Project
                  </Button>
                </>
              )}
              <Button
                onClick={() => (window.location.pathname = "/projects")}
                renderIcon={ArrowRight}
                kind={existingData ? "danger--tertiary" : undefined}
              >
                {existingData
                  ? "Continue to Projects Without Saving"
                  : "Projects Page"}
              </Button>
            </div>
          </Modal>
        )}
      </>
    );
  }
}

NoProjectModal.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  onProjectSave: PropTypes.func.isRequired,
};

export default NoProjectModal;
