import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Password } from "@carbon/icons-react";
import { DeploymentIcon } from "../diagrams";
import PropTypes from "prop-types";
import { CraigFormGroup } from "../../forms";

export const PowerSshKeys = (props) => {
  return (
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
      <div className="formInSubForm" style={{ padding: "0" }}>
        {props.power.ssh_keys.map((sshKey, sshIndex) => (
          <DeploymentIcon
            key={props.power.name + "key" + sshIndex}
            item={sshKey}
            icon={Password}
            itemName="ssh_key"
          />
        ))}
      </div>
    </div>
  );
};

PowerSshKeys.propTypes = {
  power: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func.isRequired,
  powerIndex: PropTypes.number.isRequired,
};