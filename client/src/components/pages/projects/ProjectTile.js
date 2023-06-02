import React from "react";
import { Edit, TrashCan, StarFilled, View, Star } from "@carbon/icons-react";
import { ClickableTile, Button } from "@carbon/react";
import PropTypes from "prop-types";

export const ProjectTile = (props) => {
  let isCurrentProject = props.current_project === props.keyName;
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
        <h4 className="bold">{props.data.name}</h4>
        {isCurrentProject ? <StarFilled /> : <Star />}
      </div>
      {/* details */}
      <div className="projectDetails marginBottom">
        {props.data.description && (
          <div className="marginBottomSmall">
            <h3 className="smallerText marginBottomXs">Description:</h3>
            <p className="smallerText italic">{props.data.description}</p>
          </div>
        )}
        <div className="marginBottomXs">
          <h3 className="smallerText marginBottomXs">Last Saved:</h3>
          <p className="smallerText italic">
            {new Date(props.data.last_save).toLocaleString()}
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
          id={"edit-" + props.keyName}
          kind="tertiary"
          className="projectTileButton marginBottomSmall"
          onClick={props.onEditClick}
          iconDescription="Edit Project Details"
          renderIcon={Edit}
        >
          Edit Details
        </Button>
        <Button
          id={"view-json-" + props.keyName}
          kind="tertiary"
          className="projectTileButton marginBottomSmall"
          onClick={props.onViewClick}
          iconDescription="View JSON"
          renderIcon={View}
        >
          View JSON
        </Button>
        <Button
          id={"delete-" + props.keyName}
          kind="danger--tertiary"
          className="projectTileButton"
          onClick={props.onDeleteClick}
          iconDescription="Delete Project"
          renderIcon={TrashCan}
        >
          Delete Project
        </Button>
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
};
