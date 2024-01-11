import React from "react";
import { CloudAlerting } from "@carbon/icons-react";
import { Tile } from "@carbon/react";
import "./no-secrets-manager-tile.css";
import { contains } from "lazy-z";

export const NoSecretsManagerTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> No Secrets Manager
      instances have been created. Create one from the{" "}
      {contains(window.location.pathname, "/beta") ? (
        <a className="no-secrets-link" href="/beta/services">
          Cloud Services Page
        </a>
      ) : (
        <a className="no-secrets-link" href="/form/secretsManager">
          Secrets Manager Page
        </a>
      )}{" "}
      to enable VPN Servers.
    </Tile>
  );
};
