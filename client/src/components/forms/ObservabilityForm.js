import React from "react";
import PropTypes from "prop-types";
import {
  IcseHeading,
  LogDNAForm,
  StatefulTabPanel,
  SysdigForm,
  ToggleForm,
} from "icse-react-assets";
import { splat } from "lazy-z";
import { RenderDocs } from "../pages/SimplePages";
import { disableSave, forceShowForm, propsMatchState } from "../../lib";

function none() {}

const ObservabilityForm = (props) => {
  return (
    <>
      <StatefulTabPanel
        name="Observability"
        about={RenderDocs("observability")()}
        form={
          <div>
            <ToggleForm
              type="subForm"
              name="LogDNA"
              submissionFieldName="logdna"
              hideName
              noDeleteButton
              useAddButton={props.craig.store.json.logdna.enabled === false}
              onShowToggle={none}
              onSave={props.craig.logdna.save}
              onDelete={none}
              disableSave={disableSave}
              propsMatchState={propsMatchState}
              innerForm={LogDNAForm}
              tabPanel={{
                name: props.name,
                hideAbout: true,
                hasBuiltInHeading: true,
              }}
              craig={props.craig}
              innerFormProps={{
                data: props.craig.store.json.logdna,
                resourceGroups: splat(
                  props.craig.store.json.resource_groups,
                  "name"
                ),
                cosBuckets: props.craig.store.cosBuckets,
                prefix: props.craig.store.json._options.prefix,
              }}
              forceOpen={forceShowForm}
            />
            <ToggleForm
              type="subForm"
              name="Sysdig"
              submissionFieldName="sysdig"
              hideName
              noDeleteButton
              useAddButton={props.craig.store.json.sysdig.enabled === false}
              onShowToggle={none}
              onSave={props.craig.sysdig.save}
              onDelete={none}
              disableSave={disableSave}
              propsMatchState={propsMatchState}
              innerForm={SysdigForm}
              tabPanel={{
                name: props.name,
                hideAbout: true,
                hasBuiltInHeading: true,
              }}
              craig={props.craig}
              innerFormProps={{
                data: props.craig.store.json.sysdig,
                resourceGroups: splat(
                  props.craig.store.json.resource_groups,
                  "name"
                ),
                prefix: props.craig.store.json._options.prefix,
              }}
              forceOpen={forceShowForm}
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
