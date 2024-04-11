import React from "react";
import PropTypes from "prop-types";
import { RenderDocs } from "../pages/SimplePages";
import { forceShowForm } from "../../lib";
import { CraigToggleForm, StatefulTabs } from "./utils";

function none() {}

const ObservabilityForm = (props) => {
  let craig = props.craig;
  return (
    <>
      <StatefulTabs
        name="Observability"
        about={RenderDocs(
          "observability",
          craig.store.json._options.template
        )()}
        form={
          <div>
            <CraigToggleForm
              hideHeading
              type="subForm"
              name="LogDNA"
              submissionFieldName="logdna"
              hideName
              wrapperClassName="marginBottomXs"
              noDeleteButton
              useAddButton={craig.store.json.logdna.enabled === false}
              onShowToggle={none}
              onSave={craig.logdna.save}
              onDelete={none}
              tabPanel={{
                name: props.name,
                hideAbout: true,
                hasBuiltInHeading: true,
              }}
              craig={craig}
              innerFormProps={{
                craig: craig,
                data: craig.store.json.logdna,
                form: {
                  groups: [
                    {
                      enabled: craig.logdna.enabled,
                    },
                    {
                      name: craig.logdna.name,
                      plan: craig.logdna.plan,
                      resource_group: craig.logdna.resource_group,
                    },
                    {
                      bucket: craig.logdna.bucket,
                      archive: craig.logdna.archive,
                      platform_logs: craig.logdna.platform_logs,
                    },
                  ],
                },
              }}
            />
            <div style={{ marginBottom: "-1rem" }} />
            <CraigToggleForm
              hideHeading
              type="subForm"
              name="Sysdig"
              submissionFieldName="sysdig"
              hideName
              noDeleteButton
              useAddButton={craig.store.json.sysdig.enabled === false}
              onShowToggle={none}
              onSave={craig.sysdig.save}
              onDelete={none}
              tabPanel={{
                name: props.name,
                hideAbout: true,
                hasBuiltInHeading: true,
              }}
              craig={craig}
              innerFormProps={{
                craig: craig,
                data: craig.store.json.sysdig,
                form: {
                  groups: [
                    {
                      enabled: craig.sysdig.enabled,
                    },
                    {
                      name: craig.sysdig.name,
                      resource_group: craig.sysdig.resource_group,
                    },
                    {
                      plan: craig.sysdig.plan,
                      platform_logs: craig.sysdig.platform_logs,
                    },
                  ],
                },
              }}
            />
          </div>
        }
      />
    </>
  );
};

export default ObservabilityForm;

ObservabilityForm.propTypes = {
  craig: PropTypes.shape({
    logdna: PropTypes.shape({
      save: PropTypes.func.isRequired,
    }).isRequired,
    sysdig: PropTypes.shape({
      save: PropTypes.func.isRequired,
    }).isRequired,
    store: PropTypes.shape({
      json: PropTypes.shape({
        logdna: PropTypes.object.isRequired,
        sysdig: PropTypes.object.isRequired,
        _options: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
  }),
};
