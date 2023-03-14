import React from "react";
import { AtrackerForm, ToggleForm, SccForm } from "icse-react-assets";
import PropTypes from "prop-types";
import { disableSave, propsMatchState } from "../lib/forms";
import { splat } from "lazy-z";
import { eachKey } from "regex-but-with-words/lib/utils";

function toggleFormProps(form, craig) {
  if (form === "activityTracker") {
    return {
      name: "Activity Tracker",
      onSave: craig.atracker.save,
      noDeleteButton: true,
      submissionFieldName: "atracker",
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
      useAddButton: craig.store.json.scc.enable === false,
      noDeleteButton: craig.store.json.scc.enable === false,
      hide: craig.store.json.scc.enable === true,
      onShowToggle: () => {},
      propsMatchState: propsMatchState,
      disableSave: disableSave,
      innerForm: SccForm,
      hideName: true,
      tabPanel: {
        name: "Security and Compliance Center"
      },
      innerFormProps: {
        data: sccData
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
