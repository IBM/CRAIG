import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { Password } from "@carbon/icons-react";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import { validSshKey } from "../../../lib/forms/invalid-callbacks";
import { disableSave } from "../../../lib";

export const SshKeys = (props) => {
  let craig = props.craig;
  return (
    <div
      className="subForm"
      style={{
        marginRight: "1rem",
        width: "580px",
        marginBottom: "0rem",
      }}
    >
      <CraigFormHeading
        icon={<Password className="diagramTitleIcon" />}
        type="subHeading"
        name={(props.classic ? "Classic" : "VPC") + " SSH Keys"}
        buttons={props.buttons ? props.buttons : ""}
        className="marginBottomSmall"
      />
      <div className="formInSubForm displayFlex alignItemsCenter powerSubnetChildren">
        {craig.store.json[props.classic ? "classic_ssh_keys" : "ssh_keys"]
          .length === 0 && `No ${props.classic ? "Classic" : "VPC"} SSH Keys`}
        {craig.store.json[props.classic ? "classic_ssh_keys" : "ssh_keys"].map(
          (sshKey, sshKeyIndex) => (
            <div
              style={{ textAlign: "center" }}
              key={"vpc-ssh-key-" + sshKeyIndex}
            >
              <DeploymentIcon
                isSelected={props.isSelected}
                isInvalid={disableSave("ssh_keys", sshKey, {
                  craig: craig,
                  data: sshKey,
                })}
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
          )
        )}
      </div>
    </div>
  );
};

SshKeys.defaultProps = {
  classic: false,
};

SshKeys.propTypes = {
  width: PropTypes.string,
  buttons: PropTypes.node,
  craig: PropTypes.shape({}).isRequired,
  isSelected: PropTypes.func,
  onKeyClick: PropTypes.func,
  classic: PropTypes.bool.isRequired,
};
