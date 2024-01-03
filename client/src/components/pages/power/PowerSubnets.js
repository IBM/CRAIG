import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import {
  FileStorage,
  NetworkEnterprise,
  Voicemail,
  VirtualMachine,
} from "@carbon/icons-react";
import { DeploymentIcon, PowerSubnet, PowerSubnetInnerBox } from "../diagrams";
import { Tag } from "@carbon/react";
import { contains, splatContains } from "lazy-z";
import PropTypes from "prop-types";

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
              <PowerSubnetInnerBox icon={VirtualMachine} name="Virtual Servers">
                {subnetInstances.map((instance, subnetInstanceIndex) => {
                  let instanceVolumes = craig.store.json.power_volumes.filter(
                    volumeFilter(power.name, instance.name)
                  );
                  return (
                    <div
                      key={instance.name + subnet.name}
                      className="displayFlex"
                      style={{
                        marginLeft:
                          subnetInstanceIndex === 0 ? undefined : "1rem",
                      }}
                    >
                      <DeploymentIcon
                        isSelected={props.isSelected}
                        item={instance}
                        itemName="power_instances"
                        icon={VirtualMachine}
                        index={instance.index}
                        onClick={
                          props.static
                            ? undefined
                            : () => props.onPowerInstanceClick(instance.index)
                        }
                      >
                        {instanceVolumes.length === 0 ? (
                          <></>
                        ) : (
                          <div
                            style={{
                              maxWidth: "150px",
                              textAlign: "center",
                              marginTop: "0.33rem",
                            }}
                          >
                            {instanceVolumes
                              .sort((a, b) => {
                                if (a.pi_volume_size > b.pi_volume_size)
                                  return -1;
                                else if (a.pi_volume_size < b.pi_volume_size)
                                  return 1;
                              })
                              .map((vol) => {
                                return (
                                  <Tag
                                    key={vol.index + instance.name}
                                    style={{
                                      boxShadow:
                                        props.volumeIsSelected &&
                                        props.volumeIsSelected(vol.index)
                                          ? " 0 10px 14px 0 rgba(0, 0, 100, 0.24),0 17px 50px 0 rgba(0, 0, 100, 0.19)"
                                          : "",
                                    }}
                                    onClick={
                                      props.static
                                        ? undefined
                                        : () => {
                                            props.onVolumeClick(vol.index);
                                          }
                                    }
                                  >
                                    <div
                                      className="displayFlex"
                                      style={{
                                        fontSize: "10px",
                                      }}
                                    >
                                      <FileStorage
                                        style={{
                                          marginTop: "0.33rem",
                                          marginRight: "0.25rem",
                                        }}
                                      />{" "}
                                      <p>{vol.pi_volume_size}</p>
                                    </div>
                                  </Tag>
                                );
                              })}
                          </div>
                        )}
                      </DeploymentIcon>
                    </div>
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
              >
                {subnetVtl.map((instance) => (
                  <DeploymentIcon
                    key={instance.name + subnet.name}
                    isSelected={props.isSelected}
                    index={instance.index}
                    item={instance}
                    itemName="vtl"
                    icon={Voicemail}
                    onClick={
                      props.static
                        ? undefined
                        : () => props.onVtlClick(instance.index)
                    }
                  />
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
