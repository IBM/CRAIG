import React from "react";
import {
  buildFormFunctions,
  DynamicToolTipWrapper,
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
  DynamicPublicKey,
  SubFormOverrideTile,
  PowerInterfaces,
  PerCloudConnections,
  DynamicDatePicker,
} from "./dynamic-form";
import {
  eachKey,
  isBoolean,
  contains,
  isFunction,
  getObjectFromArray,
} from "lazy-z";
import { propsMatchState } from "../../lib";
import {
  dynamicCraigFormGroupsProps,
  dynamicIcseHeadingProps,
  dynamicToolTipWrapperProps,
} from "../../lib/forms/dynamic-form-fields";
import { edgeRouterEnabledZones } from "../../lib/constants";
import {
  DynamicFetchMultiSelect,
  DynamicFetchSelect,
} from "./dynamic-form/components";
import { OptionsButton } from "./dynamic-form/OptionsButton";
import { NaclRulesSubForm } from "./dynamic-form/NaclRulesSubForm";
import {
  SubnetTileSubForm,
  SubnetTileTitle,
} from "./dynamic-form/SubnetTileSubForm";
import { SgRulesSubForm } from "./dynamic-form/SgRuleSubForm";
import { Tile } from "@carbon/react";
import { CraigFormGroup } from "./utils";

const doNotRenderFields = [
  "heading",
  "vsi_tiles",
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
          // prevent ssh public key from causing propsMatchState to be false
          // when use data is true. also prevent router_hostname from rendering as
          // empty string when null
          this.state[field] = isBoolean(group[field].default)
            ? group[field].default
            : group[field].default === null && field !== "router_hostname"
            ? null
            : group[field].default || "";
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
    this.getAllVsi = this.getAllVsi.bind(this);
    this.onPowerImageLoad = this.onPowerImageLoad.bind(this);
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
          group[field].onStateChange(nextState, this.props, targetData);
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

  /**
   * get dynamic list of vsi for lb page
   * @returns {Array<string>} list of vsi
   */
  getAllVsi() {
    let allVsi = [];
    this.state.target_vsi.forEach((deployment) => {
      let vsi = getObjectFromArray(
        this.props.craig.store.json.vsi,
        "name",
        deployment
      );
      let nextRow = [];
      // for each subnet vsi
      for (let subnet = 0; subnet < vsi.subnets.length; subnet++) {
        // for each vsi per subnet
        for (let count = 0; count < vsi.vsi_per_subnet; count++) {
          nextRow.push({
            name: deployment + "-" + (count + 1),
            subnet: vsi.subnets[subnet],
          });
          if (nextRow.length === 3) {
            allVsi.push(nextRow);
            nextRow = [];
          }
        }
      }
      if (nextRow.length > 0) {
        allVsi.push(nextRow);
      }
    });
    return allVsi;
  }

  onPowerImageLoad(images) {
    this.setState({ images: images });
  }

  render() {
    let propsName = this.props.data?.name || "";
    // here for testing
    // console.log(JSON.stringify(this.state, null, 2));
    return (
      <div className={this.props.className}>
        <SubnetTileTitle parentProps={this.props} parentState={this.state} />
        {this.props.form.groups.map((group, index) =>
          group.hideWhen && group.hideWhen(this.state) ? (
            ""
          ) : group.heading ? (
            <IcseHeading {...dynamicIcseHeadingProps(group)} />
          ) : group.vsi_tiles ? (
            this.getAllVsi().map((row, index) => (
              <CraigFormGroup key={"row-" + index}>
                {row.map((vsi, vsiIndex) => (
                  <Tile
                    key={`${index}-${vsiIndex}`}
                    className="fieldWidthSmaller tileFormMargin"
                  >
                    <p className="tileTitle">Name:</p>
                    <p className="tileContent">{vsi.name}</p>
                    <p className="tileTitle">Subnet:</p>
                    <p className="tileContent">{vsi.subnet}</p>
                  </Tile>
                ))}
              </CraigFormGroup>
            ))
          ) : (
            <CraigFormGroup
              {...dynamicCraigFormGroupsProps(this.props, index, this.state)}
            >
              {Object.keys(group).map((key, keyIndex) => {
                let field = group[key];
                // allow field to have multiple types based on state or props data
                let fieldType = isFunction(field.type)
                  ? field.type(this.state, this.props)
                  : field.type;
                return (field.hideWhen &&
                  field.hideWhen(this.state, this.props)) ||
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
                      fieldType === "select"
                        ? DynamicFormSelect
                        : fieldType === "toggle"
                        ? DynamicFormToggle
                        : fieldType === "textArea"
                        ? DynamicTextArea
                        : fieldType === "multiselect"
                        ? DynamicMultiSelect
                        : fieldType === "public-key"
                        ? DynamicPublicKey
                        : fieldType === "fetchSelect"
                        ? DynamicFetchSelect
                        : fieldType === "fetchMultiSelect"
                        ? DynamicFetchMultiSelect
                        : fieldType === "date"
                        ? DynamicDatePicker
                        : DynamicFormTextInput,
                      {
                        name: key,
                        labelText: field.labelText,
                        propsName: propsName,
                        keyIndex: keyIndex,
                        field: field,
                        parentState: this.state,
                        parentProps: this.props,
                        onPowerImageLoad: this.onPowerImageLoad,
                        handleInputChange:
                          field.type === "toggle"
                            ? this.handleToggle
                            : this.handleInputChange,
                      }
                    )}
                  </DynamicToolTipWrapper>
                );
              })}
            </CraigFormGroup>
          )
        )}
        <PowerInterfaces
          stateData={this.state}
          componentProps={this.props}
          handleInputChange={this.handleInputChange}
        />
        <NaclRulesSubForm parentProps={this.props} parentState={this.state} />
        <SgRulesSubForm parentProps={this.props} parentState={this.state} />
        <OptionsButton parentProps={this.props} parentState={this.state} />
        <SubnetTileSubForm
          parentProps={this.props}
          parentState={this.state}
          key={JSON.stringify(this.state)}
          isModal={this.props.isModal}
        />
        {this.props.isModal === true || !this.props.form.subForms
          ? ""
          : this.props.form.subForms.map((subForm) =>
              // prevent template from rendering when edge router
              subForm.jsonField === "cloud_connections" &&
              contains(edgeRouterEnabledZones, this.state.zone) ? (
                <PerCloudConnections />
              ) : subForm.hideWhen &&
                // hide when hidden
                subForm.hideWhen(this.state, this.props) ? (
                ""
              ) : (
                <IcseFormTemplate
                  key={subForm.name}
                  tooltip={subForm.tooltip}
                  overrideTile={
                    <SubFormOverrideTile
                      subForm={subForm}
                      componentProps={this.props}
                    />
                  }
                  hideFormTitleButton={
                    subForm.hideFormTitleButton
                      ? subForm.hideFormTitleButton(this.state, this.props)
                      : false
                  }
                  name={subForm.name}
                  subHeading
                  addText={subForm.addText}
                  arrayData={this.props.data[subForm.jsonField]}
                  innerForm={DynamicForm}
                  disableSave={this.props.disableSave}
                  onDelete={
                    this.props.craig[this.props.form.jsonField][
                      subForm.jsonField
                    ].delete
                  }
                  onSave={
                    this.props.craig[this.props.form.jsonField][
                      subForm.jsonField
                    ].save
                  }
                  onSubmit={
                    this.props.craig[this.props.form.jsonField][
                      subForm.jsonField
                    ].create
                  }
                  propsMatchState={propsMatchState}
                  innerFormProps={{
                    formName: subForm.name,
                    craig: this.props.craig,
                    form: subForm.form,
                    disableSave: this.props.disableSave,
                    arrayParentName: this.props.data.name,
                    propsMatchState: propsMatchState,
                    parent: this.props.data,
                  }}
                  toggleFormFieldName={subForm.toggleFormFieldName}
                  hideAbout
                  toggleFormProps={{
                    hideName: true,
                    submissionFieldName: subForm.jsonField,
                    disableSave: this.props.disableSave,
                    type: "formInSubForm",
                    noDeleteButton: subForm.noDeleteButton,
                    // here for testing
                    // hide: false,
                  }}
                />
              )
            )}
      </div>
    );
  }
}

export default DynamicForm;
