import React from "react";
import {
  buildFormFunctions,
  DynamicToolTipWrapper,
  IcseFormGroup,
  IcseHeading,
  RenderForm,
} from "icse-react-assets";
import {
  DynamicFormTextInput,
  DynamicFormSelect,
  DynamicFormToggle,
  DynamicTextArea,
  DynamicMultiSelect,
} from "./dynamic-form/components";
import { titleCase, eachKey, kebabCase, isBoolean, contains } from "lazy-z";

const doNotRenderFields = [
  "heading",
  "vpc_connections",
  "power_connections",
  "hideWhen",
];

class DynamicForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.data,
    };

    // set unfound parameters to data
    this.props.form.groups.forEach((group) => {
      eachKey(group, (field) => {
        // prevent `false` boolean values from populating
        if (
          !this.state[field] &&
          !isBoolean(this.state[field]) &&
          !contains(doNotRenderFields, field)
        )
          this.state[field] = group[field].default || "";
      });
    });

    // set default for fields that are not explicitly declared
    // ex. transit gateway connections
    if (this.props.form.setDefault) {
      eachKey(this.props.form.setDefault, (defaultKey) => {
        if (!this.state[defaultKey] && !isBoolean(this.state[defaultKey])) {
          this.state[defaultKey] = this.props.form.setDefault[defaultKey];
        }
      });
    }

    // import functionality to allow form to work with form template
    buildFormFunctions(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  /**
   * handle input change
   * @param {*} event
   */
  handleInputChange(event) {
    let nextState = { ...this.state };
    let { name, value } = event.target;
    nextState[name] = value;
    // for each form group
    this.props.form.groups.forEach((group) => {
      // for each item in that group
      eachKey(group, (field) => {
        if (group[field].onInputChange && name === field) {
          // if the item has onInputChange function, set field on next state
          // to that value
          nextState[field] = group[field].onInputChange(nextState);
        } else if (group[field].onStateChange && name === field) {
          // if the item has onStateChange function, run against whole
          // state copy
          group[field].onStateChange(nextState);
        }
      });
    });
    this.setState(nextState);
  }

  /**
   * handle toggle
   * @param {string} toggleName field name for toggle
   */
  handleToggle(toggleName) {
    this.setState({ [toggleName]: !this.state[toggleName] });
  }

  render() {
    let propsName = this.props.data?.name || "";
    // here for testing
    // console.log(JSON.stringify(this.state, null, 2));
    return (
      <div>
        {this.props.form.groups.map((group, index) =>
          group.hideWhen && group.hideWhen(this.state) ? (
            ""
          ) : group.heading ? (
            <IcseHeading
              name={group.heading.name}
              type={group.heading.type}
              key={"heading-" + group.heading.name}
            />
          ) : (
            <IcseFormGroup key={propsName + "-group-" + index}>
              {Object.keys(group).map((key, keyIndex) => {
                let field = group[key];
                return (field.hideWhen && field.hideWhen(this.state)) ||
                  key === "hideWhen" ? (
                  ""
                ) : (
                  <DynamicToolTipWrapper
                    isModal={this.props.isModal}
                    id={kebabCase(
                      `${propsName} input ${key} ${keyIndex} tooltip`
                    )}
                    tooltip={field.tooltip}
                    key={`${propsName} input ${key} ${keyIndex}`}
                    labelText={
                      field.labelText ? field.labelText : titleCase(key)
                    }
                  >
                    {RenderForm(
                      field.type === "select"
                        ? DynamicFormSelect
                        : field.type === "toggle"
                        ? DynamicFormToggle
                        : field.type === "textArea"
                        ? DynamicTextArea
                        : field.type === "multiselect"
                        ? DynamicMultiSelect
                        : DynamicFormTextInput,
                      {
                        name: key,
                        labelText: field.labelText,
                        propsName: propsName,
                        keyIndex: keyIndex,
                        field: field,
                        parentState: this.state,
                        parentProps: this.props,
                        handleInputChange:
                          field.type === "toggle"
                            ? this.handleToggle
                            : this.handleInputChange,
                      }
                    )}
                  </DynamicToolTipWrapper>
                );
              })}
            </IcseFormGroup>
          )
        )}
      </div>
    );
  }
}

export default DynamicForm;
