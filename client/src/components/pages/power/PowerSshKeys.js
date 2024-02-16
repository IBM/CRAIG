import React from "react";
import { CraigFormHeading } from "../../forms/utils";
import { Password } from "@carbon/icons-react";
import { DeploymentIcon } from "../diagrams";
import PropTypes from "prop-types";

export const PowerSshKeys = (props) => {
  return props.power.name === null ? (
    ""
  ) : (
    <div
      className="formInSubForm marginBottomSmall"
      style={{ textAlign: "center" }}
      onClick={() => {
        props.onClick(props.powerIndex);
      }}
    >
      <CraigFormHeading
        name="SSH Keys"
        type="subHeading"
        icon={<Password className="diagramTitleIcon" />}
      />
      <div
        className="formInSubForm displayFlex alignItemsCenter overrideGap powerSubnetChildren"
        style={{ padding: "0" }}
      >
        {props.power.ssh_keys.map((sshKey, sshIndex) => (
          <DeploymentIcon
            key={props.power.name + "key" + sshIndex}
            item={sshKey}
            icon={Password}
            itemName="ssh_keys"
            craig={props.craig}
          />
        ))}
      </div>
    </div>
  );
};

PowerSshKeys.propTypes = {
  power: PropTypes.shape({}),
  onClick: PropTypes.func.isRequired,
  powerIndex: PropTypes.number,
};
