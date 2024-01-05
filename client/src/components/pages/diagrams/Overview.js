import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import {
  NetworkEnterprise,
  CloudServices,
  IbmPowerVsPrivateCloud,
  IbmCloudTransitGateway,
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

export class Overview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let craig = this.props.craig;
    return (
      <>
        <CraigFormHeading name="Overview" />
        <div id="services-diagram" className="marginBottomSmall diagramBox">
          <div className="marginBottomHalfRem" />
          <CraigFormHeading
            name="Cloud Services"
            noMarginBottom
            icon={<CloudServices className="diagramTitleIcon" />}
          />
          <div id="rgs" className="displayFlex">
            <RgServiceMap
              craig={craig}
              services={[
                "appid",
                "icd",
                "event_streams",
                "key_management",
                "object_storage",
              ]}
            />
          </div>
        </div>
        <div id="vpc-diagram" className="diagramBox">
          <div className="marginBottomHalfRem" />
          <CraigFormHeading
            name="VPC Networks"
            noMarginBottom
            icon={<NetworkEnterprise className="diagramTitleIcon" />}
          />
          <div id="vpc-ssh-keys" className="marginBottomNone">
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
        {craig.store.json.power.length === 0 ? (
          ""
        ) : (
          <div id="vpc-diagram" className="diagramBox marginTop1Rem">
            <div className="marginBottomHalfRem" />
            <CraigFormHeading
              name="Power VS"
              noMarginBottom
              icon={<IbmPowerVsPrivateCloud className="diagramTitleIcon" />}
            />
            <PowerMap craig={craig} big>
              <PassThroughWrapper className="displayFlex">
                <PassThroughWrapper className="powerMapPassthrough marginRight1Rem">
                  <PowerSubnets static craig={craig} />
                </PassThroughWrapper>
                <PassThroughWrapper className="powerMapPassthrough">
                  <PowerVolumes static craig={craig} />
                </PassThroughWrapper>
              </PassThroughWrapper>
            </PowerMap>
          </div>
        )}
        {craig.store.json.transit_gateways.length === 0 ? (
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
              <TransitGatewaysMap craig={craig} />
            </div>
          </div>
        )}
      </>
    );
  }
}

Overview.propTypes = {
  craig: PropTypes.shape({}).isRequired,
};

// pass through props to allow render of subcomponents
export const PassThroughWrapper = (props) => {
  return (
    <div className={props.className} style={props.style}>
      {React.Children.map(props.children, (child) =>
        // clone react child
        React.cloneElement(child, {
          vpc: props.vpc,
          vpc_index: props.vpc_index,
          acl: props.acl,
          power: props.power,
          powerIndex: props.powerIndex,
        })
      )}
    </div>
  );
};

PassThroughWrapper.propTypes = {
  className: PropTypes.string,
};
