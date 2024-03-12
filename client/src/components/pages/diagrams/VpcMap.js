import React from "react";
import { CraigFormHeading, PrimaryButton } from "../../forms/utils";
import {
  GatewayPublic,
  IbmCloudSubnets,
  VirtualPrivateCloud,
  FetchUploadCloud,
} from "@carbon/icons-react";
import PropTypes from "prop-types";
import "./diagrams.css";
import {
  arraySplatIndex,
  contains,
  isNullOrEmptyString,
  splatContains,
} from "lazy-z";
import { DeploymentIcon } from "./DeploymentIcon";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import HoverClassNameWrapper from "./HoverClassNameWrapper";
import { Subnet } from "./Subnet";
import { SubnetServiceMap } from "./SubnetServiceMap";

export const VpcMap = (props) => {
  let craig = props.craig;
  let nullVpcResources = false;
  [
    "fortigate_vnf",
    "vsi",
    "vpn_servers",
    "vpn_gateways",
    "clusters",
    "routing_tables",
    "load_balancers",
    "security_groups",
    "virtual_private_endpoints",
  ].forEach((item) => {
    if (
      !nullVpcResources &&
      splatContains(craig.store.json[item], "vpc", null)
    ) {
      nullVpcResources = true;
    }
  });
  return craig.store.json.vpcs.length === 0 && !props.static ? (
    <CraigEmptyResourceTile
      name="VPCs"
      className="width580 marginTopHalfRem"
      customClick={
        window.location.pathname !== "/v2/vpc" ? (
          <>
            Add one from the{" "}
            <a href="/v2/vpc" style={{ marginLeft: "0.33rem" }}>
              VPC Page
            </a>
            .
          </>
        ) : undefined
      }
    />
  ) : (
    (nullVpcResources && !props.noDeployments
      ? [{ name: null, public_gateways: [] }]
      : []
    )
      .concat(craig.store.json.vpcs)
      .map((vpc, calcVpcIndex) => {
        let vpcBoxClassName =
          "subForm marginBottomSmall marginRight1Rem " +
          (props.small ? " width300" : " width580");
        let isRed =
          (isNullOrEmptyString(vpc.resource_group, true) && !vpc.use_data) ||
          isNullOrEmptyString(vpc.bucket, true) ||
          vpc.name === null;
        // vpc index needs to be modified when there are rresources with no vpc
        let vpcIndex = props.noDeployments
          ? calcVpcIndex
          : vpc.name === null // if vpc name is null
          ? -2 // set index to number that is unselecteable, -1 is used for none
          : nullVpcResources // if null resources
          ? calcVpcIndex - 1 // vpc index is -1
          : calcVpcIndex; // otherwise use raw number
        if (props.isSelected && props.isSelected(vpcIndex)) {
          vpcBoxClassName += " diagramBoxSelected";
          isRed = false;
        }
        return (
          <HoverClassNameWrapper
            className={vpcBoxClassName}
            key={vpc.name + vpc.index}
            hoverClassName="diagramBoxSelected"
            static={props.static}
          >
            <div
              className={props.static || !props.onTitleClick ? "" : "clicky"}
            >
              <CraigFormHeading
                isRed={isRed}
                icon={<VirtualPrivateCloud className="diagramTitleIcon" />}
                className="marginBottomSmall"
                type="subHeading"
                name={
                  nullVpcResources && !vpc.name
                    ? "No VPC Selected"
                    : vpc.name + " VPC" + (vpc.use_data ? " [Imported]" : "")
                }
                buttons={props.buttons ? props.buttons(vpcIndex) : ""}
                onClick={
                  props.onTitleClick
                    ? () => props.onTitleClick(vpcIndex)
                    : undefined
                }
              />
            </div>
            {React.Children.map(props.children, (child) =>
              // clone react child
              React.cloneElement(child, {
                vpc: vpc,
                vpc_index: vpcIndex,
              })
            )}
            <div
              className="displayFlex overrideGap alignItemsCenter"
              style={{
                justifyContent: "center",
              }}
            >
              {["1", "2", "3"].map((num) => {
                return (
                  <div style={{ width: "150px" }} key={num}>
                    {splatContains(vpc.public_gateways, "zone", Number(num)) ? (
                      <DeploymentIcon
                        icon={GatewayPublic}
                        item={{ name: "Public Gateway" }}
                        isSelected={() => {
                          return false;
                        }}
                        itemName="public_gateway"
                        small={props.small}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
            </div>
            {vpc.use_data ? (
              <div className="marginTop1Rem">
                <HoverClassNameWrapper
                  className={
                    "formInSubForm " +
                    (props.small ? "aclBoxSmall" : "aclBox") +
                    (contains(vpcBoxClassName, "diagramBoxSelected")
                      ? " diagramBoxSelected"
                      : "")
                  }
                  hoverClassName="diagramBoxSelected"
                  static={props.static}
                >
                  <CraigFormHeading
                    name={"Imported Subnets"}
                    icon={
                      props.small ? undefined : (
                        <IbmCloudSubnets className="diagramTitleIcon" />
                      )
                    }
                    className={
                      splatContains(vpc.subnets, "use_data", true) &&
                      !props.small
                        ? "marginBottomSmall"
                        : ""
                    }
                    type={props.small ? "" : "subHeading"}
                    buttons={
                      props.small || !props.onImportModalClick ? (
                        ""
                      ) : (
                        <PrimaryButton
                          type="custom"
                          customIcon={FetchUploadCloud}
                          noDeleteButton
                          hoverText="Import Existing Subnet"
                          onClick={() => {
                            props.onImportModalClick(vpcIndex);
                          }}
                        />
                      )
                    }
                  />
                  <div className="">
                    <div className="displayFlex wrap overrideGap">
                      {vpc.subnets
                        .filter((subnet) => {
                          if (subnet.use_data) return subnet;
                        })
                        .map((subnet, subnetIndex) => {
                          return (
                            <HoverClassNameWrapper
                              style={
                                props.small
                                  ? {
                                      maxWidth: "150px",
                                    }
                                  : {}
                              }
                              hoverClassName={
                                props.small || props.static
                                  ? ""
                                  : "diagramBoxSelected"
                              }
                            >
                              <Subnet
                                onClick={
                                  props.onImportedSubnetClick
                                    ? () => {
                                        props.onImportedSubnetClick(
                                          vpcIndex,
                                          arraySplatIndex(
                                            vpc.subnets,
                                            "name",
                                            subnet.name
                                          )
                                        );
                                      }
                                    : undefined
                                }
                                key={
                                  vpc.name + "-imported-subnet-" + subnetIndex
                                }
                                subnet={subnet}
                                vpc={vpc}
                                small={props.small}
                                imported
                                craig={craig}
                                vpcIndex={vpcIndex}
                              >
                                <SubnetServiceMap
                                  onClick={
                                    props.onImportedSubnetItemClick
                                      ? (vpcIndex, field, itemIndex) => {
                                          props.onImportedSubnetItemClick(
                                            vpcIndex,
                                            field,
                                            itemIndex
                                          );
                                        }
                                      : undefined
                                  }
                                  parentState={props.parentState}
                                  small={props.small}
                                  static={props.static}
                                  tabSelected={props.tabSelected}
                                  onTabClick={props.onTabClick}
                                />
                              </Subnet>
                            </HoverClassNameWrapper>
                          );
                        })}
                    </div>
                  </div>
                </HoverClassNameWrapper>
              </div>
            ) : (
              ""
            )}
          </HoverClassNameWrapper>
        );
      })
  );
};

VpcMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func,
  buttons: PropTypes.func,
};
