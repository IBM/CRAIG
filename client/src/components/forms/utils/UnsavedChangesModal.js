import React from "react";
import PropTypes from "prop-types";
import { Modal } from "@carbon/react";

/**
 * unsaved changes modal modal
 * @param {*} props
 * @param {string} props.name name of modal
 * @param {boolean} props.modalOpen true if open
 * @param {Function} props.onModalClose function for on close
 * @param {Function} props.onModalSubmit function for on submit
 */

export const UnsavedChangesModal = (props) => {
  let name = props.name;
  return (
    <div className="unsaved-changes-modal-area">
      <Modal
        id={props.name + "-unsaved-changes"}
        className="leftTextAlign"
        open={props.modalOpen}
        name={props.name}
        onRequestClose={props.onModalClose}
        onRequestSubmit={props.onModalSubmit}
        modalHeading={
          props.useDefaultUnsavedMessage
            ? "Missing Required Values"
            : "Unsaved Changes"
        }
        danger
        primaryButtonText="Dismiss Changes"
        secondaryButtonText="Cancel"
        size="md"
        alert
      >
        {props.useDefaultUnsavedMessage ? (
          <span>
            Resource {name} is missing required values.{" "}
            <strong>
              Without these values, your configuration is invalid.
            </strong>{" "}
            Are you sure you want to dismiss these changes?
          </span>
        ) : (
          <span>
            Resource {name} has unsaved changes. Are you sure you want to
            dismiss these changes?
          </span>
        )}
      </Modal>
    </div>
  );
};

UnsavedChangesModal.defaultProps = {
  modalOpen: false,
  useDefaultUnsavedMessage: true,
};

UnsavedChangesModal.propTypes = {
  name: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onModalSubmit: PropTypes.func.isRequired,
  useDefaultUnsavedMessage: PropTypes.bool,
};
