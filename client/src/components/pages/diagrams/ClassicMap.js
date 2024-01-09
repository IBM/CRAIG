import React from "react";
import PropTypes from "prop-types";
import {
  CraigFormHeading,
  PrimaryButton,
} from "../../forms/utils/ToggleFormComponents";
import { InfrastructureClassic } from "@carbon/icons-react";
import { distinct } from "lazy-z";

export const ClassicMap = (props) => {
  let craig = props.craig;
  let classicDatacenters = [];
  craig.store.json.classic_vlans.forEach((vlan) => {
    classicDatacenters = distinct(classicDatacenters.concat(vlan.datacenter));
  });
  return classicDatacenters.map((datacenter) => (
    <div
      className={"subForm powerSubForm" + (props.big ? " powerSubFormBig" : "")}
      key={datacenter}
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
    </div>
  ));
};

ClassicMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};
