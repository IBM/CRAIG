import React from "react";
import { CloudAlerting } from "@carbon/icons-react";
import { Tile } from "@carbon/react";
import "./no-secrets-manager-tile.css";

export const NoEdgeNetworkTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <span>
        <CloudAlerting size="24" className="iconMargin" /> No Edge Network. Go
        back to the{" "}
        <a className="no-secrets-link" href="/">
          Home page
        </a>{" "}
        to enable Edge Networking.{" "}
        <em>
          Dynamic Scalable Subnets must be disabled to create an Edge VPC
          network.
        </em>
      </span>
    </Tile>
  );
};
