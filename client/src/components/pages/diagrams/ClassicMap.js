import React from "react";
import PropTypes from "prop-types";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { InfrastructureClassic } from "@carbon/icons-react";
import { distinct } from "lazy-z";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const ClassicMap = (props) => {
  let craig = props.craig;
  let classicDatacenters = [];
  craig.store.json.classic_vlans.forEach((vlan) => {
    classicDatacenters = distinct(classicDatacenters.concat(vlan.datacenter));
  });
  return classicDatacenters.map((datacenter) => (
    <HoverClassNameWrapper
      static={props.static}
      className={"subForm powerSubForm" + (props.big ? " powerSubFormBig" : "")}
      key={datacenter}
      hoverClassName="diagramBoxSelected"
    >
      <CraigFormHeading
        name={datacenter}
        type="subHeading"
        icon={<InfrastructureClassic className="diagramTitleIcon" />}
        buttons={props.buttons}
      />
      {React.Children.map(props.children, (child) =>
        // clone react child
        React.cloneElement(child, {
          datacenter: datacenter,
        })
      )}
    </HoverClassNameWrapper>
  ));
};

ClassicMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};
