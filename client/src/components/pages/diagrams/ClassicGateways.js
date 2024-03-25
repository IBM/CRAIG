import React from "react";
import { PowerSubnetInnerBox } from "./PowerSubnetInnerBox";
import { FirewallClassic } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import HoverClassNameWrapper from "./HoverClassNameWrapper";
import { classicGatewaysFilter } from "../../../lib";

export const ClassicGateways = (props) => {
  let gateways = classicGatewaysFilter(props);
  return gateways.length === 0 ? (
    ""
  ) : (
    <PowerSubnetInnerBox
      icon={FirewallClassic}
      name="Classic Gateways"
      static={props.static}
      small={props.small}
      marginBottom={props.craig.store.json.classic_vsi.length !== 0}
    >
      {gateways.map((gw) => {
        return (
          <HoverClassNameWrapper
            static={props.static}
            hoverClassName="diagramIconBoxSelected"
            key={gw.name + props.vlan}
          >
            <DeploymentIcon
              key={gw.name + props.vlan}
              small={props.small}
              icon={FirewallClassic}
              item={gw}
              itemName="classic_gateways"
              craig={props.craig}
              onClick={
                props.onClick
                  ? () => {
                      props.onClick(gw.index);
                    }
                  : undefined
              }
              isSelected={
                props.isSelected ? () => props.isSelected(gw.index) : undefined
              }
            />
          </HoverClassNameWrapper>
        );
      })}
    </PowerSubnetInnerBox>
  );
};
