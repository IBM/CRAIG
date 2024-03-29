import React from "react";
import PropTypes from "prop-types";
// popover wrapper needs to be imported this way to prevent an error importing
// dynamic form before initializtion
import { default as PopoverWrapper } from "../utils/PopoverWrapper";
import { contains, deepEqual, isFunction, isNullOrEmptyString } from "lazy-z";
import {
  dynamicFetchSelectDataToGroups,
  dynamicFieldId,
  dynamicSelectProps,
} from "../../../lib";
import { Select, SelectItem } from "@carbon/react";

class DynamicFetchSelect extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      data: ["Loading..."],
    };
    this.dataToGroups = this.dataToGroups.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    // on mount if not items have been set
    if (deepEqual(this.state.data, ["Loading..."])) {
      fetch(
        // generate api endpoint based on state and props
        this.props.field.apiEndpoint(
          this.props.parentState,
          this.props.parentProps
        )
      )
        .then((res) => res.json())
        .then((data) => {
          // set state with data if mounted
          if (this._isMounted) {
            this.setState({ data: data });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  dataToGroups() {
    return dynamicFetchSelectDataToGroups(
      this.state,
      this.props,
      this._isMounted
    );
  }

  render() {
    let props = { ...this.props };
    return (
      <PopoverWrapper
        key={this.dataToGroups()}
        hoverText={dynamicSelectProps(props).value || ""}
        className={props.field.tooltip ? " tooltip" : "select"}
      >
        <Select
          {...dynamicSelectProps(props, this._isMounted, this.state.data)}
        >
          {this.dataToGroups().map((value) => (
            <SelectItem
              text={value}
              value={value}
              key={dynamicFieldId(props) + "-" + value + this.dataToGroups()}
            />
          ))}
        </Select>
      </PopoverWrapper>
    );
  }
}

DynamicFetchSelect.propTypes = {
  parentState: PropTypes.shape({
    kube_version: PropTypes.string,
  }).isRequired,
  parentProps: PropTypes.shape({
    isModal: PropTypes.bool,
  }).isRequired,
  field: PropTypes.shape({
    apiEndpoint: PropTypes.func.isRequired,
    onRender: PropTypes.func,
    tooltip: PropTypes.shape({}),
  }).isRequired,
};

export default DynamicFetchSelect;
