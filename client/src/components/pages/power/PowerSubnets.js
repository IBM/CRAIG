import React from "react";
import { CraigFormHeading } from "../../forms/utils";
import {
  NetworkEnterprise,
  Voicemail,
  VirtualMachine,
} from "@carbon/icons-react";
import { DeploymentIcon, PowerSubnet, PowerSubnetInnerBox } from "../diagrams";
import { isEmpty, splatContains } from "lazy-z";
import PropTypes from "prop-types";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";
import { powerSubnetFilter } from "../../../lib";

export const PowerSubnets = (props) => {
  let craig = props.craig;
  let power = props.power;
  /**
   * filter instances by workspace and network
   * @param {string} powerWorkspaceName
   * @param {string} networkName
   * @returns {Function} filter function
   */
  function instanceFilter(powerWorkspaceName, networkName, noSubnetsSelected) {
    return function (instance, instanceIndex) {
      if (
        (noSubnetsSelected && isEmpty(instance.network)) ||
        ((splatContains(instance.network, "name", networkName) ||
          powerWorkspaceName === null) &&
          instance.workspace === powerWorkspaceName)
      ) {
        instance.index = instanceIndex;
        return instance;
      }
    };
  }

  let networkSubnets = powerSubnetFilter(props);

  return (
    <div className="formInSubForm marginBottomSmall">
      {props.small ? (
        ""
      ) : (
        <CraigFormHeading
          name="Subnets"
          type="subHeading"
          className={
            props.power.name === null ? "diagramIconBoxInvalid" : undefined
          }
          icon={<NetworkEnterprise className="diagramTitleIcon" />}
          onClick={
            props.static
              ? undefined
              : () => {
                  props.onPowerWorkspaceClick(props.powerIndex);
                }
          }
        />
      )}
      {(props.power.name === null
        ? [
            {
              name: "No Workspace",
            },
          ]
        : networkSubnets
      ).map((subnet, subnetIndex) => {
        let subnetInstances = craig.store.json.power_instances.filter(
          instanceFilter(
            power.name,
            subnet.name,
            subnet.name === "No Subnets Selected"
          )
        );
        let subnetVtl = craig.store.json.vtl.filter(
          instanceFilter(
            power.name,
            subnet.name,
            subnet.name === "No Subnets Selected"
          )
        );
        return (
          <PowerSubnet
            subnetIndex={subnetIndex}
            small={props.small}
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
                small={props.small}
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
                        small={props.small}
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
                      small={props.small}
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
