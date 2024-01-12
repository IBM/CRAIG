import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Security, Router } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import "./diagrams.css";
import { CraigFormGroup } from "../../forms";

export const RoutingTables = (props) => {
  let craig = props.craig;
  let vpc = props.vpc;
  return craig.store.json.routing_tables.filter((rt) => {
    if (rt.vpc === vpc.name) return rt;
  }).length === 0 ? (
    ""
  ) : (
    <div
      className={
        "formInSubForm marginBottomSmall" +
        (props.width ? " securityGroupsBoxWidth" : "")
      }
    >
      <CraigFormHeading
        icon={<Router className="diagramTitleIcon" />}
        name="Routing Tables"
        type="subHeading"
        noMarginBottom
      />
      <CraigFormGroup
        className={
          "displayFlex alignItemsCenter overrideGap" +
          (props.width ? " securityGroupsBoxWidth" : "")
        }
      >
        {craig.store.json.routing_tables.map((rt, rtIndex) => {
          if (rt.vpc === vpc.name)
            return (
              <div
                key={"rt-" + rtIndex}
                className="fieldWidthSmaller sgDeploymentBox"
              >
                <DeploymentIcon
                  craig={craig}
                  icon={Router}
                  item={rt}
                  vpcIndex={props.vpc_index}
                  itemIndex={rtIndex}
                  itemName="routing_tables"
                  isSelected={props.isSelected}
                  onClick={
                    props.onClick
                      ? () => props.onClick(props.vpc_index, rtIndex)
                      : undefined
                  }
                />
              </div>
            );
        })}
      </CraigFormGroup>
    </div>
  );
};

RoutingTables.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}),
  width: PropTypes.string,
  buttons: PropTypes.node,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
};
