import React from "react";
import { Tab, TabList, TabPanels, Tabs, TabPanel } from "@carbon/react";
import { IcseHeading } from "icse-react-assets";
import { DynamicRender, PrimaryButton } from "./ToggleFormComponents";
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
          <IcseHeading
            name={this.props.name}
            type={props.headingType}
            className={this.props.className}
            tooltip={this.props.tooltip}
            buttons={
              <DynamicRender
                hide={props.hideButtons}
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
            <TabList aria-label="formTabs">
              <Tab>Create</Tab>
              <Tab>About</Tab>
            </TabList>
            <TabPanels>
              <TabPanel className="doc">{this.props.form}</TabPanel>
              <TabPanel className="doc">
                {this.props.about ? this.props.about : ""}
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </>
    );
  }
}

StatefulTabs.defaultProps = {
  subHeading: false,
  hideFormTitleButton: false,
  hideAbout: false,
  hasBuiltInHeading: false,
  hideHeading: false,
};

StatefulTabs.propTypes = {
  name: PropTypes.string, // can be null
  subHeading: PropTypes.bool.isRequired,
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
  form: PropTypes.node.isRequired,
  hideAbout: PropTypes.bool.isRequired,
  hasBuiltInHeading: PropTypes.bool.isRequired,
  hideHeading: PropTypes.bool.isRequired,
};

export default StatefulTabs;
