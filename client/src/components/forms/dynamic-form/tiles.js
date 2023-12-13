import { Add, CloudAlerting } from "@carbon/icons-react";
import { Tile } from "@carbon/react";

export const ClassicDisabledTile = (isSubComponent) => {
  return (
    <Tile
      className={
        "tileBackground displayFlex alignItemsCenter wrap" +
        (isSubComponent ? "" : " marginTop")
      }
    >
      <CloudAlerting size="24" className="iconMargin" /> Classic Infrastructure
      is not enabled. Enable Classic Infrastructure from the
      <a className="no-secrets-link" href="/">
        Options Page.
      </a>{" "}
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
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap">
      <CloudAlerting size="24" className="iconMargin" />
      No {props.name}.{" "}
      <>
        Click
        <Add size="24" className="inlineIconMargin" />
        button to add one.
      </>
    </Tile>
  );
};

export const NoPowerNetworkTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> Power VS is not
      enabled. Return to the
      <a className="no-secrets-link" href="/">
        Options Page
      </a>{" "}
      to enable Power VS.
    </Tile>
  );
};
