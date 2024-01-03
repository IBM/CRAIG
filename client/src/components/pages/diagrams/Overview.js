import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import {
  NetworkEnterprise,
  CloudServices,
  IbmPowerVs,
  IbmPowerVsPrivateCloud,
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

export class Overview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let craig = this.props.craig;
    return (
      <>
        <CraigFormHeading name="Overview" />
        <div
          id="services-diagram"
          style={{
            border: "1px solid gray",
            padding: "0.25rem",
            paddingLeft: "1rem",
          }}
          className="marginBottomSmall"
        >
          <div style={{ marginBottom: "0.5rem" }} />
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
        {craig.store.json.power.length === 0 ? (
          ""
        ) : (
          <div
            id="vpc-diagram"
            style={{
              border: "1px solid gray",
              padding: "0.25rem",
              paddingLeft: "1rem",
              marginTop: "1rem",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }} />
            <CraigFormHeading
              name="Power VS"
              noMarginBottom
              icon={<IbmPowerVsPrivateCloud className="diagramTitleIcon" />}
            />
            <PowerMap craig={craig} big>
              <PassThroughWrapper className="displayFlex">
                <PassThroughWrapper
                  style={{
                    width: "50%",
                    marginRight: "1rem",
                    maxWidth: "850px",
                  }}
                >
                  <PowerSubnets static craig={craig} />
                </PassThroughWrapper>
                <PassThroughWrapper style={{ width: "50%", maxWidth: "850px" }}>
                  <PowerVolumes static craig={craig} />
                </PassThroughWrapper>
              </PassThroughWrapper>
            </PowerMap>
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
