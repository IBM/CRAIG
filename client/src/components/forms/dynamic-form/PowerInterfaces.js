import React from "react";
import PropTypes from "prop-types";
import { Network_3 } from "@carbon/icons-react";
import { DynamicFormTextInput } from "./components";
import { contains } from "lazy-z";
import { CraigFormGroup } from "../utils";

export const PowerInterfaces = (props) => {
  return contains(["Power Instances", "VTL"], props.componentProps.formName) ? (
    <div className="formInSubForm">
      {props.stateData.network.map((nw, index) => {
        return (
          <CraigFormGroup
            key={nw.name + "-group"}
            className="alignItemsCenter marginBottomSmall"
          >
            <Network_3 className="powerIpMargin" />
            <div className="powerIpMargin fieldWidth">
              <p>{nw.name}</p>
            </div>
            <DynamicFormTextInput
              name={"ip_address_" + index}
              field={props.componentProps.craig.power_instances.ip_address}
              parentState={props.stateData}
              parentProps={props.componentProps}
              handleInputChange={props.handleInputChange}
              index={index}
              value={nw.ip_address}
            />
          </CraigFormGroup>
        );
      })}
    </div>
  ) : (
    ""
  );
};

PowerInterfaces.propTypes = {
  stateData: PropTypes.shape({}).isRequired,
  componentProps: PropTypes.shape({
    craig: PropTypes.shape({}),
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};
