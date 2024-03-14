import React from "react";
import PropTypes from "prop-types";
import { PowerSubnetInnerBox } from "./PowerSubnetInnerBox";
import { InstanceClassic } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const ClassicVsi = (props) => {
  let vsis = [];
  props.craig.store.json.classic_vsi.forEach((vsi, vsiIndex) => {
    if (vsi.private_vlan === props.vlan || vsi.public_vlan === props.vlan) {
      let copyVsi = { ...vsi };
      copyVsi.index = vsiIndex;
      vsis.push(copyVsi);
    }
  });
  return vsis.length === 0 ? (
    ""
  ) : (
    <PowerSubnetInnerBox
      icon={InstanceClassic}
      name="Classic VSIs"
      static={props.static}
      small={props.small}
      marginBottom={props.craig.store.json.classic_bare_metal.length !== 0}
    >
      {vsis.map((vsi) => {
        return (
          <HoverClassNameWrapper
            static={props.static}
            hoverClassName="diagramIconBoxSelected"
            key={vsi.name + props.vlan}
          >
            <DeploymentIcon
              key={vsi.name + props.vlan}
              small={props.small}
              icon={InstanceClassic}
              item={vsi}
              itemName="classic_vsi"
              craig={props.craig}
              onClick={
                props.onClick
                  ? () => {
                      props.onClick(vsi.index);
                    }
                  : undefined
              }
              isSelected={
                props.isSelected ? () => props.isSelected(vsi.index) : undefined
              }
            />
          </HoverClassNameWrapper>
        );
      })}
    </PowerSubnetInnerBox>
  );
};

ClassicVsi.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
  vlan: PropTypes.string,
  datacenter: PropTypes.string,
};
