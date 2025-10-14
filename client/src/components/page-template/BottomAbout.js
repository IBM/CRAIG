import { NewTab } from "@carbon/icons-react";
import { Link } from "@carbon/react";
import React from "react";
import "../../index.scss";
import craigNoBackground from "../../images/craigNoBackground.png";
import { CraigFormGroup } from "../forms";
import { contains } from "lazy-z";

const InternalLink = (props) => {
  return (
    <Link href={props.url} size="lg" style={props.style}>
      {props.urlText}
    </Link>
  );
};

const ExternalLink = (props) => {
  return (
    <Link
      href={props.url}
      renderIcon={() => <NewTab data-modal-primary-focus />}
      target="_blank"
      size="lg"
      style={props.style}
    >
      {props.urlText}
    </Link>
  );
};

const BottomAbout = () => {
  let isV2Page =
    contains(window.location.pathname, "/v2") ||
    contains(window.location.search, "v2");
  return (
    <div className="newFooter pointerEventsAuto">
      <div className="newFooterFlexRow marginBottomSmall">
        <div className="newFooterFlexColumn">
          <h1 className="marginBottomSmall">CRAIG</h1>
          <InternalLink
            url={`/docs/about${isV2Page ? "?v2" : ""}`}
            urlText="About"
          />
          <InternalLink
            url={`/docs/releaseNotes${isV2Page ? "?v2" : ""}`}
            urlText="Release Notes"
          />
          <InternalLink
            url={`/docs/json${isV2Page ? "?v2" : ""}`}
            urlText="JSON Documentation"
          />
          <InternalLink url="/docs/tutorial" urlText="Tutorial" />
        </div>
        <div className="newFooterFlexColumn marginTopSkipRow">
          <ExternalLink url="https://github.com/IBM/CRAIG" urlText="Github" />
          <ExternalLink
            url="https://github.com/IBM/CRAIG/blob/main/README.md"
            urlText="README"
          />
          <ExternalLink
            url="https://github.com/IBM/CRAIG/tree/main/.docs"
            urlText="Documentation"
          />
        </div>
        <div className="newFooterLogoColumn">
          <img src={craigNoBackground.src} width="190" height="190" />
        </div>
      </div>
      <hr width="99%"></hr>
      <p className="newFooterBottomText italic">
        Created by the IBM Cloud Platinum Team
      </p>
    </div>
  );
};

export default BottomAbout;
