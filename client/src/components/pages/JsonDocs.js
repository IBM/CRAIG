import { CarbonCodeMirror } from "carbon-react-code-mirror";
import { prettyJSON, keys, azsort, getType } from "lazy-z";
import React from "react";
import "./json-docs.css";
import { state } from "../../lib";

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

export const JsonDocs = () => {
  return (
    <div>
      <h1>CRAIG JSON</h1>
      <hr />
      <div className="kerning">
        CRAIG uses a JSON schema and the{" "}
        <a href="https://github.com/IBM/json-to-tf" target="_blank">
          json-to-tf
        </a>{" "}
        NPM package to dynamically create Terraform code. Values are references
        to the{" "}
        <a
          href="https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs"
          target="_blank"
        >
          IBM Cloud Terraform Documentation
        </a>{" "}
        which provides detailed parameters for each resource created.
      </div>
      <br />
      <h2>JSON Schema</h2>
      <hr />
      <p>
        JSON values are validated on Import. Invalid values to referenced values
        such as VPCs, Resource Groups, and Security groups may cause altered
        JSON files to be invalid. Detailed error message are provided on
        unsuccessful validation.
      </p>
      <br />
      <p>
        The schema for CRAIG JSON is as follows below. While each value shown is
        supported when converting JSON to Terraform, some values are not
        currently accessible within the GUI.
      </p>
      <br />
      <p style={{ fontWeight: "bolder" }}>
        Edit JSON values at your own risk, some values may not be compatible
        with CRAIG and may cause application crashes or errors.
      </p>
      <br />
      <CarbonCodeMirror light code={prettyJSON(newState().buildSchema())} />
    </div>
  );
};
