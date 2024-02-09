import React from "react";
import {
  BareMetalServer_02,
  GatewayVpn,
  IbmCloudKubernetesService,
  IbmCloudVpcEndpoints,
  Password,
  Security,
  ServerProxy,
  LoadBalancerVpc,
  AppConnectivity,
} from "@carbon/icons-react";
import { contains } from "lazy-z";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";
import HoverClassNameWrapper from "./HoverClassNameWrapper";

export const SubnetServiceMap = (props) => {
  function getIcon(field) {
    return field === "fortigate_vnf" || field === "f5_vsi"
      ? AppConnectivity
      : field === "load_balancers"
      ? LoadBalancerVpc
      : field === "vpn_servers"
      ? ServerProxy
      : field === "security_groups"
      ? Security
      : field === "ssh_keys"
      ? Password
      : field === "vpn_gateways"
      ? GatewayVpn
      : field === "vsi"
      ? BareMetalServer_02
      : field === "clusters"
      ? IbmCloudKubernetesService
      : IbmCloudVpcEndpoints;
  }
  let craig = props.craig;
  let vpc = props.vpc;
  let subnet = props.vpc ? props.subnet : { name: null };
  return [
    "vsi",
    "clusters",
    "virtual_private_endpoints",
    "vpn_gateways",
    "vpn_servers",
    "load_balancers",
    "fortigate_vnf",
    "f5_vsi",
  ].map((field) =>
    craig.store.json[field].map((item, itemIndex) => {
      if (
        // if the item has a vpc, the vpc is found, but the item has no valid subnet(s)
        (!props.subnet &&
          field !== "fortigate_vnf" &&
          item.vpc === vpc?.name &&
          ((item.subnets &&
            item.subnets.length === 0 &&
            field !== "vpn_gateways") ||
            (item.subnet && item.subnet === null))) ||
        // if the item has no vpc
        (item.vpc === null && !props.vpc) ||
        // if the item has the parent subnet as part of the config
        ((field === "vpn_gateways" || field === "f5_vsi"
          ? item.subnet === subnet?.name
          : field === "fortigate_vnf" && subnet?.name
          ? item.primary_subnet === subnet?.name ||
            item.secondary_subnet === subnet?.name
          : contains(item.subnets, subnet?.name)) &&
          item.vpc === vpc?.name)
      ) {
        return (
          <HoverClassNameWrapper
            hoverClassName="diagramIconBoxSelected"
            static={props.static}
            key={subnet?.name + vpc?.name + item.name}
          >
            <DeploymentIcon
              small={props.small}
              key={subnet?.name + vpc?.name + item.name}
              craig={craig}
              itemName={field}
              icon={getIcon(field)}
              count={Number(
                contains(
                  [
                    "virtual_private_endpoints",
                    "vpn_gateways",
                    "vpn_servers",
                    "load_balancers",
                    "fortigate_vnf",
                    "f5_vsi",
                  ],
                  field
                ) || item.vpc === null
                  ? 1 // 1 if not itterated
                  : item[
                      field === "vsi" ? "vsi_per_subnet" : "workers_per_subnet"
                    ]
              )}
              subnet={subnet}
              vpc={vpc}
              item={item}
              index={1}
              parentState={props.parentState}
              vpcIndex={props.vpc_index}
              itemIndex={itemIndex}
              onClick={
                props.onClick
                  ? () => {
                      props.onClick(props.vpc_index, field, itemIndex);
                    }
                  : undefined
              }
              tabSelected={props.tabSelected}
              onTabClick={
                props.onTabClick ? props.onTabClick(props.vpc_index) : undefined
              }
            />
          </HoverClassNameWrapper>
        );
      }
    })
  );
};

SubnetServiceMap.propTypes = {
  subnet: PropTypes.shape({}),
  craig: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}),
  parentState: PropTypes.shape({}),
  onClick: PropTypes.func,
  vpc_index: PropTypes.number,
  onTabClick: PropTypes.func,
};
