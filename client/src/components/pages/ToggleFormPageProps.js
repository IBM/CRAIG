import {
  disableSave,
  genericNameCallback,
  invalidName,
  propsMatchState
} from "../../lib/forms";
import { splat, transpose } from "lazy-z";
import { eachKey } from "regex-but-with-words/lib/utils";
import { RenderDocs } from "./SimplePages";
import { invalidIamAccountSettings } from "../../lib/forms/invalid-callbacks";
import { iamAccountSettingInvalidText } from "../../lib/forms/text-callbacks";
import {
  AtrackerForm,
  SccForm,
  IamAccountSettingsForm
} from "icse-react-assets";
import { forceShowForm } from "../../lib/forms/force-show-form";

const pathToFormMap = {
  activityTracker: {
    jsonField: "atracker",
    docsField: "atracker",
    name: "Activity Tracker",
    innerForm: AtrackerForm
  },
  securityComplianceCenter: {
    jsonField: "scc",
    docsField: "security_compliance_center",
    name: "Security and Compliance Center",
    innerForm: SccForm
  },
  iamAccountSettings: {
    jsonField: "iam_account_settings",
    docsField: "iam_account_settings",
    name: "IAM Account Settings",
    innerForm: IamAccountSettingsForm
  }
};

function toggleFormProps(form, craig) {
  // default props for all forms
  let formFields = pathToFormMap[form];
  let jsonField = pathToFormMap[form].jsonField;
  let docsField = pathToFormMap[form].docsField;
  let formTemplate = {
    craig: craig,
    name: formFields.name,
    onSave: craig[jsonField].save,
    submissionFieldName: jsonField,
    about: RenderDocs(docsField)(),
    propsMatchState: propsMatchState,
    disableSave: disableSave,
    innerForm: formFields.innerForm,
    hideName: true,
    noDeleteButton: true,
    tabPanel: {
      name: formFields.name
    },
    hide: true,
    innerFormProps: {
      craig: craig
    },
    forceOpen: forceShowForm
  };

  if (form === "activityTracker") {
    // set specific props
    let atrackerInnerFormProps = {
      region: craig.store.json._options.region,
      data: craig.store.json.atracker,
      prefix: craig.store.json._options.prefix,
      resourceGroups: splat(craig.store.json.resource_groups, "name"),
      cosBuckets: craig.store.cosBuckets,
      cosKeys: craig.store.cosKeys
    };
    transpose(atrackerInnerFormProps, formTemplate.innerFormProps);
  } else if (form === "securityComplianceCenter") {
    // set specific props
    formTemplate.useAddButton = craig.store.json.scc.enable === false;
    formTemplate.noDeleteButton = craig.store.json.scc.enable === false;
    formTemplate.onDelete = craig[jsonField].delete;
    let sccData = { ...craig.store.json.scc };
    eachKey(sccData, key => {
      if (sccData[key] === null) {
        sccData[key] = "";
      }
    });
    let sccInnerFormProps = {
      data: sccData,
      invalidCallback: invalidName("scc"),
      invalidTextCallback: () => {
        return genericNameCallback();
      }
    };
    transpose(sccInnerFormProps, formTemplate.innerFormProps);
  } else if (form === "iamAccountSettings") {
    // set specific props
    formTemplate.onDelete = craig[jsonField].delete;
    formTemplate.useAddButton =
      craig.store.json.iam_account_settings.enable === false;
    let data = { ...craig.store.json.iam_account_settings };
    let iamInnerFormProps = {
      data: data,
      invalidCallback: invalidIamAccountSettings,
      invalidTextCallback: iamAccountSettingInvalidText
    };
    transpose(iamInnerFormProps, formTemplate.innerFormProps);
  }

  return formTemplate;
}

export default toggleFormProps;
