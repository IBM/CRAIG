import React from "react";
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from "@carbon/react";
import PropTypes from "prop-types";

/**
 * get doc text field params
 * @param {Object} props
 * @param {String} props.className
 * @param {String} props.text
 * @returns {Object} params object
 */
function docTextFieldParams(props) {
  let className =
    props.text === "_default_includes" ? "marginBottomSmall" : props.className;
  let text =
    props.text === "_default_includes"
      ? "The default configuration includes:"
      : props.text;
  return { className, text };
}

const DocTextField = (props) => {
  let { className, text } = docTextFieldParams(props);
  return <div className={className}>{text}</div>;
};

DocTextField.defaultProps = {
  className: "marginBottom",
};

DocTextField.propTypes = {
  className: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const StructuredList = (props) => {
  return (
    <StructuredListWrapper className="marginBottom">
      {props.headers && (
        <StructuredListHead>
          <StructuredListRow>
            {props.headers.map((cell, index) => (
              <StructuredListCell head key={index}>
                {cell}
              </StructuredListCell>
            ))}
          </StructuredListRow>
        </StructuredListHead>
      )}
      <StructuredListBody>
        {props.list.map((row, rowIndex) => (
          <StructuredListRow key={rowIndex}>
            {row.map((cell, colIndex) => (
              <StructuredListCell key={colIndex}>{cell}</StructuredListCell>
            ))}
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

StructuredList.propTypes = {
  headers: PropTypes.array,
  list: PropTypes.array.isRequired,
};

const DocTable = (props) => {
  let headers = [];
  let list = [...props.list]; // copy list, required due to reference errors

  if (props.list[0][0] === "_headers") {
    headers = [...props.list[0]]; // copy header row
    headers.shift(); // remove _header

    list.shift(); // remove heaer row from list
  }

  return <StructuredList list={list} headers={headers} />;
};

DocTable.propTypes = {
  list: PropTypes.array.isRequired,
};

const RelatedLinks = (props) => {
  return (
    <div>
      <div className="smallerText">Related Links</div>
      {props.links.map((link, index) => (
        <div key={"related-link-" + index}>
          <a
            href={link[0]}
            target="_blank"
            rel="noreferrer"
            className="smallerText"
          >
            {link.length === 1 ? "Docs" : link[1]}
          </a>
        </div>
      ))}
    </div>
  );
};

RelatedLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  ).isRequired,
};

const LastUpdated = (props) => {
  return (
    <div className="smallerText docsUpdated">
      Updated{" "}
      {new Date(props.date).toLocaleString("en", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </div>
  );
};

LastUpdated.defaultProps = {
  date: "1/1/1970",
};

LastUpdated.propTypes = {
  date: PropTypes.string.isRequired,
};

const Docs = (props) => {
  return (
    <div className="subForm leftTextAlign about">
      {props.content.map((field, index) =>
        field.text ? (
          // text field
          <DocTextField key={index} {...field} />
        ) : field.subHeading ? (
          // subheading
          <h6 className="marginBottomSmall" key={index}>
            {field.subHeading}
          </h6>
        ) : (
          // table
          <DocTable key={index} list={[...field.table]} />
        )
      )}
      <div className="displayFlex spaceBetween">
        {props.relatedLinks && <RelatedLinks links={props.relatedLinks} />}
        {props.last_updated && <LastUpdated date={props.last_updated} />}
      </div>
    </div>
  );
};

Docs.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      className: PropTypes.string,
      table: PropTypes.array,
      subHeading: PropTypes.string,
    })
  ).isRequired,
  relatedLinks: PropTypes.array,
};

export default Docs;
