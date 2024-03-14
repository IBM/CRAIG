import React from "react";
import PropTypes from "prop-types";
import { PowerSubnetInnerBox } from "./PowerSubnetInnerBox";
import { IbmCloudBareMetalServer } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const ClassicBareMetal = (props) => {
  let bare_metals = [];
  props.craig.store.json.classic_bare_metal.forEach((server, serverIndex) => {
    if (
      server.private_vlan === props.vlan ||
      server.public_vlan === props.vlan
    ) {
      let copyServer = { ...server };
      copyServer.index = serverIndex;
      bare_metals.push(copyServer);
    }
  });
  return bare_metals.length === 0 ? (
    ""
  ) : (
    <PowerSubnetInnerBox
      icon={IbmCloudBareMetalServer}
      name="Classic Bare Metal Servers"
      static={props.static}
      small={props.small}
    >
      {bare_metals.map((server) => {
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
