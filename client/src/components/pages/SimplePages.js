import React from "react";
import { ToggleForm, StatefulTabPanel } from "icse-react-assets";
import PropTypes from "prop-types";
import toggleFormProps from "./ToggleFormPageProps";
import { Docs } from "icse-react-assets";
import { NoEdgeNetworkTile } from "../utils/NoEdgeNetworkTile";
const { docs } = require("../../lib");

export const ToggleFormPage = (props) => {
  return props.form === "f5" && props.craig.store.edge_pattern === undefined ? (
    <StatefulTabPanel
      name="F5 Big IP"
      hideFormTitleButton
      form={<NoEdgeNetworkTile />}
      about={RenderDocs("f5")()}
    />
  ) : (
    <ToggleForm {...toggleFormProps(props.form, props.craig)} />
  );
};

ToggleFormPage.propTypes = {
  form: PropTypes.string.isRequired,
};

/**
 * return render docs function
 * @param {string} field json field name
 * @returns {Function} function to display docs
 */
export function RenderDocs(field) {
  return function () {
    return Docs(docs[field]);
  };
}

// fine as is, not used in tab panel
export const EdgeNetworkingDocs = () => {
  return (
    <div className="marginBottomSmall">
      <p className="smallFontPatterns leftTextAlign">
        Need public internet access? With{" "}
        <a
          href="https://www.f5.com/trials/big-ip-virtual-edition"
          rel="noreferrer noopener"
          target="_blank"
        >
          F5 BIG-IP Virtual Edition
        </a>
        , users can create a full tunnel client-to-site{" "}
        <a
          href="https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-full-tunnel-vpn"
          rel="noreferrer noopener"
          target="_blank"
        >
          VPN
        </a>{" "}
        to connect you to your management VPC, and/or enable a{" "}
        <a
          href="https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-vpc-architecture-connectivity-waf-tutorial"
          rel="noreferrer noopener"
          target="_blank"
        >
          Web Application Firewall
        </a>{" "}
        (WAF) to allow consumers to connect to your workload VPC over the public
        internet.
      </p>
      <br />
      <p>
        Creating an Edge Network this way cannot be undone. Additional virtual
        networks can be created as needed.
      </p>
    </div>
  );
};
