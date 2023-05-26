import React from "react";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "@carbon/react";
import { Sprout } from "@carbon/icons-react";
import { OptionsForm, EdgeNetworkingForm } from "../forms";
import "./home.scss";
import ImportJson from "./ImportJson";

function Home(props) {
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

            <OptionsForm
              craig={props.craig}
              data={props.craig.store.json._options}
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
