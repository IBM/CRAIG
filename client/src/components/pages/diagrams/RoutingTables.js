import React from "react";
import { CraigFormHeading } from "../../forms/utils";
import { Router } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import "./diagrams.css";
import { CraigFormGroup } from "../../forms";
import HoverClassNameWrapper from "./HoverClassNameWrapper";
import { routingTableFilter } from "../../../lib";

export const RoutingTables = (props) => {
  let craig = props.craig;
  let vpc = props.vpc;
  let routingTables = routingTableFilter(props);
  return routingTables.length === 0 ? (
    ""
  ) : (
    <HoverClassNameWrapper
      className={
        "formInSubForm marginBottomSmall" +
        (props.width ? " securityGroupsBoxWidth" : "")
      }
      hoverClassName="diagramBoxSelected"
      static={props.static}
    >
      <CraigFormHeading
        icon={<Router className="diagramTitleIcon" />}
        name="Routing Tables"
        type="subHeading"
        noMarginBottom
        className={vpc.name === null ? "diagramSubFormInvalid" : ""}
      />
      <CraigFormGroup
        className={
          "displayFlex alignItemsCenter overrideGap powerSubnetChildren paddingBottomNone" +
          (props.width ? " securityGroupsBoxWidth" : "")
        }
      >
        {craig.store.json.routing_tables.map((rt, rtIndex) => {
          if (rt.vpc === vpc.name)
            return (
              <HoverClassNameWrapper
                key={"rt-" + rtIndex}
                className="fieldWidthSmaller sgDeploymentBox"
                hoverClassName="diagramIconBoxSelected"
                static={props.static}
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
              </HoverClassNameWrapper>
            );
        })}
      </CraigFormGroup>
    </HoverClassNameWrapper>
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
