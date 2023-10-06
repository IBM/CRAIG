import React from "react";
import { OptionsForm } from "../forms";
import { ToggleForm, StatefulTabPanel } from "icse-react-assets";
import "./template-page.css";
import { RenderDocs } from "./SimplePages";
import { templates } from "../utils";
import { keys } from "lazy-z";

export const TemplatePage = (props) => {
  return (
    <div id="templates">
      <h2>Infrastructure Templates</h2>
      <StatefulTabPanel
        name="Infrastructure Templates"
        about={RenderDocs("templates")()}
        hasBuiltInHeading
        form={<></>}
      />
      {keys(templates).map((pattern) => (
        <ToggleForm
          key={templates[pattern].name}
          innerForm={OptionsForm}
          name={templates[pattern].name + " Template"}
          noDeleteButton
          onSave={() => {}}
          hideName
          tabPanel={{
            hideAbout: true,
          }}
          noSaveButton
          innerFormProps={{
            craig: { ...props.craig },
            data: { ...props.craig.store.json._options },
            template: templates[pattern],
          }}
          disableSave={() => {
            return false;
          }}
          propsMatchState={() => {
            return false;
          }}
          submissionFieldName={templates[pattern].name}
        />
      ))}
    </div>
  );
};
