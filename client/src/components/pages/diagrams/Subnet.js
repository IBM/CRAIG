import React from "react";
import { IbmCloudSubnets } from "@carbon/icons-react";
import PropTypes from "prop-types";

export const Subnet = (props) => {
  return (
    <div
      style={{
        border: "2px solid #00882B",
        margin: "0.5rem",
        padding: "0.5rem",
        width: "150px",
        background: "#E6F0E2",
        color: props.grayNames ? "gray" : undefined,
      }}
      key={props.subnet.name + props.vpc.name + props.acl?.name}
    >
      <div className="displayFlex" style={{ marginBottom: "0.75rem" }}>
        <IbmCloudSubnets style={{ marginRight: "0.25rem" }} />
        <span style={{ fontWeight: "bold" }}>{props.subnet.name}</span>
      </div>
      <div>{props.subnet.cidr}</div>
      <div
        style={{
          textAlign: "center",
        }}
      >
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            vpc: props.vpc,
            vpc_index: props.vpcIndex,
            acl: props.acl,
            craig: props.craig,
            subnet: props.subnet,
          })
        )}
      </div>
    </div>
  );
};

Subnet.propTypes = {
  grayNames: PropTypes.bool,
  subnet: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}).isRequired,
  ack: PropTypes.shape({}),
};
