import React from "react";
import { DatePicker, DatePickerInput } from "@carbon/react";
import PropTypes from "prop-types";

const DynamicDatePicker = (props) => {
  // only used in opaque secrets, if we use this in other places we can
  // change it to be more dynamic
  return (
    <DatePicker
      datePickerType="single"
      dateFormat="Y-m-d"
      value={props.parentState.expiration_date}
      onChange={(selectEvent) => {
        let event = {
          target: {
            name: "expiration_date",
            value: selectEvent[0],
          },
        };
        props.handleInputChange(event);
      }}
    >
      <DatePickerInput
        placeholder="YYYY-MM-DD"
        labelText="Expiration Date"
        id={"expiration-date"}
        invalid={!props.parentState.expiration_date}
        invalidText={"Select an expiration date"}
      />
    </DatePicker>
  );
};

DynamicDatePicker.propTypes = {
  parentState: PropTypes.shape({
    expiration_date: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export { DynamicDatePicker };
