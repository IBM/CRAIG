import React from "react";
import { FilterableMultiSelect } from "@carbon/react";
import { dynamicMultiSelectProps } from "../../../lib";
import PropTypes from "prop-types";
import { deepEqual } from "lazy-z";

class DynamicFetchMultiSelect extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      data: ["Loading..."],
    };
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
            this.setState({ data: data }, () => {
              this.props.onPowerImageLoad(data);
            });
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

  // Force re-fetch of images on name or zone change
  componentDidUpdate(prevProps) {
    if (
      prevProps.parentState.zone != this.props.parentState.zone ||
      prevProps.parentState.name != this.props.parentState.name
    ) {
      this._isMounted = false;
      this.setState({ data: ["Loading..."] }, () => {
        this.componentDidMount();
      });
    }
  }

  render() {
    let props = { ...this.props };
    return (
      <FilterableMultiSelect
        {...dynamicMultiSelectProps(props, this.state.data)}
      />
    );
  }
}

DynamicFetchMultiSelect.propTypes = {
  onPowerImageLoad: PropTypes.func.isRequired,
  field: PropTypes.shape({
    apiEndpoint: PropTypes.func.isRequired,
  }).isRequired,
  parentState: PropTypes.shape({}),
};

export default DynamicFetchMultiSelect;
