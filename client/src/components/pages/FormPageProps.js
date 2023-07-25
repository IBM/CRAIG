import {
  forceShowForm,
  setFormRgList,
  defaultFormTemplate,
  setFormVpcList,
  setFormEncryptionKeyList,
  setFormSubnetList,
  setDeleteDisabledMessage,
  setFormSgList,
} from "../../lib";
import SubnetForm from "../forms/SubnetForm";
import { RenderDocs } from "./SimplePages";

const pathToFormMap = {
};
/**
 * create form template props for form page
 * @param {string} form form name
 * @param {lazyZstate} craig
 * @returns {Object} form template props
 */
function formProps(form, craig) {
  function none() {}

  if (form === "subnets") {
    let innerFormData = {
      name: "VPC Subnets",
      innerForm: SubnetForm,
      arrayData: craig.store.json.vpcs,
      docs: RenderDocs("subnets"),
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
        submissionFieldName: "subnetTiers",
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


  return formTemplate;
}

export default formProps;
