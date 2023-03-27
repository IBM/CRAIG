import React from "react";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@carbon/react";
import { Sprout } from "@carbon/icons-react";
import {
  UnderConstruction
} from "icse-react-assets";
import OptionsForm from "../forms/OptionsForm";
import "./home.scss";

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
          Configure environment options or get started by uploading a JSON
          configuration.
        </div>
      </div>
      <Tabs>
        <TabList aria-label="home-options">
          <Tab>Options</Tab>
          <Tab>Import JSON</Tab>
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
              <UnderConstruction />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
