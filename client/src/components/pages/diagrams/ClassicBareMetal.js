import React from "react";
import PropTypes from "prop-types";
import { PowerSubnetInnerBox } from "./PowerSubnetInnerBox";
import { IbmCloudBareMetalServer } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import HoverClassNameWrapper from "./HoverClassNameWrapper";
import { classicBareMetalFilter } from "../../../lib";

export const ClassicBareMetal = (props) => {
  let bareMetals = classicBareMetalFilter(props);
  return bareMetals.length === 0 ? (
    ""
  ) : (
    <PowerSubnetInnerBox
      icon={IbmCloudBareMetalServer}
      name="Classic Bare Metal Servers"
      static={props.static}
      small={props.small}
    >
      {bareMetals.map((server) => {
        return (
          <HoverClassNameWrapper
            static={props.static}
            hoverClassName="diagramIconBoxSelected"
            key={server.name + props.vlan}
          >
            <DeploymentIcon
              key={server.name + props.vlan}
              small={props.small}
              icon={IbmCloudBareMetalServer}
              item={server}
              itemName="classic_bare_metal"
              craig={props.craig}
              onClick={
                props.onClick
                  ? () => {
                      props.onClick(server.index);
                    }
                  : undefined
              }
              isSelected={
                props.isSelected
                  ? () => props.isSelected(server.index)
                  : undefined
              }
            />
          </HoverClassNameWrapper>
        );
      })}
    </PowerSubnetInnerBox>
  );
};

ClassicBareMetal.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
  vlan: PropTypes.string,
  datacenter: PropTypes.string,
};
