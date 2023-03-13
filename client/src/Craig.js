/* this file is the main application page */

import React from "react";
import { state } from "./lib/state";
import { useParams } from "react-router-dom";
import PageTemplate from "./components/PageTemplate";
import { FormPage } from "./components/FormPage";
import { titleCase } from "lazy-z";
import { contains } from "regex-but-with-words/lib/utils";

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
        notifcations: [],
        storeName: storeName,
        store: craig.store
      };
    } catch (err) {
      window.location.pathname = "/resetState";
    }
    this.toggleHide = this.toggleHide.bind(this);
    this.updateComponents = this.updateComponents.bind(this);
    this.setItem = this.setItem.bind(this);
  }

  // when react component mounts, set update callback for store
  // to update components
  componentDidMount() {
    if (window.location.pathname !== "resetState") {
      craig.setUpdateCallback(() => {
        this.updateComponents();
      });
    }
  }

  // update components
  updateComponents() {
    // Save state to local storage
    this.setItem(this.state.storeName, craig.store);
    // Show a notification when state is updated successfully
    // let notification = {
    //   title: "Success",
    //   text: "Successfully updated!",
    //   timeout: 3000
    // };
    this.setState(prevState => ({
      store: craig.store
      //notifications: [...prevState.notifications, notification]
    }));
  }

  /**
   * calls window.localStore.setItem
   * @param {*} storeName
   * @param {*} store
   */
  setItem(storeName, store) {
    window.localStorage.setItem(storeName, JSON.stringify(store));
  }

  toggleHide(value) {
    craig.toggleStoreValue(value);
    this.setState({ [value]: craig.store[value] });
  }

  render() {
    return (
      <>
        <PageTemplate
          hideCodeMirror={this.state.hideCodeMirror}
          hideFooter={this.state.hideFooter}
          toggleHide={this.toggleHide}
          json={craig.store.json}
          nav={this.props.craigRouter.nav}
          form={this.props.params.form}
          storeName={this.state.storeName}
        >
          {!this.props.params.form ? (
            <h1>hi i'm craig</h1>
          ) : contains(
              ["resourceGroups", "keyManagement"],
              this.props.params.form
            ) ? (
            <FormPage craig={craig} form={this.props.params.form} />
          ) : (
            titleCase(this.props.params.form)
          )}
        </PageTemplate>
      </>
    );
  }
}

export default withRouter(Craig);
