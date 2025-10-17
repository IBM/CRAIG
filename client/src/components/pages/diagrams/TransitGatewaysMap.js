import React from "react";
import { DeploymentIcon } from "./DeploymentIcon";
import { Tag } from "@carbon/react";
import {
  Link,
  Connect,
  EarthFilled,
  FirewallClassic,
  GatewayUserAccess,
  IbmCloudTransitGateway,
  IbmPowerVs,
  VirtualPrivateCloud,
  InfrastructureClassic,
} from "@carbon/icons-react";
import { CraigFormHeading } from "../../forms/utils";
import { tagColors } from "../../forms/dynamic-form/components";
import PropTypes from "prop-types";
import { CraigFormGroup } from "../../forms";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const TransitGatewaysMap = (props) => {
  return props.craig.store.json.transit_gateways.map((tgw, tgwIndex) => {
    let isSelected = props.isSelected && props.isSelected(tgwIndex);
    return (
      <HoverClassNameWrapper
        className={
          "subForm marginBottomSmall marginRight1Rem width580" +
          (props.onClick ? " clicky" : "") +
          (isSelected ? " diagramBoxSelected" : "")
        }
        hoverClassName="diagramBoxSelected"
        key={tgw.name + tgwIndex}
        static={props.static}
        onClick={
          props.onClick
            ? () => {
                props.onClick(tgwIndex);
              }
            : undefined
        }
      >
        <DeploymentIcon
          itemName="transit_gateways"
          item={tgw}
          icon={IbmCloudTransitGateway}
          craig={props.craig}
          small={props.small}
        >
          <>
            <div className="marginTopHalfRem" />
            <Tag type={tgw.global ? tagColors[5] : tagColors[0]}>
              <div className="displayFlex font10Px">
                {tgw.global ? (
                  <EarthFilled className="securityTabIconMargin" />
                ) : (
                  <Connect className="securityTabIconMargin" />
                )}
                <div style={{ marginTop: "0.05rem" }}>
                  {tgw.global ? "Global" : "Local"}
                </div>
              </div>
            </Tag>
          </>
        </DeploymentIcon>
        <div className="marginBottomSmall" />
        {props.small ? (
          ""
        ) : (
          <div className="formInSubForm">
            <CraigFormHeading
              icon={<Link className="diagramTitleIcon" />}
              type="subHeading"
              name="Connected Networks"
              noMarginBottom={tgw.connections.length === 0}
            />
            {tgw.connections.length === 0 ? (
              ""
            ) : (
              <CraigFormGroup
                className="displayFlex alignItemsCenter overrideGap powerSubnetChildren"
                style={{
                  width: "535px",
                }}
              >
                {tgw.connections.map((connection, connectionIndex) => (
                  <DeploymentIcon
                    key={tgw.name + "-connection-" + connectionIndex}
                    item={{
                      name: connection.vpc
                        ? connection.vpc
                        : connection.power
                          ? connection.power
                          : "Classic Network",
                    }}
                    itemName="connection"
                    icon={
                      connection.vpc
                        ? VirtualPrivateCloud
                        : connection.classic
                          ? InfrastructureClassic
                          : IbmPowerVs
                    }
                    size="30"
                  />
                ))}
              </CraigFormGroup>
            )}
          </div>
        )}
        {tgw.gre_tunnels.length === 0 ? (
          ""
        ) : (
          <div className="formInSubForm marginTop1Rem">
            <CraigFormHeading
              icon={<GatewayUserAccess className="diagramTitleIcon" />}
              type="subHeading"
              name="GRE Tunnels"
            />
            <CraigFormGroup
              className="displayFlex alignItemsCenter overrideGap powerSubnetChildren"
              style={{
                width: "535px",
              }}
            >
              {tgw.gre_tunnels.map((tunnel, tunnelIndex) => (
                <DeploymentIcon
                  small
                  key={tgw.name + "-connection-" + tunnelIndex}
                  item={tunnel}
                  itemName="gre_tunnels"
                  icon={FirewallClassic}
                  craig={props.craig}
                />
              ))}
            </CraigFormGroup>
          </div>
        )}
      </HoverClassNameWrapper>
    );
  });
};

TransitGatewaysMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.func,
};
