import React from "react";
import { CheckmarkFilled, ErrorFilled } from "@carbon/icons-react";
import { Tile, Button, TextArea } from "@carbon/react";
import validate from "../../lib/validate";
import { IcseToggle } from "icse-react-assets";
import { downloadContent } from "../page-template/DownloadConfig";
import { formatConfig } from "../../lib/forms/format-json";
import "./summary.css";

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usePrettyJson: true,
      error: "",
      fileDownloadUrl: "",
    };
    try {
      validate(this.props.craig.store.json);
    } catch (error) {
      this.state.error = error.message;
    }
    this.toggleUsePrettyJson = this.toggleUsePrettyJson.bind(this);
  }

  toggleUsePrettyJson() {
    this.setState({ usePrettyJson: !this.state.usePrettyJson });
  }

  render() {
    let json = formatConfig(
      this.props.craig.store.json,
      !this.state.usePrettyJson
    );
    return (
      <>
        <h4 className="leftTextAlign marginBottomSmall">Summary</h4>
        <Tile className="widthOneHundredPercent">
          {this.state.error ? (
            <>
              <div className="displayFlex">
                <ErrorFilled
                  size="16"
                  className="marginTopXs marginRightSmall redFill"
                />
                <h4 className="marginBottomSmall">Invalid Configuration</h4>
              </div>
              <p className="leftTextAlign marginBottomSmall">
                We found an error in your configuration: ({this.state.error}).
                Please go back to the previous steps to fix it.
              </p>
            </>
          ) : (
            <>
              <div className="displayFlex">
                <CheckmarkFilled
                  size="16"
                  className="marginTopXs marginRightSmall greenFill"
                />
                <h4 className="marginBottomSmall">Congratulations!</h4>
              </div>
              <div className="leftTextAlign">
                <p className="marginBottomSmall">
                  You have completed the customization of CRAIG.
                </p>
                <ul>
                  <p className="marginBottomSmall">
                    • You can view the JSON configuration and download your{" "}
                    <em>craig.zip</em> file below.
                  </p>
                  <p className="marginBottomSmall">
                    • To get a stringified copy of the JSON, use the{" "}
                    <em>Copy to Clipboard</em> button below.
                  </p>
                </ul>
              </div>
            </>
          )}
          <IcseToggle
            labelText="Use Pretty JSON"
            defaultToggled={this.state.usePrettyJson}
            onToggle={this.toggleUsePrettyJson}
            className="marginBottom displayFlex"
            id="use-pretty-json"
            disabled={false}
            toggleFieldName="usePrettyJson"
            value={this.state.usePrettyJson}
          />
          <TextArea
            labelText="craig.json"
            rows={20}
            cols={75}
            value={json}
            readOnly
            className="marginBottomSmall fitContent rightTextAlign codeFont"
            invalid={Boolean(this.state.error)}
            invalidText={this.state.error}
          />
          <div className="marginBottomXs fitContent">
            <Button
              className="marginRightMed"
              onClick={() => downloadContent(this.props.craig.store.json)}
              disabled={Boolean(this.state.error)}
            >
              Download craig.zip
            </Button>
            <Button
              kind="tertiary"
              onClick={() =>
                navigator.clipboard.writeText(
                  formatConfig(this.props.craig.store.json, true)
                )
              }
              disabled={Boolean(this.state.error)}
            >
              Copy to Clipboard
            </Button>
          </div>
        </Tile>
      </>
    );
  }
}

export default Summary;
