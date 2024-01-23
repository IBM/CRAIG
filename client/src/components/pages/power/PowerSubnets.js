import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import {
  NetworkEnterprise,
  Voicemail,
  VirtualMachine,
} from "@carbon/icons-react";
import { DeploymentIcon, PowerSubnet, PowerSubnetInnerBox } from "../diagrams";
import { contains, splatContains } from "lazy-z";
import PropTypes from "prop-types";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";

export const PowerSubnets = (props) => {
  let craig = props.craig;
  let power = props.power;
  /**
   * filter instances by workspace and network
   * @param {string} powerWorkspaceName
   * @param {string} networkName
   * @returns {Function} filter function
   */
  function instanceFilter(powerWorkspaceName, networkName) {
    return function (instance, instanceIndex) {
      if (
        splatContains(instance.network, "name", networkName) &&
        instance.workspace === powerWorkspaceName
      ) {
        instance.index = instanceIndex;
        return instance;
      }
    };
  }

  /**
   * filter volumes by instance and workspace
   * @param {string} powerWorkspaceName
   * @param {string} instanceName
   * @returns {Function} filter function
   */
  function volumeFilter(powerWorkspaceName, instanceName) {
    return function (volume, volumeIndex) {
      if (
        volume.workspace === powerWorkspaceName &&
        contains(volume.attachments, instanceName)
      ) {
        volume.index = volumeIndex;
        return volume;
      }
    };
  }

  return (
    <div className="formInSubForm marginBottomSmall">
      <CraigFormHeading
        name="Subnets"
        type="subHeading"
        icon={<NetworkEnterprise className="diagramTitleIcon" />}
        onClick={
          props.static
            ? undefined
            : () => {
                props.onPowerWorkspaceClick(props.powerIndex);
              }
        }
      />
      {props.power.network.map((subnet, subnetIndex) => {
        let subnetInstances = craig.store.json.power_instances.filter(
          instanceFilter(power.name, subnet.name)
        );
        let subnetVtl = craig.store.json.vtl.filter(
          instanceFilter(power.name, subnet.name)
        );
        return (
          <PowerSubnet
            static={props.static}
            key={power.name + subnetIndex}
            subnet={subnet}
            onClick={
              props.static
                ? undefined
                : () => {
                    props.onPowerWorkspaceClick(props.powerIndex);
                  }
            }
          >
            {subnetInstances.length === 0 ? (
              ""
            ) : (
              <PowerSubnetInnerBox
                icon={VirtualMachine}
                name="Virtual Servers"
                static={props.static}
              >
                {subnetInstances.map((instance, subnetInstanceIndex) => {
                  return (
                    <HoverClassNameWrapper
                      key={instance.name + subnet.name}
                      static={props.static}
                      className="displayFlex"
                      style={{
                        marginLeft:
                          subnetInstanceIndex === 0 ? undefined : "1rem",
                      }}
                      hoverClassName="diagramIconBoxSelected"
                    >
                      <DeploymentIcon
                        isSelected={props.isSelected}
                        item={instance}
                        itemName="power_instances"
                        icon={VirtualMachine}
                        index={instance.index}
                        craig={craig}
                        onClick={
                          props.static
                            ? undefined
                            : () => props.onPowerInstanceClick(instance.index)
                        }
                      />
                    </HoverClassNameWrapper>
                  );
                })}
              </PowerSubnetInnerBox>
            )}
            {subnetVtl.length === 0 ? (
              ""
            ) : (
              <PowerSubnetInnerBox
                icon={Voicemail}
                name="FalconStor VTL"
                marginTop={subnetInstances.length !== 0}
                static={props.static}
              >
                {subnetVtl.map((instance) => (
                  <HoverClassNameWrapper
                    static={props.static}
                    hoverClassName="diagramIconBoxSelected"
                  >
                    <DeploymentIcon
                      key={instance.name + subnet.name}
                      isSelected={props.isSelected}
                      index={instance.index}
                      item={instance}
                      itemName="vtl"
                      icon={Voicemail}
                      craig={craig}
                      onClick={
                        props.static
                          ? undefined
                          : () => props.onVtlClick(instance.index)
                      }
                    />
                  </HoverClassNameWrapper>
                ))}
              </PowerSubnetInnerBox>
            )}
          </PowerSubnet>
        );
      })}
    </div>
  );
};

PowerSubnets.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  power: PropTypes.shape({}),
  onPowerWorkspaceClick: PropTypes.func,
  static: PropTypes.bool,
  onPowerInstanceClick: PropTypes.func,
  volumeIsSelected: PropTypes.func,
  onVolumeClick: PropTypes.func,
  onVtlClick: PropTypes.func,
};
