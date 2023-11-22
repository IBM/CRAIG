import React from "react";
import {
  buildFormFunctions,
  DynamicToolTipWrapper,
  IcseFormGroup,
  RenderForm,
} from "icse-react-assets";
import {
  DynamicFormTextInput,
  DynamicFormSelect,
  DynamicFormToggle,
  DynamicTextArea,
  DynamicMultiSelect,
} from "./dynamic-form/components";
import { titleCase, eachKey, kebabCase } from "lazy-z";

class DynamicForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.data,
    };
    this.props.form.groups.forEach((group) => {
      eachKey(group, (field) => {
        if (!this.state[field]) this.state[field] = group[field].default || "";
      });
    });
    buildFormFunctions(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleInputChange(event) {
    let nextState = { ...this.state };
    let { name, value } = event.target;
    nextState[name] = value;
    this.props.form.groups.forEach((group) => {
      eachKey(group, (field) => {
        // run only when field is name
        if (group[field].onInputChange && name === field) {
          nextState[field] = group[field].onInputChange(nextState);
        }
      });
    });
    this.setState(nextState);
  }

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
                    className="labelRow marginBottomSelectTooltipWrapper"
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
