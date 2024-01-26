import React from "react";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@carbon/react";
import { Settings, Sprout } from "@carbon/icons-react";
import { EdgeNetworkingForm } from "../forms";
import "./home.scss";
import ImportJson from "./ImportJson";
import { ToggleForm } from "icse-react-assets";
import DynamicForm from "../forms/DynamicForm";
import { disableSave, propsMatchState } from "../../lib";
import { contains } from "lazy-z";
import { CraigFormHeading } from "../forms/utils/ToggleFormComponents";

function Home(props) {
  let craig = props.craig;
  return (
    <>
      {contains(window.location.pathname, "/v2") ? (
        <div>
          <CraigFormHeading
            name="Settings"
            noMarginBottom
            h2
            icon={
              <Settings
                style={{ marginTop: "0.4rem", marginRight: "0.5rem" }}
                size="20"
              />
            }
          />
        </div>
      ) : (
        <div className="banner">
          <div className="banner-icon">
            <Sprout size="32" />
          </div>
          <div className="banner-text">
            Create, deploy and manage scalable infrastructure on IBM Cloud with
            CRAIG.
            <br />
            Configure environment options or get started by importing a JSON
            configuration.
          </div>
        </div>
      )}
      <Tabs>
        <TabList aria-label="home-options">
          <Tab>
            {contains(window.location.pathname, "/v2")
              ? "Manage Settings"
              : "Options"}
          </Tab>
          <Tab>Import JSON</Tab>
          <Tab>Import SLZ JSON</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* Options Form */}
            <ToggleForm
              name="Environment Options"
              hideName
              hideChevon
              innerForm={DynamicForm}
              onDelete={() => {}}
              onSave={props.craig.options.save}
              submissionFieldName="options"
              disableSave={disableSave}
              propsMatchState={propsMatchState}
              tabPanel={{
                hideAbout: true,
              }}
              noDeleteButton
              hide={false}
              innerFormProps={{
                formName: "options",
                data: craig.store.json._options,
                craig: craig,
                form: {
                  groups: [
                    {
                      dynamic_subnets: craig.options.dynamic_subnets,
                    },
                    {
                      prefix: craig.options.prefix,
                      region: craig.options.region,
                      zones: craig.options.zones,
                    },
                    {
                      endpoints: craig.options.endpoints,
                      account_id: craig.options.account_id,
                    },
                    {
                      enable_power_vs: craig.options.enable_power_vs,
                      power_vs_high_availability:
                        craig.options.power_vs_high_availability,
                      power_vs_zones: craig.options.power_vs_zones,
                    },
                    {
                      tags: craig.options.tags,
                    },
                  ],
                },
              }}
            />
            {props.craig.store.json._options.dynamic_subnets === false && (
              <EdgeNetworkingForm craig={props.craig} />
            )}
          </TabPanel>
          <TabPanel>
            {/* Import/Export JSON page */}
            <div className="tab-panel">
              <ImportJson craig={props.craig} />
            </div>
          </TabPanel>
          <TabPanel>
            {/* Import/Export SLZ JSON page */}
            <div className="tab-panel">
              <ImportJson craig={props.craig} slz />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Home;
