import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Craig from "./Craig";
import { UnderConstruction } from "icse-react-assets";
import "./app.scss";
import { ResetState } from "./components";
import { Buffer } from "buffer";
window.Buffer = Buffer;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unsaved: false
    };
    this.nav = this.nav.bind(this);
    this.unsavedChangesCallback = this.unsavedChangesCallback.bind(this);
    // routing functions bundled together to easily pass through to child components
    this.craigRouter = {
      nav: this.nav,
      unsavedChangesCallback: this.unsavedChangesCallback
    };
  }

  /**
   * navigation function
   *
   * @param {string} path pathname to navigate to
   */
  nav(path) {
    if (this.state.unsaved) {
      let response = confirm(
        "This page has unsaved changes. Are you sure you want to leave this page?"
      );
      if (response) {
        this.setState({ unsaved: false }, () => {
          window.location.pathname = path;
        });
      }
    } else {
      window.location.pathname = path;
    }
  }

  /**
   * has unsaved changes callback
   * @param {boolean} unsaved unsaved changes
   * @param {Function} callback function callback, this is used to ensure that state changes do not occur for multiple components at the same time
   */
  unsavedChangesCallback(unsaved, callback) {
    if (unsaved !== this.state.unsaved) {
      this.setState({ unsaved: !this.state.unsaved }, () => {
        if (callback) {
          callback();
        }
      });
    }
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/resetState" element={<ResetState />} />
          <Route path="/" element={<Craig craigRouter={this.craigRouter} />} />
          <Route
            path="/form/:form"
            element={<Craig craigRouter={this.craigRouter} />}
          />
          <Route
            path="/docs/:doc"
            element={<Craig craigRouter={this.craigRouter} />}
          />
          <Route
            path="/summary"
            element={<Craig craigRouter={this.craigRouter} />}
          />
          <Route path="*" element={<UnderConstruction />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
