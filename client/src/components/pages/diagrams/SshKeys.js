import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Password } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";

export const SshKeys = (props) => {
  let craig = props.craig;
  return (
    <div
      className="subForm"
      style={{
        marginRight: "1rem",
        width: props.width ? props.width : "580px",
        marginBottom: "0rem",
      }}
    >
      <CraigFormHeading
        icon={<Password className="diagramTitleIcon" />}
        type="subHeading"
        name="VPC SSH Keys"
        buttons={props.buttons ? props.buttons : ""}
      />
      <div className="formInSubForm">
        {craig.store.json.ssh_keys.length === 0 && "No VPC SSH Keys"}
        {craig.store.json.ssh_keys.map((sshKey, sshKeyIndex) => (
          <div
            style={{ textAlign: "center" }}
            key={"vpc-ssh-key-" + sshKeyIndex}
          >
            <DeploymentIcon
              isSelected={props.isSelected}
              craig={craig}
              itemName="ssh_keys"
              itemIndex={sshKeyIndex}
              item={sshKey}
              icon={Password}
              vpcIndex={-1}
              onClick={
                props.onKeyClick
                  ? () => props.onKeyClick(sshKeyIndex)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

SshKeys.propTypes = {
  width: PropTypes.string,
  buttons: PropTypes.node,
  craig: PropTypes.shape({}).isRequired,
  isSelected: PropTypes.func,
  onKeyClick: PropTypes.func,
};
