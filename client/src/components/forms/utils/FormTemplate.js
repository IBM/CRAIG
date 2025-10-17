import React from "react";
import { contains, kebabCase } from "lazy-z";
import PropTypes from "prop-types";
import DynamicFormModal from "./DynamicFormModal";
import StatefulTabs from "./StatefulTabs";
import { CraigEmptyResourceTile } from "../dynamic-form";
import CraigToggleForm from "./ToggleForm";
import { RenderForm } from "./RenderForm";
import { disableSave } from "../../../lib";

class FormTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      shownArrayForms: [], // list of array forms to keep open on save
      shownChildForms: [], // list of child forms to keep open on save
    };
    this.onChildToggle = this.onChildToggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.shouldShow = this.shouldShow.bind(this);
    // add an array to track middle forms
    if (this.props.isMiddleForm) {
      this.props.arrayData.forEach(() => this.state.shownChildForms.push([]));
    }
  }

  /**
   * keep update forms open
   * @param {number} index index to keep open
   * @param {number=} childIndex optional child index
   */
  onChildToggle(index, childIndex) {
    if (this.props.parentToggle) {
      // if the parent toggle is passed, run the callback (this function on parent form)
      // with parent index and current index
      this.props.parentToggle.callback(this.props.parentToggle.index, index);
    } else if (arguments.length !== 1) {
      // if a second param is passed
      let shownChildForms = [...this.state.shownChildForms]; // all forms
      // if contains index
      if (contains(this.state.shownChildForms[index], childIndex)) {
        // remove index from list
        shownChildForms[index].splice(index, 1);
      } else {
        // otherwise add
        shownChildForms[index].push(childIndex);
      }
      this.setState({ shownChildForms: shownChildForms });
    } else {
      // if only parent index
      let shownForms = [...this.state.shownArrayForms]; // all forms
      if (contains(this.state.shownArrayForms, index)) {
        // remove if contains
        shownForms.splice(index, 1);
      } else shownForms.push(index);
      this.setState({ shownArrayForms: shownForms });
    }
  }

  /**
   * on modal submit
   * @param {*} data arbitrary data
   */
  onSubmit(data) {
    this.props.onSubmit(data, this.props);
    this.toggleModal();
  }

  /**
   * toggle modal on and off
   */
  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  /**
   * check if form should show
   * @returns {bool} if the child forms should show
   */
  shouldShow(index) {
    return this.props.parentToggle
      ? contains(
          this.props.parentToggle.shownChildren[this.props.parentToggle.index],
          index,
        ) // show children
      : contains(this.state.shownArrayForms, index);
  }

  render() {
    let formattedName = kebabCase(this.props.name); // formatted component name
    // enable submit field here is set to variable value to allow for passing to
    // child array components without needing to reference `this` directly
    let formModalProps = {
      ...this.props.innerFormProps,
      disableSave: disableSave,
      arrayParentName:
        this.props.arrayParentName || this.props.innerFormProps.arrayParentName,
      isModal: true,
      submissionFieldName: this.props.toggleFormProps.submissionFieldName,
      shouldDisableSubmit: function () {
        // references to `this` in function are intentionally vague
        // in order to pass the correct functions and field values to the
        // child modal component
        // by passing `this` in a function that it scoped to the component
        // we allow the function to be successfully bound to the modal form
        // while still referencing the local value `enableSubmitField`
        // to use it's own values for state and props including enableModal
        // and disableModal, which are dynamically added to the component
        // at time of render
        if (
          disableSave(
            this.props.submissionFieldName,
            this.state,
            this.props,
          ) === false
        ) {
          this.props.enableModal();
        } else {
          this.props.disableModal();
        }
      },
    };
    if (this.props.defaultModalValues) {
      formModalProps.data = { ...this.props.defaultModalValues };
    }
    // or templating like this is to allow for imported slz
    let arrayIsEmpty =
      (this.props.arrayData || []).length === 0 && this.props.overrideTile;
    let tabPanelClassName = this.props.subHeading
      ? "subHeading marginBottomSmall"
      : "";

    return (
      <div id={formattedName}>
        <StatefulTabs
          name={this.props.name}
          onClick={this.toggleModal}
          addText={this.props.addText}
          headingType={this.props.subHeading ? "subHeading" : ""}
          hideButtons={this.props.hideFormTitleButton}
          className={
            (this.props.arrayData || []).length === 0
              ? "subHeading"
              : tabPanelClassName
          }
          tooltip={this.props.tooltip}
          about={this.props.docs ? this.props.docs() : false}
          hideAbout={this.props.hideAbout}
          form={
            <>
              {arrayIsEmpty ? (
                this.props.overrideTile
              ) : (
                <CraigEmptyResourceTile
                  name={this.props.name}
                  show={(this.props.arrayData || []).length === 0}
                  className="marginTop1Rem"
                />
              )}

              {/* for each props passed into the array */}
              {(this.props.arrayData || []).map((data, index) => {
                // return a form with the index and props
                return (
                  <CraigToggleForm
                    {...this.props.toggleFormProps}
                    name={data[this.props.toggleFormFieldName]}
                    tabPanel={{
                      name: this.props.name,
                      hideAbout: true, // passed to ignore second tab panel
                      hasBuiltInHeading: true, // passed to ignore second tabPanel
                    }}
                    key={this.props.name + "-" + index}
                    overrideDynamicForm={this.props.innerForm}
                    innerFormProps={{
                      ...this.props.innerFormProps,
                      data: { ...data },
                    }} // merge data into innerForm props
                    arrayParentName={this.props.arrayParentName}
                    onShowToggle={this.onChildToggle}
                    onChildShowToggle={
                      this.props.isMiddleForm
                        ? this.onChildToggle // pass through to child component if middle form
                        : false
                    }
                    index={index}
                    show={this.shouldShow(index)}
                    shownChildren={this.state.shownChildForms}
                    onSave={this.props?.onSave}
                    onDelete={this.props?.onDelete}
                    deleteDisabled={this.props?.deleteDisabled}
                    deleteDisabledMessage={this.props?.deleteDisabledMessage}
                    isLast={index + 1 === this.props.arrayData.length}
                  />
                );
              })}
              <DynamicFormModal
                name={this.props.addText}
                show={this.state.showModal}
                onRequestSubmit={this.onSubmit}
                onRequestClose={this.toggleModal}
                arrayParentName={this.props.arrayParentName}
              >
                {
                  // render the form inside the modal
                  RenderForm(this.props.innerForm, formModalProps)
                }
              </DynamicFormModal>
            </>
          }
          hideFormTitleButton={this.props.hideFormTitleButton}
        />
      </div>
    );
  }
}

FormTemplate.defaultProps = {
  hideFormTitleButton: false,
  subHeading: false,
  arrayParentName: null,
  isMiddleForm: false,
  hideAbout: false,
  toggleFormFieldName: "name",
};

FormTemplate.propTypes = {
  name: PropTypes.string, // can be null
  arrayData: PropTypes.array.isRequired,
  parentToggle: PropTypes.shape({
    // used to track open and closed middle forms
    callback: PropTypes.func.isRequired,
    shownChildren: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
      .isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  addText: PropTypes.string,
  hideFormTitleButton: PropTypes.bool.isRequired,
  subHeading: PropTypes.bool.isRequired,
  docs: PropTypes.func, // only used on top level components
  tooltip: PropTypes.object, // used only for cos keys
  arrayParentName: PropTypes.string,
  isMiddleForm: PropTypes.bool.isRequired,
  innerFormProps: PropTypes.object.isRequired,
  toggleFormProps: PropTypes.object.isRequired,
  toggleFormFieldName: PropTypes.string.isRequired,
  hideAbout: PropTypes.bool,
  deleteDisabled: PropTypes.func,
  deleteDisabledMessage: PropTypes.string,
  overrideTile: PropTypes.node,
  defaultModalValues: PropTypes.shape({}),
};

export default FormTemplate;
