import { DataError } from "@carbon/icons-react";
import { Tile, Button } from "@carbon/react";
import React from "react";
import { PageTemplate } from "../page-template";

const ResetState = (props) => {
  return (
    <PageTemplate
      hideCodeMirror
      hideFooter
      noFooter
      json={{}}
      notifications={[]}
      onTabClick={() => {}}
    >
      {/* tabIndex allows for keypress events */}
      <Tile>
        <h2 className="marginBottomSmall">Uh oh!</h2>
        <p>
          <DataError size="24" className="iconMargin" />
          If you have reached this page, there was an error loading your
          configuration from storage. You will need to reset your state to
          continue to use this application.
        </p>
        <div className="marginTop">
          <Button
            kind="danger"
            className="marginRight"
            onClick={() => {
              window.localStorage.removeItem(
                process.env.NODE_ENV === "development"
                  ? "craigDevStore"
                  : "craigStore"
              );
              window.location.href = "/";
            }}
          >
            Reset State
          </Button>
          <Button
            kind="danger"
            onClick={() => {
              window.localStorage.removeItem(
                process.env.NODE_ENV === "development"
                  ? "craigDevStore"
                  : "craigStore"
              );
              window.localStorage.removeItem("craigProjects");
              window.localStorage.removeItem("craigVisited");
              window.location.href = "/";
            }}
          >
            Reset All Data
          </Button>
        </div>
      </Tile>
    </PageTemplate>
  );
};

export default ResetState;
