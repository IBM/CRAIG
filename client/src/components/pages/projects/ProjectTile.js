import React from "react";
import {
  Edit,
  TrashCan,
  StarFilled,
  View,
  Star,
  Rocket,
  Add,
} from "@carbon/icons-react";
import { ClickableTile, Button } from "@carbon/react";
import { validate } from "../../../lib";
import PropTypes from "prop-types";

export const ProjectTile = (props) => {
  let isCurrentProject = props.current_project === props.keyName;
  let isValid = true;
  try {
    validate(props.data.json);
  } catch (error) {
    isValid = false;
  }
  return (
    <ClickableTile
      id={props.keyName}
      value={props.keyName}
      className={
        "projectTile " + (isCurrentProject ? "selected" : "notSelected")
      }
      onClick={props.onProjectSelect}
    >
      {/* name */}
      <div className="projectTileHeader marginBottom">
        <h4 className="bold">{props.data.project_name || props.data.name}</h4>
        {isCurrentProject ? <StarFilled /> : <Star />}
      </div>

      {/* details */}
      <div className="projectDetails marginBottomSmall">
        {props.data.description && (
          <div className="marginBottomSmall">
            <h6 className="marginBottomXs">Description</h6>
            <p className="smallerText">{props.data.description}</p>
          </div>
        )}

        <div className="marginBottomSmall">
          <h6 className="marginBottomXs">Template Pattern</h6>
          <p className="smallerText">
            {props.data.template || "Empty Project"}
          </p>
        </div>

        {props.data.workspace_url && props.data.workspace_name && (
          <div className="marginBottomSmall">
            <h6 className="marginBottomXs">Schematics Workspace</h6>
            <p className="smallerText">{props.data.workspace_name}</p>
          </div>
        )}
        <div>
          <h6 className="marginBottomXs">Last Saved</h6>
          <p className="smallerText">
            {new Date(props.data.last_save).toLocaleString()}
          </p>
        </div>
      </div>
      {/* actions */}
      <div>
        <hr className="marginBottom" />
        <div className="projectActions">
          <Button
            id={"edit-proj-" + props.keyName}
            kind="tertiary"
            className="projectButton"
            onClick={props.onEditClick}
            iconDescription="Edit Project Details"
            renderIcon={Edit}
          >
            Edit Project Details
          </Button>
          <Button
            id={"view-json-" + props.keyName}
            kind={isValid ? "tertiary" : "danger--tertiary"}
            className="projectButton"
            onClick={props.onViewClick}
            iconDescription="View Configuration"
            renderIcon={View}
          >
            {isValid ? "View Configuration" : "Review Configuration"}
          </Button>
          {props.data.workspace_url ? (
            <Button
              id={"schematics-upload-" + props.keyName}
              kind="tertiary"
              className="projectButton"
              onClick={props.onSchematicsUploadClick}
              iconDescription="Upload to Schematics"
              renderIcon={Rocket}
              disabled={isValid ? false : true}
            >
              Upload to Schematics
            </Button>
          ) : (
            <Button
              id={"schematics-create-" + props.keyName}
              kind="tertiary"
              className="projectButton"
              onClick={props.onCreateWorkspaceClick}
              iconDescription="Create Schematics Workspace"
              renderIcon={Add}
              disabled={isValid ? false : true}
            >
              Create Workspace
            </Button>
          )}
          <Button
            id={"delete-proj" + props.keyName}
            kind="danger--tertiary"
            className="projectButton"
            onClick={props.onDeleteClick}
            iconDescription="Delete Project"
            renderIcon={TrashCan}
          >
            Delete Project
          </Button>
        </div>
      </div>
    </ClickableTile>
  );
};

ProjectTile.propTypes = {
  keyName: PropTypes.string.isRequired,
  current_project: PropTypes.string,
  onProjectSelect: PropTypes.func.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    last_save: PropTypes.number,
  }).isRequired,
  onEditClick: PropTypes.func.isRequired,
  onViewClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSchematicsUploadClick: PropTypes.func.isRequired,
  onCreateWorkspaceClick: PropTypes.func.isRequired,
};
