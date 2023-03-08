/* this file is the main application page */

import React from "react";
import { state } from "./lib/state";
import { useParams } from "react-router-dom";
import { prettyJSON, titleCase } from "lazy-z";
import PageTemplate from "./components/PageTemplate";

const withRouter = Page => props => {
  const params = useParams();
  return <Page {...props} params={params} />;
};

const craig = new state();

class Craig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideCodeMirror: craig.store.hideCodeMirror,
      hideFooter: craig.store.hideFooter
    };
    this.toggleHide = this.toggleHide.bind(this);
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
        >
          <h1>
            {this.props.params.form
              ? titleCase(this.props.params.form)
              : "hi i'm craig"}
          </h1>
        </PageTemplate>
      </>
    );
  }
}

export default withRouter(Craig);
