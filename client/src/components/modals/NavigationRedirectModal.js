import React from "react";
import { Modal, Button } from "@carbon/react";
import PropTypes from "prop-types";
import "./NavigationRedirectModal.css";

export const NavigationRedirectModal = (props) => {
  let options = props.craig.store.json._options;
  let unsetOptions = [];
  // two ifs, we want both to occur separately
  if (options.region === "") unsetOptions.push("region");
  if (options.prefix === "") unsetOptions.push("prefix");

  return (
    <Modal
      id="nav-redirect-modal"
      modalHeading="Missing Required Environment Settings"
      className="leftTextAlign navigationRedirectModal"
      alert={true}
      danger={true}
      open={
        window.location.pathname === "/" ||
        window.location.pathname === "/resetState"
          ? false
          : unsetOptions.length > 0
      }
      passiveModal
    >
      <div className="marginBottomSmall">
        Uh oh! It looks like you haven't set a {unsetOptions.join(" or ")} yet.
        Use the options panel on the home page to set these values before
        continuing.
      </div>
      <div>
        <Button
          kind="primary"
          className="navigationRedirectModal"
          onClick={() => {
            window.location.pathname = "/";
          }}
        >
          Return to home page
        </Button>
      </div>
    </Modal>
  );
};

export default NavigationRedirectModal;

NavigationRedirectModal.propTypes = {
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        _options: PropTypes.shape({
          region: PropTypes.string.isRequired,
          prefix: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
