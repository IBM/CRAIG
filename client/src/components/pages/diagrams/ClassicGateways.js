import React from "react";
import { PowerSubnetInnerBox } from "./PowerSubnetInnerBox";
import { FirewallClassic } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const ClassicGateways = (props) => {
  let gateways = [];
  props.craig.store.json.classic_gateways.forEach((gw, gwIndex) => {
    if (gw.private_vlan === props.vlan || gw.public_vlan === props.vlan) {
      let copyGw = { ...gw };
      copyGw.index = gwIndex;
      if (gw.hadr) {
        copyGw.name += "-1";
      }
      gateways.push(copyGw);
      if (gw.hadr) {
        let hadrCopy = { ...gw };
        hadrCopy.name += "-2";
        hadrCopy.index = gwIndex;
        gateways.push(hadrCopy);
      }
    }
  });
  return gateways.length === 0 ? (
    ""
  ) : (
    <PowerSubnetInnerBox
      icon={FirewallClassic}
      name="Classic Gateways"
      static={props.static}
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
