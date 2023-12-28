import React from "react";
import {
  CraigFormHeading,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import {
  IbmCloudSubnets,
  SubnetAclRules,
  VirtualPrivateCloud,
  BareMetalServer_02,
  GatewayVpn,
  IbmCloudKubernetesService,
  IbmCloudVpcEndpoints,
  NetworkEnterprise,
  Password,
  Security,
  CloudServices,
} from "@carbon/icons-react";
import PropTypes from "prop-types";
import {
  buildNumberDropdownList,
  contains,
  isEmpty,
  splatContains,
} from "lazy-z";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import { getTierSubnets } from "../../../lib";
import { DeploymentIcon } from "../vpc/DisplayComponents";

export class Overview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let craig = this.props.craig;
    return (
      <>
        <CraigFormHeading name="Overview" />
        {/* <div
          id="services-diagram"
          style={{
            border: "1px solid gray",
            padding: "0.25rem",
            paddingLeft: "1rem",
          }}
          className="marginBottomSmall"
        >
          <div style={{marginBottom: "0.5rem"}} />
          <CraigFormHeading
            name="Cloud Services"
            noMarginBottom
            icon={<CloudServices className="diagramTitleIcon" />}
          />
        </div> */}
        <div
          id="vpc-diagram"
          style={{
            border: "1px solid gray",
            padding: "0.25rem",
            paddingLeft: "1rem",
          }}
        >
          <div style={{ marginBottom: "0.5rem" }} />
          <CraigFormHeading
            name="VPC Networks"
            noMarginBottom
            icon={<NetworkEnterprise className="diagramTitleIcon" />}
          />
          <div id="vpc-ssh-keys" style={{ marginBottom: "0rem" }}>
            <SshKeys craig={craig} width="575px" />
          </div>
          <div id="vpcs" className="displayFlex">
            <VpcMap craig={craig}>
              <SecurityGroups craig={craig} />
              <AclMap>
                <SubnetTierMap
                  craig={craig}
                  renderChildren={<SubnetServiceMap craig={craig} />}
                />
              </AclMap>
            </VpcMap>
          </div>
        </div>
      </>
    );
  }
}

Overview.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};

export const SecurityGroups = (props) => {
  let craig = props.craig;
  let vpc = props.vpc;
  return (
    <div
      className="formInSubForm marginBottomSmall"
      style={{ width: props.width ? props.width : "535px" }}
    >
      <CraigFormHeading
        icon={<Security className="diagramTitleIcon" />}
        name="Security Groups"
        type="subHeading"
        noMarginBottom
      />
      <div className="displayFlex alignItemsCenter">
        {craig.store.json.security_groups.map((sg, sgIndex) => {
          if (sg.vpc === vpc.name)
            return (
              <div
                key={"sg-" + sgIndex}
                className="fieldWidthSmaller"
                style={{
                  textAlign: "center",
                  margin: "0.5rem",
                  padding: "0.5rem",
                  width: "150px",
                }}
              >
                <DeploymentIcon
                  craig={craig}
                  icon={Security}
                  item={sg}
                  vpcIndex={props.vpc_index}
                  itemIndex={sgIndex}
                  itemName="security_groups"
                  isSelected={props.isSelected}
                  onClick={
                    props.onClick
                      ? () => props.onClick(props.vpc_index, sgIndex)
                      : undefined
                  }
                />
              </div>
            );
        })}
      </div>
    </div>
  );
};

SecurityGroups.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}),
  width: PropTypes.string,
  buttons: PropTypes.node,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
};

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

export const SubnetServiceMap = (props) => {
  function getIcon(field) {
    return field === "security_groups"
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
  return ["vsi", "clusters", "virtual_private_endpoints", "vpn_gateways"].map(
    (field) =>
      craig.store.json[field].map((item, itemIndex) => {
        if (
          (field === "vpn_gateways"
            ? item.subnet === subnet.name
            : contains(item.subnets, subnet.name)) &&
          item.vpc === vpc.name
        ) {
          return buildNumberDropdownList(
            Number(
              contains(["virtual_private_endpoints", "vpn_gateways"], field)
                ? 1 // 1 if not itterated
                : item[
                    field === "vsi" ? "vsi_per_subnet" : "workers_per_subnet"
                  ]
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
                  props.onTabClick
                    ? props.onTabClick(props.vpc_index)
                    : undefined
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

export const Subnet = (props) => {
  return (
    <div
      style={{
        border: "2px solid #00882B",
        margin: "0.5rem",
        padding: "0.5rem",
        width: "150px",
        background: "#E6F0E2",
        color: props.grayNames ? "gray" : undefined,
      }}
      key={props.subnet.name + props.vpc.name + props.acl?.name}
    >
      <div className="displayFlex" style={{ marginBottom: "0.75rem" }}>
        <IbmCloudSubnets style={{ marginRight: "0.25rem" }} />
        <span style={{ fontWeight: "bold" }}>{props.subnet.name}</span>
      </div>
      <div>{props.subnet.cidr}</div>
      <div
        style={{
          textAlign: "center",
        }}
      >
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            vpc: props.vpc,
            vpc_index: props.vpcIndex,
            acl: props.acl,
            craig: props.craig,
            subnet: props.subnet,
          })
        )}
      </div>
    </div>
  );
};

Subnet.propTypes = {
  grayNames: PropTypes.bool,
  subnet: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}).isRequired,
  ack: PropTypes.shape({}),
};

export const SubnetRow = (props) => {
  let tierSubnets = getTierSubnets(props.tier, props.vpc)(props.tier);
  let allSubnetsHaveAcl = true;
  tierSubnets.forEach((subnet) => {
    if (
      props.hasAcl &&
      subnet.acl_name !== props.acl.name &&
      props.tier.advanced !== true
    )
      allSubnetsHaveAcl = false;
  });

  return allSubnetsHaveAcl &&
    (!props.tier.advanced ||
      // prevent advanced tiers from rendering in unfound groups
      (props.acl &&
        splatContains(tierSubnets, "network_acl", props.acl.name))) ? (
    <div
      key={props.vpc.name + (props.acl ? props.acl.name : "") + props.tier.name}
      style={{
        border: "2px dotted gray",
        width: "500px",
        marginTop: props.tierIndex === 0 ? "" : "0.5rem",
        boxShadow:
          props.isSelected &&
          props.isSelected(props.vpcIndex, props.tierIndex, allSubnetsHaveAcl)
            ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
            : "",
      }}
      className="displayFlex"
      onClick={
        props.onClick
          ? () => {
              props.onClick(props.vpcIndex, props.tierIndex);
            }
          : undefined
      }
    >
      {tierSubnets.map((subnet) => {
        return (
          <Subnet
            grayNames={props.grayNames}
            subnet={subnet}
            vpcIndex={props.vpcIndex}
            vpc={props.vpc}
            acl={props.acl}
            key={
              subnet.name + props.vpc.name + (props.acl ? props.acl.name : "")
            }
            craig={props.craig}
          >
            {props.renderChildren}
          </Subnet>
        );
      })}
    </div>
  ) : (
    ""
  );
};

SubnetRow.propTypes = {
  tier: PropTypes.shape({}).isRequired,
  vpc: PropTypes.shape({}).isRequired,
  acl: PropTypes.shape({}),
  onClick: PropTypes.func,
  craig: PropTypes.shape({}).isRequired,
  renderChildren: PropTypes.node,
};

// pass through props to allow render of subcomponents
export const PassThroughWrapper = (props) => {
  return (
    <div className={props.className}>
      {React.Children.map(props.children, (child) =>
        // clone react child
        React.cloneElement(child, {
          vpc: props.vpc,
          vpc_index: props.vpc_index,
          acl: props.acl,
        })
      )}
    </div>
  );
};

PassThroughWrapper.propTypes = {
  className: PropTypes.string,
};

export const SubnetTierMap = (props) => {
  let vpc = props.vpc;
  let vpcIndex = props.vpc_index;
  let craig = props.craig;
  return craig.store.subnetTiers[vpc.name].map((tier, tierIndex) => {
    return (
      <SubnetRow
        key={vpc.name + JSON.stringify(tier)}
        tier={tier}
        tierIndex={tierIndex}
        vpc={vpc}
        acl={props.acl}
        hasAcl={props.acl ? true : false}
        vpcIndex={vpcIndex}
        craig={craig}
        renderChildren={props.renderChildren}
        isSelected={props.isSelected}
        onClick={props.onClick}
        grayNames={props.grayNames}
      />
    );
  });
};

SubnetTierMap.propTypes = {
  vpc: PropTypes.shape({}),
  vpc_index: PropTypes.number,
  craig: PropTypes.shape({}).isRequired,
  acl: PropTypes.shape({}),
  renderChildren: PropTypes.node,
  isSelected: PropTypes.func,
  onClick: PropTypes.func,
  grayNames: PropTypes.bool,
};

export const AclMap = (props) => {
  let vpc = props.vpc;
  return isEmpty(vpc.acls) ? (
    <CraigEmptyResourceTile name="ACLs" />
  ) : (
    (splatContains(vpc.subnets, "network_acl", null) ? [{ name: null }] : [])
      .concat(vpc.acls)
      .map((acl, aclIndex) => {
        // adding null offsets index, this corrects
        let actualAclIndex = splatContains(vpc.subnets, "network_acl", null)
          ? aclIndex - 1
          : aclIndex;
        return (
          <div
            key={acl.name + vpc.name + aclIndex + props.vpc_index}
            className="formInSubForm"
            style={{
              width: "535px",
              border: "2px dashed " + (acl.name ? "blue" : "red"),
              marginTop: aclIndex === 0 ? "" : "0.75rem",
              boxShadow:
                props.isSelected &&
                props.isSelected(props.vpc_index, actualAclIndex)
                  ? " 0 10px 14px 0 rgba(0, 0, 100, 0.24),0 17px 50px 0 rgba(0, 0, 100, 0.19)"
                  : "",
            }}
          >
            <div
              onClick={
                props.aclTitleClick
                  ? () => props.aclTitleClick(props.vpc_index, actualAclIndex)
                  : undefined
              }
            >
              <CraigFormHeading
                name={acl.name ? acl.name + " ACL" : "No ACL Selected"}
                icon={<SubnetAclRules className="diagramTitleIcon" />}
                className="marginBottomSmall"
                type="subHeading"
                buttons={
                  props.buttons
                    ? props.buttons(acl, props.vpc_index, actualAclIndex)
                    : undefined
                }
              />
            </div>
            {React.Children.map(props.children, (child) =>
              // clone react child
              React.cloneElement(child, {
                vpc: vpc,
                vpc_index: props.vpc_index,
                acl: acl,
              })
            )}
          </div>
        );
      })
  );
};

AclMap.propTypes = {
  vpc: PropTypes.shape({}),
  isSelected: PropTypes.func,
  aclTitleClick: PropTypes.func,
  buttons: PropTypes.func,
};

export const VpcMap = (props) => {
  let craig = props.craig;
  return craig.store.json.vpcs.map((vpc, vpcIndex) => {
    return (
      <div
        className="subForm marginBottomSmall"
        key={vpc.name + vpc.index}
        style={{
          marginRight: "1rem",
          width: "580px",
          boxShadow:
            props.isSelected && props.isSelected(vpcIndex)
              ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
              : "",
        }}
      >
        <div
          onClick={
            props.onTitleClick ? () => props.onTitleClick(vpcIndex) : undefined
          }
        >
          <CraigFormHeading
            icon={<VirtualPrivateCloud className="diagramTitleIcon" />}
            className="marginBottomSmall"
            type="subHeading"
            name={vpc.name + " VPC"}
            buttons={props.buttons ? props.buttons(vpcIndex) : ""}
          />
        </div>
        {React.Children.map(props.children, (child) =>
          // clone react child
          React.cloneElement(child, {
            vpc: vpc,
            vpc_index: vpcIndex,
          })
        )}
      </div>
    );
  });
};

VpcMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
  buttons: PropTypes.func,
};
