import React from "react";
import PropTypes from "prop-types";
import { CraigFormHeading } from "../../forms/utils";
import { InfrastructureClassic } from "@carbon/icons-react";
import { distinct } from "lazy-z";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const ClassicMap = (props) => {
  let craig = props.craig;
  let classicDatacenters = [];
  let subFormClassName =
    "subForm" +
    (props.small ? " widthOneHundredPercent" : " powerSubForm") +
    (props.big ? " powerSubFormBig" : "");

  // get list of dataceneter
  craig.store.json.classic_vlans.forEach((vlan) => {
    classicDatacenters = distinct(classicDatacenters.concat(vlan.datacenter));
  });
  return classicDatacenters.map((datacenter) => (
    <HoverClassNameWrapper
      static={props.static}
      className={subFormClassName}
      key={datacenter}
      hoverClassName="diagramBoxSelected"
    >
      <CraigFormHeading
        name={datacenter}
        type="subHeading"
        icon={<InfrastructureClassic className="diagramTitleIcon" />}
        buttons={props.buttons}
      />
      <div className="formInSubForm marginTop1Rem">
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            datacenter: datacenter,
          }),
        )}
      </div>
    </HoverClassNameWrapper>
  ));
};

ClassicMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};
