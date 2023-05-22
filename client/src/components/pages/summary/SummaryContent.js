import React from "react";
import { CheckmarkFilled, ErrorFilled } from "@carbon/icons-react";
import PropTypes from 'prop-types'

export const SummaryErrorText = props => {
  return (
    <>
      <div className="displayFlex">
        <ErrorFilled
          size="16"
          className="marginTopXs marginRightSmall redFill"
        />
        <h4 className="marginBottomSmall">Invalid Configuration</h4>
      </div>
      <p className="leftTextAlign marginBottomSmall">
        We found an error in your configuration: ({props.error}). Please go back
        to the previous steps to fix it.
      </p>
    </>
  );
};

SummaryErrorText.propTypes = {
  error: PropTypes.string.isRequired
};

export const SummaryText = () => {
  return (
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
  );
};
