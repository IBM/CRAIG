/* this file is the main application page */

import React from "react";
import { state } from "./lib/state";
import { useParams } from "react-router-dom";
import PageTemplate from "./components/PageTemplate";
import { FormPage } from "./components/FormPage";
import { titleCase } from "lazy-z";
import { contains } from "regex-but-with-words/lib/utils";
import About from "./components/pages/About";
import ReleaseNotes from "./components/pages/ReleaseNotes";
import Summary from "./components/pages/Summary";
import { ToggleFormPage } from "./components/ToggleFormPage";
import { Home } from "./components/pages/Home";
import constants from "./lib/constants";
import { buildTitleComment } from "./lib/json-to-iac/utils";

const withRouter = Page => props => {
  const params = useParams();
  return <Page {...props} params={params} />;
};

const craig = new state();

class Craig extends React.Component {
  constructor(props) {
    super(props);
    try {
      let storeName =
        process.env.NODE_ENV === "development" ? "craigDevStore" : "craigStore";
      let stateInStorage = window.localStorage.getItem(storeName);
      // If there is a state in browser local storage, use it instead.
      if (stateInStorage) {
        craig.store = JSON.parse(stateInStorage);
      }
      this.state = {
        hideCodeMirror: craig.store.hideCodeMirror,
        hideFooter: craig.store.hideFooter,
        jsonInCodeMirror: craig.store.jsonInCodeMirror,
        notifications: [],
        storeName: storeName,
        store: craig.store
      };
    } catch (err) {
      window.location.pathname = "/resetState";
    }
    this.toggleHide = this.toggleHide.bind(this);
    this.updateComponents = this.updateComponents.bind(this);
    this.setItem = this.setItem.bind(this);
    this.onError = this.onError.bind(this);
    this.notify = this.notify.bind(this);
  }

  // when react component mounts, set update callback for store
  // to update components
  componentDidMount() {
    craig.setUpdateCallback(() => {
      this.updateComponents();
    });
    craig.setErrorCallback(() => {
      this.onError();
    });
  }

  // update components
  updateComponents() {
    // Save state to local storage
    this.setItem(this.state.storeName, craig.store);
    // Show a notification when state is updated successfully
    let updatedForm =
      window.location.pathname === "/"
        ? "" // options and import json notification should be just successfully updated
        : buildTitleComment(
            titleCase(window.location.pathname.replace(/\/[A-z]+\//, ""))
          ).replaceAll("#", "");
    let notification = {
      title: "Success",
      kind: "success",
      text: `Successfully updated ${updatedForm}`,
      timeout: 3000
    };
    this.setState(
      {
        store: craig.store
      },
      () => {
        this.notify(notification);
      }
    );
  }

  onError() {
    let notification = {
      title: "Error",
      kind: "error",
      text: "An unexpected error has occurred.",
      timeout: 3000
    };
    this.notify(notification);
  }

  /**
   * calls window.localStore.setItem
   * @param {*} storeName
   * @param {*} store
   */
  setItem(storeName, store) {
    window.localStorage.setItem(storeName, JSON.stringify(store));
  }

  /**
   * toggle hide/show ui element
   * @param {string} value name of element store value
   */
  toggleHide(value) {
    craig.toggleStoreValue(value);
    this.setState({ [value]: craig.store[value] });
  }

  /**
   * show notifications
   * @param {*} notification
   */
  notify(notification) {
    this.setState(prevState => ({
      notifications: [...prevState.notifications, notification]
    }));
  }

  render() {
    return (
      <>
        <PageTemplate
          hideCodeMirror={
            this.props.params.doc || window.location.pathname === "/summary"
              ? true
              : this.state.hideCodeMirror
          } // always hide if about
          hideFooter={this.state.hideFooter}
          toggleHide={this.toggleHide}
          json={craig.store.json}
          nav={this.props.craigRouter.nav}
          form={this.props.params.form}
          storeName={this.state.storeName}
          jsonInCodeMirror={this.state.jsonInCodeMirror}
          notifications={this.state.notifications}
          notify={this.notify}
        >
          {this.props.params.doc ? (
            this.props.params.doc === "about" ? (
              <About />
            ) : (
              <ReleaseNotes />
            )
          ) : window.location.pathname === "/" ? (
            <Home craig={craig} />
          ) : window.location.pathname === "/summary" ? (
            <Summary craig={craig} />
          ) : contains(constants.arrayFormPages, this.props.params.form) ? (
            <FormPage craig={craig} form={this.props.params.form} />
          ) : contains(constants.toggleFormPages, this.props.params.form) ? (
            <ToggleFormPage craig={craig} form={this.props.params.form} />
          ) : (
            // if no form yet, render name
            titleCase(this.props.params.form)
          )}
        </PageTemplate>
      </>
    );
  }
}

export default withRouter(Craig);
