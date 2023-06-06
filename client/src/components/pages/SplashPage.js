import React from "react";
import "./about.scss";
import PropTypes from "prop-types";

const SplashPage = (props) => {
  return (
    <div id="what-is-craig" className={"section " + props?.className}>
      <CraigHeader />
      <div className="splash-text-container">
        <div className="infoPadding">
          <p className="marginBottom textContainer">
            Cloud Resource and Infrastructure-as-Code Generator (CRAIG) allows
            users to generate Infrastructure-as-Code (IaC) to create a fully
            customizable environment on IBM Cloud.
          </p>
          <p className="marginBottom textContainer">
            CRAIG simplifies the process of creating IaC through its GUI, which
            manages and updates interconnected resources as they are created.
          </p>
          <p className="textContainer">
            CRAIG configures infrastructure using JSON to create full VPC
            networks, manage security and networking with VSI deployments, and
            create services, clusters, and manage IAM for an IBM Cloud Account.
            This JSON configuration can be imported to quick start environments,
            and can be downloaded and edited as needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;

export const CraigHeader = (props) => {
  return (
    <div className={"header marginBottom " + props?.className}>
      <div className="headerItem">
        <h1 className="bold">CRAIG</h1>
      </div>
      <div className="headerItem line">
        <p>Cloud Resource and Infrastructure-as-Code Generator</p>
      </div>
    </div>
  );
};

CraigHeader.defaultProps = {
  className: "",
};

CraigHeader.propTypes = {
  className: PropTypes.string,
};
