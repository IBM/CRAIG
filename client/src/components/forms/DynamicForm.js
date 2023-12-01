import React from "react";
import {
  buildFormFunctions,
  DynamicToolTipWrapper,
  IcseFormGroup,
  IcseFormTemplate,
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
import { eachKey, isBoolean, contains } from "lazy-z";
import { propsMatchState } from "../../lib";
import {
  ClassicDisabledTile,
  NoClassicGatewaysTile,
} from "./dynamic-form/tiles";
import {
  dynamicIcseFormGroupsProps,
  dynamicIcseHeadingProps,
  dynamicToolTipWrapperProps,
} from "../../lib/forms/dynamic-form-fields";
import { Network_3 } from "@carbon/icons-react";

const doNotRenderFields = [
  "heading",
  "vpc_connections",
  "power_connections",
  "hideWhen",
  "pgw_zone_1",
  "pgw_zone_2",
  "pgw_zone_3",
  "ip_address",
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
    this.handleOverrideInputChange = this.handleOverrideInputChange.bind(this);
  }

  /**
   * handle override input changes
   * @param {*} nextState shallow copy of state
   * @param {string} targetName name of the target data
   * @param {*} targetData data for target
   * @returns {boolean} true if changes were made
   */
  handleOverrideInputChange(nextState, targetName, targetData) {
    let madeChanges = false;
    this.props.form.groups.forEach((group) => {
      // for each item in that group
      eachKey(group, (field) => {
        if (group[field].onInputChange && targetName === field) {
          // if the item has onInputChange function, set field on next state
          // to that value
          nextState[field] = group[field].onInputChange(nextState, targetData);
          madeChanges = true;
        } else if (group[field].onStateChange && targetName === field) {
          // if the item has onStateChange function, run against whole
          // state copy
          group[field].onStateChange(nextState, this.props);
          madeChanges = true;
        }
      });
    });
    // return to override toggle setstate
    return madeChanges;
  }

  /**
   * handle input change
   * @param {*} event
   */
  handleInputChange(event) {
    let nextState = { ...this.state };
    let { name, value } = event.target;

    // prevent setting data for power vs instance network & ips
    if (name !== "network" && name.match(/^ip_address_\d$/g) === null) {
      nextState[name] = value;
    }

    // update power ip address in nested component, target for future refactor
    if (name.match(/^ip_address_\d$/g) !== null) {
      let nw = [...this.state.network];
      let index = parseInt(name.replace(/\D+/g, ""));
      let item = { ...nw[index] };
      item.ip_address = value;
      nw[index] = item;
      nextState.network = nw;
    } else this.handleOverrideInputChange(nextState, name, value);
    this.setState(nextState);
  }

  /**
   * handle toggle
   * @param {string} toggleName field name for toggle
   */
  handleToggle(toggleName) {
    let nextState = { ...this.state };
    let madeChanges = this.handleOverrideInputChange(nextState, toggleName);
    if (madeChanges) {
      this.setState(nextState);
    } else this.setState({ [toggleName]: !this.state[toggleName] });
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
            <IcseHeading {...dynamicIcseHeadingProps(group)} />
          ) : (
            <IcseFormGroup {...dynamicIcseFormGroupsProps(this.props, index)}>
              {Object.keys(group).map((key, keyIndex) => {
                let field = group[key];
                return (field.hideWhen && field.hideWhen(this.state)) ||
                  key === "hideWhen" ? (
                  ""
                ) : (
                  <DynamicToolTipWrapper
                    {...dynamicToolTipWrapperProps(
                      this.props,
                      key,
                      keyIndex,
                      field
                    )}
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
        {
          // this is less than elegant, as we add more custom components we can
          // figure out the best way to render custom components
          this.props.formName === "Power Instances" && (
            <div className="formInSubForm">
              {this.state.network.length === 0
                ? "No Network Interfaces Selected"
                : this.state.network.map((nw, index) => {
                    return (
                      <IcseFormGroup
                        key={nw.name + "-group"}
                        className="alignItemsCenter marginBottomSmall"
                      >
                        <Network_3 className="powerIpMargin" />
                        <div className="powerIpMargin fieldWidth">
                          <p>{nw.name}</p>
                        </div>
                        <DynamicFormTextInput
                          name={"ip_address_" + index}
                          field={this.props.craig.power_instances.ip_address}
                          parentState={this.state}
                          parentProps={this.props}
                          handleInputChange={this.handleInputChange}
                          index={index}
                          value={nw.ip_address}
                        />
                      </IcseFormGroup>
                    );
                  })}
            </div>
          )
        }
        {this.props.isModal === true || !this.props.form.subForms
          ? ""
          : this.props.form.subForms.map((subForm) => (
              <IcseFormTemplate
                key={subForm.name}
                overrideTile={
                  // this is currently messy, we'll need to figure out a better solution
                  subForm.jsonField === "gre_tunnels" &&
                  !this.props.craig.store.json._options.enable_classic ? (
                    ClassicDisabledTile(true)
                  ) : subForm.jsonField === "gre_tunnels" &&
                    this.props.craig.store.json.classic_gateways.length ===
                      0 ? (
                    <NoClassicGatewaysTile />
                  ) : undefined
                }
                hideFormTitleButton={
                  subForm.hideFormTitleButton
                    ? subForm.hideFormTitleButton(this.state, this.props)
                    : false
                }
                name={subForm.name}
                subHeading
                addText={subForm.createText}
                arrayData={this.props.data[subForm.jsonField]}
                innerForm={DynamicForm}
                disableSave={this.props.disableSave}
                onDelete={
                  this.props.craig[this.props.form.jsonField][subForm.jsonField]
                    .delete
                }
                onSave={
                  this.props.craig[this.props.form.jsonField][subForm.jsonField]
                    .save
                }
                onSubmit={
                  this.props.craig[this.props.form.jsonField][subForm.jsonField]
                    .create
                }
                propsMatchState={propsMatchState}
                innerFormProps={{
                  formName: subForm.name,
                  craig: this.props.craig,
                  form: subForm.form,
                  disableSave: this.props.disableSave,
                  arrayParentName: this.props.data.name,
                  propsMatchState: propsMatchState,
                }}
                toggleFormFieldName={subForm.toggleFormFieldName}
                hideAbout
                toggleFormProps={{
                  hideName: true,
                  submissionFieldName: subForm.jsonField,
                  disableSave: this.props.disableSave,
                  type: "formInSubForm",
                }}
              />
            ))}
      </div>
    );
  }
}

export default DynamicForm;
