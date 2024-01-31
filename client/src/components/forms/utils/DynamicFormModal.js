import { Modal } from "@carbon/react";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { DynamicRender } from "./DynamicRender";

/**
 * Form Modal
 * @param {Object} props
 * @param {string} props.name the name of the modal
 * @param {Function} props.onRequestClose close modal function
 * @param {Function} props.onRequestSubmit submit function
 * @param {boolean} props.show show modal if true
 */
class DynamicFormModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: this.props.beginDisabled,
    };
    this.modalForm = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.disableModal = this.disableModal.bind(this);
    this.enableModal = this.enableModal.bind(this);
    this.setRefUpstream = this.setRefUpstream.bind(this);
  }

  /**
   * submit child data
   */
  handleSubmit() {
    let childData = this.modalForm.current.state;
    this.props.onRequestSubmit(childData);
  }

  /**
   * pass through ref to child component and force data to update
   * @param {*} childState
   */
  setRefUpstream(childState) {
    if (!this.modalForm.current) this.modalForm.current = {};
    this.modalForm.current.state = childState;
  }

  /**
   * disable modal
   */
  disableModal() {
    if (!this.state.isDisabled) this.setState({ isDisabled: true });
  }

  /**
   * enable modal
   */
  enableModal() {
    if (this.state.isDisabled) this.setState({ isDisabled: false });
  }

  render() {
    return (
      <DynamicRender
        hide={this.props.show === false}
        content={
          <Modal
            modalHeading={this.props.name}
            open={this.props.show}
            onRequestSubmit={this.handleSubmit}
            onRequestClose={this.props.onRequestClose}
            primaryButtonText="Submit"
            secondaryButtonText="Cancel"
            primaryButtonDisabled={this.state.isDisabled}
            preventCloseOnClickOutside
          >
            {this.props.show &&
              React.Children.map(this.props.children, (child) => {
                // this needs some cleanup
                // clone react child
                return React.cloneElement(child, {
                  // add modal specific methods
                  disableModal: this.disableModal,
                  enableModal: this.enableModal,
                  setRefUpstream: this.setRefUpstream,
                  isModal: true,
                  ref: this.modalForm,
                });
              })}
          </Modal>
        }
      />
    );
  }
}

DynamicFormModal.defaultProps = {
  show: false,
  beginDisabled: false,
};

DynamicFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onRequestSubmit: PropTypes.func.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  name: PropTypes.string, // undefined for loaded modal not rendered
  children: PropTypes.node.isRequired,
  beginDisabled: PropTypes.bool.isRequired,
};

export default DynamicFormModal;
