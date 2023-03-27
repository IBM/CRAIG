import React from "react";
import {
  AtrackerForm,
  ToggleForm,
  SccForm,
  IamAccountSettingsForm
} from "icse-react-assets";
import PropTypes from "prop-types";
import {
  disableSave,
  genericNameCallback,
  invalidName,
  propsMatchState
} from "../lib/forms";
import { splat } from "lazy-z";
import { eachKey } from "regex-but-with-words/lib/utils";
import { RenderDocs } from "./RenderDocs";
import { invalidIamAccountSettings } from "../lib/forms/invalid-callbacks";
import { iamAccountSettingInvalidText } from "../lib/forms/text-callbacks";

function toggleFormProps(form, craig) {
  if (form === "activityTracker") {
    return {
      name: "Activity Tracker",
      onSave: craig.atracker.save,
      noDeleteButton: true,
      submissionFieldName: "atracker",
      about: RenderDocs("atracker")(),
      propsMatchState: propsMatchState,
      disableSave: disableSave,
      innerForm: AtrackerForm,
      hideName: true,
      tabPanel: {
        name: "Activity Tracker"
      },
      hide: disableSave("atracker", craig.store.json.atracker) === false,
      innerFormProps: {
        region: craig.store.json._options.region,
        data: craig.store.json.atracker,
        prefix: craig.store.json._options.prefix,
        resourceGroups: splat(craig.store.json.resource_groups, "name"),
        cosBuckets: craig.store.cosBuckets,
        cosKeys: craig.store.cosKeys
      }
    };
  } else if (form === "securityComplianceCenter") {
    let sccData = { ...craig.store.json.scc };
    eachKey(sccData, key => {
      if (sccData[key] === null) {
        sccData[key] = "";
      }
    });
    return {
      name: "Security and Compliance Center",
      onSave: craig.scc.save,
      onDelete: craig.scc.delete,
      submissionFieldName: "scc",
      about: RenderDocs("security_compliance_center")(),
      useAddButton: craig.store.json.scc.enable === false,
      noDeleteButton: craig.store.json.scc.enable === false,
      onShowToggle: () => {},
      propsMatchState: propsMatchState,
      disableSave: disableSave,
      innerForm: SccForm,
      hideName: true,
      tabPanel: {
        name: "Security and Compliance Center"
      },
      innerFormProps: {
        data: sccData,
        invalidCallback: invalidName("scc"),
        invalidTextCallback: () => {
          return genericNameCallback();
        }
      }
    };
  } else if (form === "iamAccountSettings") {
    let data = { ...craig.store.json.iam_account_settings };

    return {
      name: "(Optional) Configure IAM Account Settings",
      onSave: craig.iam_account_settings.save,
      submissionFieldName: "iam_account_settings",
      about: RenderDocs("iam_account_settings")(),
      useAddButton: craig.store.json.iam_account_settings.enable === false,
      noDeleteButton: true,
      onShowToggle: () => {},
      propsMatchState: propsMatchState,
      disableSave: disableSave,
      innerForm: IamAccountSettingsForm,
      hideName: true,
      tabPanel: {
        name: "IAM Account Settings"
      },
      innerFormProps: {
        data: data,
        invalidCallback: invalidIamAccountSettings,
        invalidTextCallback: iamAccountSettingInvalidText
      }
    };
  }
}

export const ToggleFormPage = props => {
  let toggleProps = { ...toggleFormProps(props.form, props.craig) };
  return <ToggleForm {...toggleProps} />;
};

ToggleFormPage.propTypes = {
  form: PropTypes.string.isRequired
};
