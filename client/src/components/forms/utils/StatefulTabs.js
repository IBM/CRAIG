import React from "react";
import { Tab, TabList, TabPanels, Tabs, TabPanel } from "@carbon/react";
import {
  CraigFormHeading,
  DynamicRender,
  PrimaryButton,
} from "./ToggleFormComponents";
import { kebabCase } from "lazy-z";
import PropTypes from "prop-types";
import { tabPanelProps } from "../../../lib/components/toggle-form-components";

class StatefulTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0,
    };
    this.setSelectedIndex = this.setSelectedIndex.bind(this);
  }
  setSelectedIndex(event) {
    // if the index is being set to a new tab
    if (
      this.props.toggleShowChildren &&
      event.selectedIndex !== this.state.tabIndex
    )
      this.props.toggleShowChildren();
    this.setState({ tabIndex: event.selectedIndex });
  }
  render() {
    let props = tabPanelProps(this.state, this.props);
    return (
      <>
        {props.hideHeading ? (
          ""
        ) : (
          <CraigFormHeading
            icon={this.props.icon}
            name={this.props.name}
            type={this.props.headingType}
            className={this.props.className}
            tooltip={this.props.tooltip}
            h2={this.props.h2}
            buttons={
              <DynamicRender
                hide={this.props.hideButtons}
                show={
                  <PrimaryButton
                    name={kebabCase(this.props.name)}
                    type="add"
                    noDeleteButton
                    onClick={this.props.onClick}
                    disabled={props.disableButton}
                  />
                }
              />
            }
          />
        )}
        {this.props.hideAbout ? (
          this.props.form
        ) : (
          <Tabs onChange={this.setSelectedIndex}>
            {this.props.overrideTabs ? (
              <TabList aria-label="formTabs">
                {this.props.overrideTabs.map((tab, tabIndex) => (
                  <Tab className="doc" key={`tab-${tabIndex}`}>
                    {tab.name}
                  </Tab>
                ))}
              </TabList>
            ) : (
              <TabList aria-label="formTabs">
                <Tab>{this.props.formName || "Create"}</Tab>
                <Tab>{this.props.formName ? "Documentation" : "About"}</Tab>
              </TabList>
            )}
            {this.props.overrideTabs ? (
              <TabPanels>
                {this.props.overrideTabs.map((tab, tabIndex) => {
                  return (
                    <TabPanel className="doc" key={`tab-panel-${tabIndex}`}>
                      {tab.about()}
                    </TabPanel>
                  );
                })}
              </TabPanels>
            ) : (
              <TabPanels>
                <TabPanel className="doc">{this.props.form}</TabPanel>
                <TabPanel className="doc">
                  {this.props.nestedDocs ? (
                    <StatefulTabs
                      name={this.props.name + " Documentation"}
                      overrideTabs={this.props.nestedDocs}
                      headingType="subHeading"
                    />
                  ) : this.props.about ? (
                    this.props.about
                  ) : (
                    ""
                  )}
                </TabPanel>
              </TabPanels>
            )}
          </Tabs>
        )}
      </>
    );
  }
}

StatefulTabs.defaultProps = {
  hideFormTitleButton: false,
  hideAbout: false,
  hasBuiltInHeading: false,
  hideHeading: false,
};

StatefulTabs.propTypes = {
  name: PropTypes.string, // can be null
  className: PropTypes.string, // can be null
  tooltip: PropTypes.shape({
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    align: PropTypes.string,
    alignModal: PropTypes.string,
  }),
  hideFormTitleButton: PropTypes.bool.isRequired,
  onClick: PropTypes.func, // can be null
  shouldDisableSave: PropTypes.func, // can be null
  about: PropTypes.node, // can be null
  form: PropTypes.node, // not required for recursive tab
  hideAbout: PropTypes.bool.isRequired,
  hasBuiltInHeading: PropTypes.bool.isRequired,
  hideHeading: PropTypes.bool.isRequired,
};

export default StatefulTabs;
