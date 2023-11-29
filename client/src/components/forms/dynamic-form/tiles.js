import { CloudAlerting } from "@carbon/icons-react";
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
