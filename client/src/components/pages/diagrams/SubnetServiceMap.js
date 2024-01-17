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
import { buildNumberDropdownList, contains } from "lazy-z";
import { DeploymentIcon } from "./DeploymentIcon";
import PropTypes from "prop-types";

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
  let subnet = props.subnet;
  let craig = props.craig;
  let vpc = props.vpc;
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
        (field === "vpn_gateways" || field === "f5_vsi"
          ? item.subnet === subnet.name
          : field === "fortigate_vnf"
          ? item.primary_subnet === subnet.name ||
            item.secondary_subnet === subnet.name
          : contains(item.subnets, subnet.name)) &&
        item.vpc === vpc.name
      ) {
        return buildNumberDropdownList(
          Number(
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
            )
              ? 1 // 1 if not itterated
              : item[field === "vsi" ? "vsi_per_subnet" : "workers_per_subnet"]
          ),
          0
        ).map((num) => {
          return (
            <DeploymentIcon
              key={subnet.name + vpc.name + num + item.name}
              craig={craig}
              itemName={field}
              icon={getIcon(field)}
              subnet={subnet}
              vpc={vpc}
              item={item}
              index={num}
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
          );
        });
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
