import React from "react";
import PropTypes from "prop-types";
import "../forms/options.css";

export const TemplateAbout = (props) => {
  return (
    <div
      id={"pattern-info-" + props.template.name}
      className={"leftTextAlign displayFlex"}
    >
      <div>
        <p className="marginBottomXs">{props.template.patternDocText}</p>
        <p className="marginBottomXs">This pattern includes:</p>
        <ul className="bullets indent">
          {props.template.includes.map((item) => (
            <li key={item}>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="tileStyles">
        <a
          href={props.template.image}
          target="_blank"
          rel="noreferrer noopener"
          className="magnifier"
        >
          <img
            src={props.template.image}
            className={
              props.smallImage
                ? "borderGray tileStyles imageTileSize smallImage"
                : "borderGray tileStyles imageTileSize"
            }
          />
        </a>
      </div>
    </div>
  );
};

TemplateAbout.propTypes = {
  template: PropTypes.shape({
    name: PropTypes.string.isRequired,
    includes: PropTypes.arrayOf(PropTypes.string).isRequired,
    patternDocText: PropTypes.string.isRequired,
    image: PropTypes.node.isRequired,
  }).isRequired,
};
