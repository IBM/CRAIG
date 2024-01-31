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

export const DeleteModal = (props) => {
  let name = <strong>{props.name}</strong>;
  return (
    <div className="unsaved-changes-modal-area">
      <Modal
        id={props.name + "-delete"}
        className="leftTextAlign"
        open={props.modalOpen}
        name={props.name}
        onRequestClose={props.onModalClose}
        onRequestSubmit={props.onModalSubmit}
        modalHeading={props.name}
        danger
        primaryButtonText="Delete Resource"
        secondaryButtonText="Cancel"
        size="md"
        alert
      >
        <span>
          You are about to delete {name}. This cannot be undone.
          {props.additionalText && (
            <div className="marginTop1Rem">{props.additionalText}</div>
          )}
        </span>
      </Modal>
    </div>
  );
};

DeleteModal.defaultProps = {
  modalOpen: false,
};

DeleteModal.propTypes = {
  name: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onModalSubmit: PropTypes.func.isRequired,
  additionalText: PropTypes.string,
};
