import React from "react";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@carbon/react";
import { Sprout } from "@carbon/icons-react";
import OptionsForm from "../forms/OptionsForm";
import "./home.scss";
import ImportJson from "./ImportJson";

export function Home(props) {
  return (
    <>
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
      <Tabs>
        <TabList aria-label="home-options">
          <Tab>Options</Tab>
          <Tab>Import JSON</Tab>
          <Tab>Import SLZ JSON</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* Options Form */}
            <div className="tab-panel subForm">
              <OptionsForm
                craig={props.craig}
                data={props.craig.store.json._options}
              />
            </div>
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
