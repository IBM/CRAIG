import { Button, Modal } from "@carbon/react";
import { deepEqual } from "lazy-z";
import React from "react";
import { formatConfig } from "../../lib";
import { ArrowRight, Copy } from "@carbon/icons-react";
import PropTypes from "prop-types";
import { template_dropdown_map } from "../../lib/constants";

export const NoProjectModal = (props) => {
  return (
    <Modal
      className="cds--modal cds--modal-tall is-visible cds--modal--danger leftTextAlign"
      passiveModal
      danger
      alert
      preventCloseOnClickOutside
      modalHeading="No Project Selected"
    >
      No CRAIG project is selected. Create a new project or select an existing
      one from the <a href="/projects">Projects Page</a> to customize your
      environment.{" "}
      {deepEqual(
        props.craig.store.json._options,
        template_dropdown_map["Mixed"].template._options
      ) && (
        <>
          <br />
          <br />
          CRAIG configurations not using a project will need to be imported.
        </>
      )}
      <br />
      <br />
      {deepEqual(
        props.craig.store.json._options,
        template_dropdown_map["Mixed"].template._options
      ) && (
        <Button
          kind="tertiary"
          renderIcon={Copy}
          className="modalButtonLeft"
          onClick={() =>
            navigator.clipboard.writeText(
              formatConfig(props.craig.store.json, true)
            )
          }
        >
          Copy JSON to Clipboard
        </Button>
      )}
      <Button
        onClick={() => (window.location.pathname = "/projects")}
        renderIcon={ArrowRight}
      >
        Projects Page
      </Button>
    </Modal>
  );
};

NoProjectModal.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};
