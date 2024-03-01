import { Add, CloudAlerting } from "@carbon/icons-react";
import { Tile } from "@carbon/react";
import { contains } from "lazy-z";
import { RenderForm } from "../utils";

export const ClassicDisabledTile = (isSubComponent) => {
  return (
    <Tile
      className={
        "tileBackground displayFlex alignItemsCenter wrap" +
        (isSubComponent ? "" : " marginTop")
      }
    >
      <CloudAlerting size="24" className="iconMargin" /> No Classic
      Infrastructure resources have been created. Create one to enable this
      feature.
    </Tile>
  );
};

export const NoVpcVsiTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap">
      <CloudAlerting size="24" className="iconMargin" /> No VPC Virtual Servers
      have been created. To enable Load Balancer creation, create a Virtual
      Server deployment.
    </Tile>
  );
};

export const NoClassicGatewaysTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap">
      <CloudAlerting size="24" className="iconMargin" /> No Classic Gateways
      have been created. Create one from the
      <a className="no-secrets-link" href="/form/classicGateways">
        Classic Gateways Page
      </a>{" "}
    </Tile>
  );
};

export const NoDomainsTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap">
      <CloudAlerting size="24" className="iconMargin" />
      No Domains. To create a DNS Record, add a Domain to this CIS Instance.
    </Tile>
  );
};

export const NoCisTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap">
      <CloudAlerting size="24" className="iconMargin" /> No CIS Instances have
      been created. Create one from the
      <a className="no-secrets-link" href="/form/cis">
        Cloud Internet Services Page
      </a>{" "}
    </Tile>
  );
};

export const PerCloudConnections = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <div>
        <CloudAlerting size="24" className="iconMargin" />
      </div>{" "}
      Cloud Connections cannot be created in zones where the Power Edge Router
      (PER) is enabled. Connect this workspace to VPC networks from the
      <a className="no-vpc-link" href="/form/transitGateways">
        Transit Gateways Page.
      </a>
    </Tile>
  );
};

export const CraigEmptyResourceTile = (props) => {
  return props.show !== false ? (
    <Tile
      className={
        "tileBackground displayFlex alignItemsCenter wrap " + props.className
      }
    >
      <CloudAlerting size="24" className="iconMargin" />
      No {props.name}.{" "}
      {props.customClick ? (
        props.customClick
      ) : props.noClick ? (
        ""
      ) : (
        <>
          Click
          {RenderForm(props.customIcon ? props.customIcon : Add, {
            size: "24",
            className: "inlineIconMargin",
          })}
          button to add one.
        </>
      )}
    </Tile>
  ) : (
    ""
  );
};

export const NoPowerNetworkTile = () => {
  let isV2Page =
    contains(window.location.pathname, "/v2") ||
    contains(window.location.search, "v2");
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> Power VS is not
      enabled. Return to the
      <a className="no-secrets-link" href={isV2Page ? "/v2/settings" : "/"}>
        {isV2Page ? "Settings Page" : "Options Page"}
      </a>{" "}
      to enable Power VS.
    </Tile>
  );
};
