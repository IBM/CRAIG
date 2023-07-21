import {
  AccessGroupForm,
  SshKeyForm,
  VpeForm,
  VpnServerForm,
} from "icse-react-assets";
import { splat, transpose } from "lazy-z";
import {
  disableSave,
  forceShowForm,
  invalidName,
  invalidNameText,
  invalidSshPublicKey,
  accessGroupPolicyHelperTextCallback,
  propsMatchState,
  invalidIdentityProviderURI,
  disableSshKeyDelete,
  setFormRgList,
  defaultFormTemplate,
  setFormVpcList,
  setFormEncryptionKeyList,
  setFormSubnetList,
  setDeleteDisabledMessage,
  setFormSgList,
} from "../../lib";
import NaclForm from "../forms/NaclForm";
import SubnetForm from "../forms/SubnetForm";
import { RenderDocs } from "./SimplePages";

const pathToFormMap = {
  accessGroups: {
    jsonField: "access_groups",
    name: "Access Groups",
    addText: "Create an Access Group",
    innerForm: AccessGroupForm,
  },
  sshKeys: {
    jsonField: "ssh_keys",
    name: "SSH Keys",
    addText: "Create an SSH Key",
    innerForm: SshKeyForm,
  },
  vpe: {
    jsonField: "virtual_private_endpoints",
    name: "Virtual Private Endpoints",
    addText: "Create a VPE",
    innerForm: VpeForm,
  },
};
/**
 * create form template props for form page
 * @param {string} form form name
 * @param {lazyZstate} craig
 * @returns {Object} form template props
 */
function formProps(form, craig) {
  function none() {}

  if (form === "nacls" || form === "subnets") {
    let innerFormData = {
      name: form === "nacls" ? "Network Access Control Lists" : "VPC Subnets",
      innerForm: form === "nacls" ? NaclForm : SubnetForm,
      arrayData: craig.store.json.vpcs,
      docs: form === "nacls" ? RenderDocs("acls") : RenderDocs("subnets"),
      onSubmit: none,
      onDelete: none,
      onSave: none,
      disableSave: none,
      propsMatchState: none,
      forceOpen: forceShowForm,
      hideFormTitleButton: true,
      innerFormProps: {
        craig: craig,
      },
      toggleFormProps: {
        craig: craig,
        noDeleteButton: true,
        noSaveButton: true,
        hideName: true,
        hide: true,
        submissionFieldName: form === "nacls" ? "network_acls" : "subnetTiers",
        disableSave: none,
        propsMatchState: none,
        nullRef: true,
      },
    };
    return innerFormData;
  }

  let formFields = pathToFormMap[form];
  let jsonField = pathToFormMap[form].jsonField;
  let formTemplate = defaultFormTemplate(formFields, jsonField, craig);
  formTemplate.docs = RenderDocs(jsonField);
  setFormRgList(form, formTemplate, craig);
  setFormVpcList(form, formTemplate, craig);
  setFormEncryptionKeyList(form, formTemplate, craig);
  setFormSubnetList(form, formTemplate, craig);
  setDeleteDisabledMessage(form, formTemplate);
  setFormSgList(form, formTemplate, craig);

  if (form === "vpe") {
    formTemplate.innerFormProps.secretsManagerInstances = splat(
      craig.store.json.secrets_manager,
      "name"
    );
  }

  if (form === "accessGroups") {
    /* access groups */
    transpose(
      {
        propsMatchState: propsMatchState,
        /* policies */
        invalidPolicyCallback: invalidName("policies"),
        invalidPolicyTextCallback: invalidNameText("policies"),
        policyHelperTextCallback: accessGroupPolicyHelperTextCallback,
        policyProps: {
          onSave: craig.access_groups.policies.save,
          onDelete: craig.access_groups.policies.delete,
          onSubmit: craig.access_groups.policies.create,
          disableSave: disableSave,
          craig: craig,
          resourceGroups: splat(craig.store.json.resource_groups, "name"),
        },
        /* dynamic policies */
        invalidDynamicPolicyCallback: invalidName("dynamic_policies"),
        invalidDynamicPolicyTextCallback: invalidNameText("dynamic_policies"),
        dynamicPolicyHelperTextCallback: accessGroupPolicyHelperTextCallback,
        invalidIdentityProviderCallback: invalidIdentityProviderURI,
        dynamicPolicyProps: {
          onSave: craig.access_groups.dynamic_policies.save,
          onDelete: craig.access_groups.dynamic_policies.delete,
          onSubmit: craig.access_groups.dynamic_policies.create,
          disableSave: disableSave,
          craig: craig,
        },
      },
      formTemplate.innerFormProps
    );
  } else if (form === "sshKeys") {
    formTemplate.innerFormProps.invalidKeyCallback = invalidSshPublicKey;
    formTemplate.deleteDisabled = disableSshKeyDelete;
  }

  return formTemplate;
}

export default formProps;
