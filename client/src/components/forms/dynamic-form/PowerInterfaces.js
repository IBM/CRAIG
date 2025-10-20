import React from "react";
import PropTypes from "prop-types";
import { Network_3 } from "@carbon/icons-react";
import { DynamicFormTextInput } from "./components";
import { contains, isEmpty, isNullOrEmptyString } from "lazy-z";
import { CraigFormGroup } from "../utils";
import { CraigEmptyResourceTile } from "./tiles";

export const PowerInterfaces = (props) => {
  let isVtl = contains(["VTL"], props.componentProps.formName);
  return isVtl &&
    (!props.stateData.workspace ||
      isEmpty(
        props.componentProps.craig.vtl.image.groups(
          props.stateData,
          props.componentProps,
        ),
      )) ? (
    <CraigEmptyResourceTile
      noClick
      name={
        isNullOrEmptyString(props.stateData.workspace) ? (
          "workspace selected"
        ) : (
          <span style={{ marginLeft: "0.25rem" }}>
            VTL images selected in Power VS workspace{" "}
            <code style={{ color: "blue" }}>{props.stateData.workspace}</code>.
            Add images from the Power VS form
          </span>
        )
      }
    />
  ) : contains(["Power Instances", "VTL"], props.componentProps.formName) ? (
    <div className="formInSubForm marginTop1Rem">
      {props.stateData.network.map((nw, index) => {
        return (
          <CraigFormGroup
            key={nw.name + "-group"}
            className={
              "alignItemsCenter " +
              (index + 1 === props.stateData.network.length
                ? "marginBottomNone"
                : "")
            }
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
