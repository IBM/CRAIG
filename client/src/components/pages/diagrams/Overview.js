import React from "react";
import { CraigFormHeading } from "../../forms/utils";
import {
  NetworkEnterprise,
  CloudServices,
  IbmPowerVsPrivateCloud,
  IbmCloudTransitGateway,
  InfrastructureClassic,
  Dashboard,
} from "@carbon/icons-react";
import PropTypes from "prop-types";
import { RgServiceMap } from "./RgServiceMap";
import { SecurityGroups } from "./SecurityGroups";
import { VpcMap } from "./VpcMap";
import { SshKeys } from "./SshKeys";
import { SubnetServiceMap } from "./SubnetServiceMap";
import { AclMap } from "./AclMap";
import { SubnetTierMap } from "./SubnetTierMap";
import { PowerMap } from "./PowerMap";
import { PowerSubnets } from "../power/PowerSubnets";
import { PowerVolumes } from "../power/PowerVolumes";
import "./diagrams.css";
import { TransitGatewaysMap } from "./TransitGatewaysMap";
import { ClassicMap } from "./ClassicMap";
import { ClassicSubnets } from "./ClassicSubnets";
import { ClassicGateways } from "./ClassicGateways";
import { RoutingTables } from "./RoutingTables";
import { PassThroughWrapper } from "./PassthroughWrapper";

export class Overview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let craig = this.props.craig;
    return (
      <div className={this.props.className}>
        {this.props.small ? (
          ""
        ) : (
          <CraigFormHeading
            name="Overview"
            h2
            icon={
              <Dashboard
                style={{ marginTop: "0.4rem", marginRight: "0.5rem" }}
                size="20"
              />
            }
          />
        )}
        <div
          id="services-diagram"
          className="marginBottomSmall diagramBox"
          style={this.props.small ? { minWidth: "500px" } : {}}
        >
          <div className="marginBottomHalfRem" />
          <CraigFormHeading
            name="Cloud Services"
            noMarginBottom
            icon={<CloudServices className="diagramTitleIcon" />}
          />
          <div id="rgs" className="displayFlex flexWrap">
            <RgServiceMap
              small={this.props.small}
              craig={craig}
              services={[
                "appid",
                "dns",
                "icd",
                "event_streams",
                "key_management",
                "object_storage",
              ]}
            />
          </div>
        </div>
        <div
          id="vpc-diagram"
          className="diagramBox"
          style={this.props.small ? { minWidth: "500px" } : {}}
        >
          <div className="marginBottomHalfRem" />
          <CraigFormHeading
            name="VPC Networks"
            noMarginBottom
            icon={<NetworkEnterprise className="diagramTitleIcon" />}
          />
          {this.props.small || craig.store.json.ssh_keys.length === 0 ? (
            ""
          ) : (
            <div id="vpc-ssh-keys" className="marginBottomNone">
              <SshKeys craig={craig} width="575px" static />
            </div>
          )}
          <div
            id="vpcs"
            className="displayFlex"
            style={{
              flexWrap: "wrap",
            }}
          >
            <VpcMap craig={craig} static small={this.props.small}>
              {this.props.small ? (
                <></>
              ) : (
                <RoutingTables craig={craig} static />
              )}
              {this.props.small ? (
                <></>
              ) : (
                <SecurityGroups craig={craig} static />
              )}
              <AclMap static small={this.props.small}>
                <SubnetTierMap
                  static
                  craig={craig}
                  renderChildren={
                    <SubnetServiceMap
                      static
                      craig={craig}
                      small={this.props.small}
                    />
                  }
                  small={this.props.small}
                />
              </AclMap>
            </VpcMap>
          </div>
        </div>
        {craig.store.json.power.length === 0 ? (
          ""
        ) : (
          <div
            id="vpc-diagram"
            className="diagramBox marginTop1Rem "
            style={
              this.props.small
                ? { minWidth: "500px", paddingRight: "1rem" }
                : {}
            }
          >
            <div className="marginBottomHalfRem" />
            <CraigFormHeading
              name="Power VS"
              noMarginBottom
              icon={<IbmPowerVsPrivateCloud className="diagramTitleIcon" />}
            />
            <PowerMap craig={craig} big static small={this.props.small}>
              <PassThroughWrapper
                className={this.props.small ? "" : "displayFlex"}
              >
                <PassThroughWrapper
                  className={
                    (this.props.small ? "" : "powerMapPassthrough") +
                    " marginRight1Rem"
                  }
                >
                  <PowerSubnets static small={this.props.small} craig={craig} />
                </PassThroughWrapper>
                {this.props.small ? (
                  <></>
                ) : (
                  <PassThroughWrapper className="powerMapPassthrough">
                    <PowerVolumes static craig={craig} />
                  </PassThroughWrapper>
                )}
              </PassThroughWrapper>
            </PowerMap>
          </div>
        )}
        {craig.store.json._options.enable_classic ? (
          <div
            id="vpc-diagram"
            className="diagramBox marginTop1Rem"
            style={
              this.props.small
                ? { minWidth: "500px", paddingRight: "1rem" }
                : {}
            }
          >
            <div className="marginBottomHalfRem" />
            <CraigFormHeading
              name="Classic Infrastrucutre"
              noMarginBottom
              icon={<InfrastructureClassic className="diagramTitleIcon" />}
            />
            <div className="displayFlex">
              <ClassicMap craig={craig} static small={this.props.small}>
                <ClassicSubnets craig={craig} static small={this.props.small}>
                  <ClassicGateways
                    craig={craig}
                    static
                    small={this.props.small}
                  />
                </ClassicSubnets>
              </ClassicMap>
            </div>
          </div>
        ) : (
          ""
        )}
        {craig.store.json.transit_gateways.length === 0 || this.props.small ? (
          ""
        ) : (
          <div id="tgw-diagram" className="diagramBox marginTop1Rem">
            <div className="marginBottomHalfRem" />
            <CraigFormHeading
              name="Network Connectivity"
              noMarginBottom
              icon={<IbmCloudTransitGateway className="diagramTitleIcon" />}
            />
            <div className="displayFlex">
              <TransitGatewaysMap
                craig={craig}
                static
                small={this.props.small}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

Overview.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};
