import { RenderForm } from "icse-react-assets";
import { contains, titleCase } from "lazy-z";
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
          : "") +
        " " +
        props.className
      }
      onClick={
        props.onClick
          ? () =>
              props.onClick({
                service: props.service,
                resourceGroup: props.resourceGroup,
              })
          : undefined
      }
    >
      <div className={props.small ? "" : "icon-div"}>
        {RenderForm(props.icon, {
          className: props.small ? "small-icon" : "big-icon",
        })}
      </div>
      {props.small ? (
        ""
      ) : (
        <div className="icon-text">
          <h6>
            {titleCase(props.service.type)
              .replace("Appid", "AppID")
              .replace("Icd", "Cloud Database")
              .replace("Atracker", "Activity Tracker")
              .replace("Logdna", "LogDNA")
              .replace(/Scc\s.+/g, "Security & Compliance Center")
              .replace(/Dns/g, "DNS")}
          </h6>
          <p>
            {contains(
              ["atracker", "logdna", "sysdig", "scc_v2"],
              props.service.name
            )
              ? ""
              : props.service.name}
          </p>
        </div>
      )}
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
  onClick: PropTypes.func,
  resourceGroup: PropTypes.string, // not required for atracker
  isSelected: PropTypes.bool.isRequired,
};
