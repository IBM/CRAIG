import React from "react";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  HeaderMenu,
  HeaderMenuButton,
  HeaderMenuItem,
  Modal,
  Theme,
} from "@carbon/react";
import { Reset, Download, Code, CodeHide } from "@carbon/icons-react";
import PropTypes from "prop-types";
import LeftNav from "./LeftNav";
import { downloadContent } from "../utils";
import { validate } from "../../lib";
import { splat } from "lazy-z";

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileDownloadUrl: "",
      showModal: false,
      expanded: false,
      filteredNavCategories: props.navCategories,
    };
    this.isResetState = this.isResetState.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onModalShow = this.onModalShow.bind(this);
    this.onHamburgerClick = this.onHamburgerClick.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.resetSearch = this.resetSearch.bind(this);
  }

  // Reset state and redirect to home page
  isResetState() {
    window.localStorage.removeItem("craigStore");
    window.localStorage.removeItem("craigDevStore");
    window.location.href = "/";
  }

  onModalClose = () => {
    this.setState({ showModal: false });
  };

  onModalShow = () => {
    this.setState({ showModal: true });
  };

  onHamburgerClick() {
    // reset search on nav close
    if (!this.state.expanded == false && this.state.hasSearch) {
      this.resetSearch();
    }
    this.setState({ expanded: !this.state.expanded });
  }

  onDownloadClick() {
    let notification = {
      title: "Success",
      kind: "success",
      text: `Successfully downloaded configuration.`,
      timeout: 3000,
    };
    let validated = false;
    try {
      validate(this.props.json);
      validated = true; // if we are here, successfully validated
    } catch (err) {
      console.error(err);
      notification = {
        title: "Error",
        kind: "error",
        text: `Invalid configuration.\n${err.message}`,
      };
    }
    if (validated) {
      let error = downloadContent(this.props.json, this.props.project?.name);
      if (error) {
        console.error(error);
        notification = {
          title: "Error",
          kind: "error",
          text: `Unable to download configuration.\n${error.message}`,
        };
      }
    }
    this.props.notify(notification);
  }

  resetSearch() {
    this.setState({
      hasSearch: false,
      filteredNavCategories: this.props.navCategories,
    });
  }

  onSearch(event) {
    let { value } = event.target;

    if (!value) {
      this.resetSearch();
      return;
    }

    let links = splat(this.props.navCategories, "links")
      .flat()
      .filter((link) => {
        return (
          link.title.toLowerCase().includes(value) || link.path.includes(value)
        );
      });

    this.setState({
      hasSearch: true,
      filteredNavCategories: [
        { name: `Search Results (${links.length} matches)`, links },
      ],
    });
  }

  render() {
    return (
      <Theme theme="g10">
        <Header aria-label="IBM Platform Name">
          <HeaderMenuButton
            aria-label="Open menu"
            isCollapsible
            onClick={this.onHamburgerClick}
            isActive={this.state.expanded}
          />
          <HeaderName href="/" prefix="">
            CRAIG
          </HeaderName>
          {this.props.project && (
            <HeaderMenu
              aria-label="Open current project menu"
              className="no-marker projectMenu"
              menuLinkName={`Project: ${this.props.project.name}`}
            >
              <div className="headerMenuBox">
                <p className="smallerText marginTopXs marginBottomSmall headerMenuBoxItemText bold">
                  Project Details
                </p>
                <p className="smallerText marginBottomXs headerMenuBoxItemText">
                  Name: {this.props.project.name}
                </p>
                {this.props.project.description && (
                  <p className="smallerText marginBottomXs headerMenuBoxItemText">
                    Description: {this.props.project.description}
                  </p>
                )}
                <p className="smallerText marginBottomXs headerMenuBoxItemText">
                  Template Pattern: {this.props.project.template}
                </p>
                <p className="smallerText headerMenuBoxItemText marginBottomXs">
                  Last Saved:{" "}
                  {new Date(this.props.project.last_save).toLocaleString()}
                </p>
                <HeaderMenuItem
                  className="headerMenuBoxItemLink"
                  href="/projects"
                >
                  Manage Projects
                </HeaderMenuItem>
              </div>
            </HeaderMenu>
          )}
          <HeaderGlobalBar>
            {this.props.isResetState === false &&
              this.props.formPathNotPresent === false && (
                <HeaderGlobalAction
                  aria-label={
                    this.props.hideCodeMirror
                      ? "Show Code Mirror Pane"
                      : "Hide Code Mirror Pane"
                  }
                  isActive
                  onClick={() => this.props.onJsonToggle()}
                  tooltipAlignment="end"
                >
                  {this.props.hideCodeMirror ? <Code /> : <CodeHide />}
                </HeaderGlobalAction>
              )}
            {this.props.isResetState === false && (
              <HeaderGlobalAction
                aria-label="Download Environment Terraform"
                isActive
                onClick={this.onDownloadClick}
                tooltipAlignment="end"
              >
                <Download />
              </HeaderGlobalAction>
            )}
            <HeaderGlobalAction
              aria-label="Reset State"
              isActive
              onClick={this.onModalShow}
              tooltipAlignment="end"
            >
              <Reset />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <LeftNav
            expanded={this.state.expanded}
            onOverlayClick={this.onHamburgerClick}
            navCategories={this.state.filteredNavCategories}
            fsCloud={
              this.props.isResetState === false
                ? this.props.json._options.fs_cloud
                : false
            }
            invalidForms={this.props.invalidForms}
            isResetState={this.props.isResetState}
            onSearch={this.onSearch}
          />
          {this.state.showModal && (
            <Modal
              modalHeading="Reset state"
              open={this.state.showModal}
              onRequestSubmit={this.isResetState}
              onRequestClose={this.onModalClose}
              primaryButtonText="Reset"
              secondaryButtonText="Cancel"
              size="xs"
              danger={true}
              className="hard-left"
            >
              <p>
                Are you sure you want to reset state data? Clicking reset will
                remove any and all changes you have made.
              </p>
            </Modal>
          )}
        </Header>
      </Theme>
    );
  }
}

Navigation.defaultProps = {
  hideCodeMirror: false,
  isResetState: false,
};

Navigation.propTypes = {
  onJsonToggle: PropTypes.func.isRequired,
  hideCodeMirror: PropTypes.bool.isRequired,
  navCategories: PropTypes.array.isRequired,
  isResetState: PropTypes.bool.isRequired,
  invalidForms: PropTypes.arrayOf(PropTypes.string),
};

export default Navigation;
