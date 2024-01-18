import React from "react";
import DynamicForm from "../../forms/DynamicForm";
import { disableSave, propsMatchState } from "../../../lib";
import { CraigToggleForm } from "../../forms/utils";
import { transpose } from "lazy-z";

export class DynamicAclForm extends React.Component {
  // stateful component to prevent warning on refernece passing
  render() {
    let craig = this.props.craig;
    let aclObject =
      this.props.aclIndex === -1
        ? {}
        : craig.store.json.vpcs[this.props.vpcIndex].acls[this.props.aclIndex];
    let innerFormProps = {
      vpc_name: craig.store.json.vpcs[this.props.vpcIndex].name,
      data: aclObject,
      craig: craig,
      form: {
        jsonField: "acls",
        groups: [
          {
            name: craig.vpcs.acls.name,
            resource_group: craig.vpcs.acls.resource_group,
          },
        ],
      },
      disableSave: disableSave,
    };
    transpose(this.props.innerFormProps || {}, innerFormProps);
    return (
      <CraigToggleForm
        isModal={this.props.aclIndex === -1}
        noSaveButton={this.props.aclIndex === -1}
        noDeleteButton={this.props.aclIndex === -1}
        hideTitle={this.props.aclIndex === -1}
        type={
          this.props.aclIndex === -1 || this.props.nested
            ? "formInSubForm"
            : "subForm"
        }
        key={this.props.vpcIndex + "-acl-form-" + this.props.aclIndex}
        onDelete={this.props.onDelete}
        onSave={craig.vpcs.acls.save}
        hideChevron={!this.props.nested}
        hide={this.props.beginHidden}
        hideName
        innerForm={DynamicForm}
        propsMatchState={propsMatchState}
        disableSave={disableSave}
        submissionFieldName="acls"
        tabPanel={{
          hideAbout: true,
        }}
        name={aclObject.name || ""}
        innerFormProps={innerFormProps}
        disableModal={this.props.disableModal}
        enableModal={this.props.enableModal}
        setRefUpstream={this.props.setRefUpstream}
      />
    );
  }
}

DynamicAclForm.defaultProps = {
  nested: false,
  beginHidden: false,
};
