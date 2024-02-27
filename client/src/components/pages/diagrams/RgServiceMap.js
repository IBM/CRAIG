import React from "react";
import { getServices } from "../../../lib/forms/overview";
import { CraigFormHeading } from "../../forms/utils";
import {
  GroupResource,
  IbmCloudKeyProtect,
  ObjectStorage,
  IbmCloudSecretsManager,
  IbmCloudEventStreams,
  CloudApp,
  IbmDb2,
  DnsServices,
  IbmCloudLogging,
  IbmCloudSysdigSecure,
  CloudMonitoring,
  IbmCloudSecurityComplianceCenterWorkloadProtection,
} from "@carbon/icons-react";
import { CraigEmptyResourceTile } from "../../forms/dynamic-form";
import { ManageService } from "./ManageService";
import PropTypes from "prop-types";
import "./diagrams.css";
import { CraigFormGroup } from "../../forms";

const serviceFormMap = {
  key_management: {
    icon: IbmCloudKeyProtect,
  },
  object_storage: {
    icon: ObjectStorage,
  },
  secrets_manager: {
    icon: IbmCloudSecretsManager,
  },
  event_streams: {
    icon: IbmCloudEventStreams,
  },
  appid: {
    icon: CloudApp,
  },
  icd: {
    icon: IbmDb2,
  },
  dns: {
    icon: DnsServices,
  },
  logdna: {
    icon: IbmCloudLogging,
  },
  sysdig: {
    icon: IbmCloudSysdigSecure,
  },
  atracker: {
    icon: CloudMonitoring,
  },
  scc_v2: {
    icon: IbmCloudSecurityComplianceCenterWorkloadProtection,
  },
};

export const RgServiceMap = (props) => {
  let services = getServices(props.craig, props.services);
  return services.serviceResourceGroups.map((rg, rgIndex) => {
    let serviceMap = services.serviceMap[rg];
    return serviceMap.length === 0 && props.small ? (
      ""
    ) : serviceMap.length === 0 ? (
      <div style={{ marginBottom: "0.5rem" }} key={"rg-" + rgIndex} />
    ) : (
      <div
        className={
          "subForm marginBottomSmall " +
          (props.small ? "serviceBoxSmall" : "serviceBox")
        }
        key={rg}
      >
        {props.small ? (
          ""
        ) : (
          <CraigFormHeading
            icon={<GroupResource className="diagramTitleIcon" />}
            name={rg}
            type="subHeading"
            buttons={props.buttons ? props.buttons(rg) : undefined}
            className="marginBottomSmall"
          />
        )}
        <div className="displayFlex overrideGap wrap center">
          {serviceMap.length === 0 ? (
            <CraigEmptyResourceTile
              name="services in this resource group"
              noClick
            />
          ) : (
            serviceMap
              .sort((a, b) => {
                // sort resources by name within the same resource type
                if ((a.overrideType || a.type) < (b.overrideType || b.type))
                  return -1;
                if ((a.overrideType || a.type) > (b.overrideType || b.type))
                  return 1;
                if (a.name < b.name && a.type === b.type) return -1;
                if (a.name > b.name && a.type === b.type) return 1;
              })
              .map((service) => {
                return (
                  <ManageService
                    key={JSON.stringify(service)}
                    resourceGroup={rg}
                    service={service}
                    icon={serviceFormMap[service.type].icon}
                    className="pointerEventsNone"
                    small={props.small}
                  />
                );
              })
          )}
        </div>
      </div>
    );
  });
};

RgServiceMap.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  services: PropTypes.arrayOf(PropTypes.string).isRequired,
  buttons: PropTypes.func,
};
