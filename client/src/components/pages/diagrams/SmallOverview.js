import { CloudServices, NetworkEnterprise } from "@carbon/icons-react";
import { CraigFormHeading } from "../../forms";
import { RgServiceMap } from "./RgServiceMap";
import { VpcMap } from "./VpcMap";
import { AclMap } from "./AclMap";
import { SubnetTierMap } from "./SubnetTierMap";
import { SubnetServiceMap } from "./SubnetServiceMap";

export const SmallOverview = (props) => {
  let craig = props.craig;
  return (
    <>
      <div
        id="services-diagram"
        className="marginBottomSmall diagramBox"
        style={{ maxWidth: "50vw", minWidth: "500px" }}
      >
        <div className="marginBottomHalfRem" />
        <CraigFormHeading
          name="Cloud Services"
          noMarginBottom
          icon={<CloudServices className="diagramTitleIcon" />}
        />
        <div id="rgs" className="displayFlex flexWrap">
          <RgServiceMap
            small
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
        id="services-diagram"
        className="marginBottomSmall diagramBox"
        style={{ maxWidth: "50vw", minWidth: "500px" }}
      >
        <div className="marginBottomHalfRem" />
        <CraigFormHeading
          name="VPC Networks"
          noMarginBottom
          icon={<NetworkEnterprise className="diagramTitleIcon" />}
        />
        <div
          className="displayFlex"
          style={{
            flexWrap: "wrap",
          }}
        >
          <VpcMap craig={craig} small static>
            <AclMap small static>
              <SubnetTierMap
                static
                craig={craig}
                small
                renderChildren={<SubnetServiceMap static small craig={craig} />}
              />
            </AclMap>
          </VpcMap>
        </div>
      </div>
    </>
  );
};
