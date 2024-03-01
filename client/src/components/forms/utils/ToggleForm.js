import React from "react";
import PropTypes from "prop-types";
import { disableSave, propsMatchState } from "../../../lib";
import StatefulTabs from "./StatefulTabs";
import { StatelessFormWrapper } from "./StatelessFormWrapper";
import DynamicForm from "../DynamicForm";
import { CraigFormHeading } from "./CraigFormHeading";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import { DeleteModal } from "./DeleteModal";
import { PrimaryButton } from "./PrimaryButton";
import { RenderForm } from "./RenderForm";
import { DynamicRender } from "./DynamicRender";
import { SecondaryButton } from "./SecondaryButton";
import { Button } from "@carbon/react";
import { ArrowDown, ArrowUp } from "@carbon/icons-react";
import { contains } from "lazy-z";
import { CannotBeUndoneModal } from "./CannotBeUndoneModal";

class CraigToggleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: this.props.hide,
      showDeleteModal: false,
      showUnsavedChangeModal: false,
      disableSave: true,
      disableDelete: false,
      showChildren: true,
      showSubModal: false,
      propsMatchState: true,
      useDefaultUnsavedMessage: true,
      ruleOrderChange: false,
      showImportConfirmationModal: false,
    };

    this.toggleChildren = this.toggleChildren.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.toggleUnsavedChangeModal = this.toggleUnsavedChangeModal.bind(this);
    this.dismissChangesAndClose = this.dismissChangesAndClose.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.shouldDisableSave = this.shouldDisableSave.bind(this);
    this.shouldShow = this.shouldShow.bind(this);
    this.networkRuleOrderDidChange = this.networkRuleOrderDidChange.bind(this);
    this.toggleShowChildren = this.toggleShowChildren.bind(this);
    this.onToggleSubModal = this.onToggleSubModal.bind(this);
    this.dismissImportConfirmationChanges =
      this.dismissImportConfirmationChanges.bind(this);
    this.childRef = React.createRef();
  }

  /**
   * dismiss import confirmation changes
   */

  dismissImportConfirmationChanges() {
    this.setState({ showImportConfirmationModal: false });
  }

  /**
   * toggle sub modal
   */
  onToggleSubModal() {
    this.setState({ showSubModal: !this.state.showSubModal });
  }

  componentDidMount() {
    if (this.props.devMode) {
      console.log(this.props);
    }
    if (this.state.hide === true && this.shouldShow() === true) {
      this.setState({ hide: false });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.hide !== this.state.hide && this.props.onShowToggle) {
      this.props.onShowToggle(this.props.index);
    }
  }

  /**
   * toggle children rendered by form
   */
  toggleChildren() {
    if (this.childRef.current?.state) {
      let stateData = this.childRef.current.state;
      let componentProps = this.childRef.current.props;
      let propsDoNotMatch =
        propsMatchState(
          this.props.submissionFieldName,
          stateData,
          componentProps
        ) === false;
      if (propsDoNotMatch || this.state.useDefaultUnsavedMessage === false) {
        this.toggleUnsavedChangeModal();
      } else {
        this.setState({ hide: !this.state.hide });
      }
    } else {
      this.setState({ hide: !this.state.hide });
    }
  }

  /**
   * toggle delete modal
   */
  toggleDeleteModal() {
    this.setState({ showDeleteModal: !this.state.showDeleteModal });
  }

  /**
   * toggle unsaved changes modal
   */
  toggleUnsavedChangeModal() {
    this.setState({
      showUnsavedChangeModal: !this.state.showUnsavedChangeModal,
    });
  }

  /**
   * Dismiss changes and close
   */
  dismissChangesAndClose() {
    this.setState({
      showUnsavedChangeModal: false,
      hide: true,
    });
  }

  /**
   * on save
   */
  onSave() {
    if (
      this.props.submissionFieldName === "vpcs" &&
      this.childRef.current.state.use_data &&
      !this.childRef.current.props.data.use_data &&
      !this.state.showImportConfirmationModal
    ) {
      this.setState({ showImportConfirmationModal: true });
    } else {
      this.props.onSave(
        this.childRef.current.state,
        this.childRef.current.props
      );
      this.setState({
        useDefaultUnsavedMessage: true,
        showImportConfirmationModal: false,
      });
    }
  }

  /**
   * on delete
   */
  onDelete() {
    if (this.props.onShowToggle) this.props.onShowToggle(this.props.index);
    this.props.onDelete(
      this.childRef.current?.state,
      this.childRef.current?.props
    );
    this.setState({ hide: true, showDeleteModal: false });
  }

  /**
   * should disable save
   * @param {*} stateData state data
   * @param {*} componentProps component props
   */
  shouldDisableSave(stateData, componentProps) {
    let enableSave =
      disableSave(this.props.submissionFieldName, stateData, componentProps) ===
      false;
    let propsDoNotMatch =
      propsMatchState(
        this.props.submissionFieldName,
        stateData,
        componentProps
      ) === false;
    if (
      enableSave === false &&
      this.state.useDefaultUnsavedMessage &&
      propsDoNotMatch === false
    ) {
      this.setState({ useDefaultUnsavedMessage: false });
    } else if (enableSave && propsDoNotMatch && this.state.disableSave) {
      this.setState({ disableSave: false, propsMatchState: false });
    } else if (!this.state.disableSave && (!enableSave || !propsDoNotMatch)) {
      this.setState({ disableSave: true, propsMatchState: !propsDoNotMatch });
    }
  }

  shouldShow() {
    return this.props.forceOpen(this.state, this.props);
  }

  networkRuleOrderDidChange(didNotChange) {
    let didChange = !didNotChange;
    if (this.state.ruleOrderChange !== didChange) {
      this.setState({ ruleOrderChange: didChange });
    }
  }

  toggleShowChildren() {
    this.setState({ showChildren: !this.state.showChildren });
  }

  render() {
    if (this.props.noDeleteButton !== true && !this.props.onDelete) {
      throw new Error(
        `ToggleForm expects onDelete Function to be passed when a delete button is rendered`
      );
    }

    if (this.props.noSaveButton !== true && !this.props.onSave) {
      throw new Error(
        `ToggleForm expects onSave Function to be passed when a save button is rendered`
      );
    }

    return (
      <>
        <StatefulTabs
          hideHeading={false}
          about={this.props.about}
          {...(this.props.tabPanel ? this.props.tabPanel : {})}
          toggleShowChildren={this.toggleShowChildren}
          form={
            <>
              {this.props.name && !this.props.hideName ? (
                <CraigFormHeading name={this.props.name} hideButton />
              ) : (
                ""
              )}
              <div
                className={
                  this.props.aclClassicCraig
                    ? "subForm marginBottomNone"
                    : (this.props.type === "formInSubForm"
                        ? "formInSubForm positionRelative "
                        : "subForm ") +
                      (this.props.isLast ? "" : "marginBottomSmall") +
                      " " +
                      this.props.wrapperClassName
                }
              >
                <StatelessFormWrapper
                  hideTitle={this.props.hideTitle}
                  hide={this.state.hide}
                  iconType={this.props.useAddButton ? "add" : "edit"}
                  onIconClick={this.toggleChildren}
                  toggleFormTitle
                  alwaysShowButtons={
                    this.props.submissionFieldName === "acl_rules"
                  }
                  noMarginBottom={this.props.aclClassicCraig}
                  name={this.props.name}
                  hideIcon={this.props.hideChevron}
                  buttons={
                    contains(
                      ["acl_rules", "sg_rules"],
                      this.props.submissionFieldName
                    ) &&
                    !this.props.isModal &&
                    this.state.hide ? (
                      <>
                        <Button
                          aria-label={"rule-up-" + this.props.name}
                          key={"rule-up-" + this.props.name}
                          disabled={this.props.disableUp}
                          kind="ghost"
                          size="sm"
                          id={this.props.name + "-up"}
                          onClick={this.props.handleUp}
                          className="focus forceTertiaryButtonStyles marginRightSmall"
                        >
                          <ArrowUp key={"up-" + this.props.name} />
                        </Button>
                        <Button
                          aria-label={"rule-down-" + this.props.name}
                          kind="ghost"
                          disabled={this.props.disableDown}
                          key={"rule-down-" + this.props.name}
                          size="sm"
                          id={this.props.name + "-down"}
                          onClick={this.props.handleDown}
                          className="focus forceTertiaryButtonStyles"
                        >
                          <ArrowDown key={"down-" + this.props.name} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <DynamicRender
                          hide={this.props.addButtonAtFormTitle !== true}
                          content={
                            <PrimaryButton
                              name={this.props.name}
                              type="add"
                              onClick={this.onToggleSubModal}
                              noDeleteButton
                            />
                          }
                        />
                        {/* save / add button */}
                        <DynamicRender
                          hide={
                            this.props.noSaveButton ||
                            this.props.addButtonAtFormTitle
                          }
                          content={
                            <PrimaryButton
                              name={this.props.name}
                              onClick={this.onSave}
                              disabled={this.state.disableSave}
                              noDeleteButton={this.props.noDeleteButton}
                            />
                          }
                        />
                        {/* delete button */}
                        <DynamicRender
                          hide={this.props.noDeleteButton}
                          content={
                            <SecondaryButton
                              onClick={this.toggleDeleteModal}
                              name={this.props.name}
                              disabled={this.props.deleteDisabled({
                                ...this.props,
                                ...this.props.innerFormProps,
                              })}
                              disableDeleteMessage={
                                this.props.deleteDisabledMessage
                              }
                            />
                          }
                        />
                      </>
                    )
                  }
                >
                  <CannotBeUndoneModal
                    name={"Import VPC from Data"}
                    modalOpen={this.state.showImportConfirmationModal}
                    text={
                      <>
                        <span>
                          By selecting this option, data for your existing VPC{" "}
                          <code style={{ padding: "0.33rem", color: "blue" }}>
                            {this.props.name.replace(/\sVPC/g, "")}
                          </code>{" "}
                          will be dynamically retrieved by Terraform at run
                          time.
                        </span>
                        <br />
                        <br />
                        <span className="bold">
                          This will disable CRAIG managed subnets. This cannot
                          be undone
                        </span>
                      </>
                    }
                    onModalClose={this.dismissImportConfirmationChanges}
                    onModalSubmit={this.onSave}
                  />
                  {/* unsaved changes */}
                  <UnsavedChangesModal
                    name={
                      // use tab panel name if passed
                      this.props.name
                    }
                    modalOpen={this.state.showUnsavedChangeModal}
                    onModalClose={this.toggleUnsavedChangeModal}
                    onModalSubmit={this.dismissChangesAndClose}
                    useDefaultUnsavedMessage={
                      this.state.useDefaultUnsavedMessage
                    }
                  />
                  {/* delete resource */}
                  <DeleteModal
                    name={this.props.name}
                    additionalText={this.props.additionalText}
                    modalOpen={this.state.showDeleteModal}
                    onModalClose={this.toggleDeleteModal}
                    onModalSubmit={this.onDelete}
                  />
                  {RenderForm(this.props.overrideDynamicForm || DynamicForm, {
                    ...this.props.innerFormProps,
                    ref: this.props.nullRef ? null : this.childRef,
                    index: this.props.index,
                    shouldDisableSave: this.shouldDisableSave,
                    showSubModal: this.state.showSubModal,
                    networkRuleOrderDidChange: this.networkRuleOrderDidChange,
                    onChildShowToggle: this.props.onChildShowToggle,
                    shownChildren: this.props.shownChildren,
                    handleModalToggle: this.onToggleSubModal,
                    showSubModal: this.state.showSubModal,
                    isModal: this.props.isModal,
                    // this is an override to allow the
                    // parent form to be saved from a button inside the child form
                    saveFromChildForm: {
                      onSave: this.onSave,
                      disableSave: this.state.disableSave,
                    },
                    enableModal: this.props.enableModal,
                    disableModal: this.props.disableModal,
                    setRefUpstream: this.props.setRefUpstream,
                    dynamicSubnetFormSubForm: this.props.formInSubForm,
                    classicCraig: this.props.classicCraig,
                    isMiddleForm: this.props.isMiddleForm,
                  })}
                </StatelessFormWrapper>
              </div>
            </>
          }
        />
        {this.state.showChildren && this.props.children
          ? this.props.children
          : ""}
      </>
    );
  }
}

CraigToggleForm.defaultProps = {
  hide: true,
  unsavedChanges: false,
  index: 0,
  type: "subForm",
  nullRef: false,
  noDeleteButton: false,
  noSaveButton: false,
  useAddButton: false,
  hideName: false,
  // functions that return booleans must have a default
  deleteDisabled: () => {
    return false;
  },
  forceOpen: () => {
    return false;
  },
  hideChevron: false,
  hideTitle: false,
};

CraigToggleForm.propTypes = {
  name: PropTypes.string,
  hideName: PropTypes.bool.isRequired,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
  onShowToggle: PropTypes.func,
  index: PropTypes.number.isRequired,
  hide: PropTypes.bool.isRequired,
  submissionFieldName: PropTypes.string,
  forceOpen: PropTypes.func, // can be null
  deleteDisabled: PropTypes.func, // can be null
  disableDeleteMessage: PropTypes.func, // can be null
  type: PropTypes.string.isRequired,
  nullRef: PropTypes.bool.isRequired,
  innerFormProps: PropTypes.object, // can be null
  noDeleteButton: PropTypes.bool.isRequired,
  noSaveButton: PropTypes.bool.isRequired,
  useAddButton: PropTypes.bool.isRequired,
  tabPanel: PropTypes.shape({
    hideFormTitleButton: PropTypes.bool, // can be null
  }).isRequired,
  hideChevron: PropTypes.bool.isRequired,
  hideTitle: PropTypes.bool.isRequired,
  // this is currently only being used as part of the f5 big ip wrapper
  // to allow for toggle forms to be rendered inside one another
  overrideDynamicForm: PropTypes.func,
};

export default CraigToggleForm;
