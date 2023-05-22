import PropTypes from "prop-types";
import { Docs } from "icse-react-assets";
import React from "react";

const AddClusterRulesModalContent = (props) => {
  return (
    <>
      <p className="marginBottomSmall">
        Add cluster rules to ACL <strong>{props.addClusterRuleAcl}</strong>?
        Only rules with unique names will be added.
      </p>
      {Docs({
        content: [
          {
            table: [
              [
                "_headers",
                "Rule Name",
                "Action",
                "Direction",
                "Source",
                "Destination",
                "Protocol",
                "Port",
                "Unique Name",
              ],
              [
                "roks-create-worker-nodes-inbound",
                "Allow",
                "Inbound",
                "161.26.0.0/16",
                "10.0.0.0/8",
                "All",
                "",
                props.hasRuleName("roks-create-worker-nodes-inbound"),
              ],
              [
                "roks-create-worker-nodes-outbound",
                "Allow",
                "Outbound",
                "10.0.0.0/8",
                "161.26.0.0/16",
                "All",
                "",
                props.hasRuleName("roks-create-worker-nodes-outbound"),
              ],
              [
                "roks-nodes-to-service-inbound",
                "Allow",
                "Inbound",
                "166.8.0.0/14",
                "10.0.0.0/8",
                "All",
                "",
                props.hasRuleName("roks-nodes-to-service-inbound"),
              ],
              [
                "roks-nodes-to-service-outbound",
                "Allow",
                "Outbound",
                "166.8.0.0/14",
                "10.0.0.0/8",
                "All",
                "",
                props.hasRuleName("roks-nodes-to-service-outbound"),
              ],
              [
                "allow-app-incoming-traffic-requests",
                "Allow",
                "Inbound",
                "10.0.0.0/8",
                "10.0.0.0/8",
                "TCP",
                "30000-32767",
                props.hasRuleName("allow-app-incoming-traffic-requests"),
              ],
              [
                "allow-app-outgoing-traffic-requests",
                "Allow",
                "Outbound",
                "10.0.0.0/8",
                "10.0.0.0/8",
                "TCP",
                "30000-32767",
                props.hasRuleName("allow-app-outgoing-traffic-requests"),
              ],
              [
                "allow-lb-incoming-traffic-requests",
                "Allow",
                "Inbound",
                "10.0.0.0/8",
                "10.0.0.0/8",
                "TCP",
                "443",
                props.hasRuleName("allow-lb-incoming-traffic-requests"),
              ],
              [
                "allow-lb-outgoing-traffic-requests",
                "Allow",
                "Outbound",
                "10.0.0.0/8",
                "10.0.0.0/8",
                "TCP",
                "443",
                props.hasRuleName("allow-lb-outgoing-traffic-requests"),
              ],
            ],
          },
        ],
      })}
    </>
  );
};

AddClusterRulesModalContent.propTypes = {
  addClusterRuleAcl: PropTypes.string.isRequired,
  hasRuleName: PropTypes.func.isRequired,
};

export default AddClusterRulesModalContent;
