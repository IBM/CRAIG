import { ToggleForm } from "icse-react-assets";
import React from "react";
import DynamicForm from "../../forms/DynamicForm";
import { disableSave, propsMatchState } from "../../../lib";

export const DynamicAclForm = (props) => {
  let craig = props.craig;
  let aclObject = craig.store.json.vpcs[props.vpcIndex].acls[props.aclIndex];
  return (
    <ToggleForm
      key={props.vpcIndex + "-acl-form-" + props.aclIndex}
      onDelete={craig.vpcs.acls.delete}
      onSave={craig.vpcs.acls.save}
      hideChevon
      hide={false}
      type="form"
      hideName
      innerForm={DynamicForm}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      submissionFieldName="acls"
      tabPanel={{
        hideAbout: true,
      }}
      name={aclObject.name}
      innerFormProps={{
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
      }}
    />
  );
};
