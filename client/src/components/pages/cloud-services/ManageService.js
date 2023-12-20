import { RenderForm } from "icse-react-assets";
import { titleCase } from "lazy-z";
import React from "react";
import PropTypes from "prop-types";

export const ManageService = (props) => {
  return (
    <div
      className={
        "manageService alignButtons" +
        (props.isSelected
          ? " serviceOpen"
          : props.resourceGroup === "No Resource Group"
          ? " noRgService"
          : "")
      }
      onClick={() =>
        props.onClick({
          service: props.service,
          resourceGroup: props.resourceGroup,
        })
      }
    >
      <div className="icon-div">
        {RenderForm(props.icon, { className: "big-icon" })}
      </div>
      <div className="icon-text">
        <h6>
          {titleCase(props.service.type)
            .replace("Appid", "AppID")
            .replace("Icd", "Cloud Database")
            .replace("Logdna", "LogDNA")}
        </h6>
        <p>{props.service.name}</p>
      </div>
    </div>
  );
};

ManageService.defaultProps = {
  isSelected: false,
};

ManageService.propTypes = {
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  icon: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  resourceGroup: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
};
