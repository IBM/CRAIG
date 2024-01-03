import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import PropTypes from "prop-types";

export const PowerSubnet = (props) => {
  return (
    <div
      style={{
        marginTop: "1rem",
        border: "2px solid #00882B",
        padding: "0.5rem",
        background: "#E6F0E2",
      }}
    >
      <div
        className="displayFlex"
        style={{ marginBottom: "0.75rem" }}
        onClick={props.onClick ? props.onClick : undefined}
      >
        <IbmCloudSubnets style={{ marginRight: "0.25rem" }} />
        <span
          style={{
            fontWeight: "bold",
            marginRight: "0.5rem",
          }}
        >
          {props.subnet.name}
        </span>
        <div>{props.subnet.pi_cidr}</div>
      </div>
      {props.children}
    </div>
  );
};

PowerSubnet.propTypes = {
  subnet: PropTypes.shape({
    name: PropTypes.string,
    pi_cidr: PropTypes.string,
  }).isRequired,
};
