import React from "react";
import { RegexButWithWords } from "regex-but-with-words";
import { prettyJSON, revision } from "lazy-z";
import { CraigCodeMirror } from "../../page-template/CodeMirror";
import PropTypes from "prop-types";

const CopySgModalContent = props => {
  return (
    <>
      <p className="marginBottomSmall">
        Copy ACL <strong>{props.source}</strong> to VPC{" "}
        <strong>{props.destinationVpc}</strong>?
      </p>
      <CraigCodeMirror
        className="regular"
        code={prettyJSON(
          new revision(props.craig.store.json).child(
            "security_groups",
            props.source,
            "name"
          ).data
        )
          .replace(
            // replace top level vpc with new name
            new RegexButWithWords()
              .literal(`"vpc": "`)
              .negatedSet('"')
              .oneOrMore()
              .literal('"')
              .done("s"),
            `"vpc": "${props.destinationVpc}"`
          )
          .replace(
            // replace top level acl name with new name
            new RegexButWithWords()
              .literal(`"name": "${props.source}"`)
              .done("g"),
            `"name": "${props.source}-copy"`
          )
          .replace(
            // replace all other references to vpc and sg name with empty space
            new RegexButWithWords()
              .group(exp =>
                exp
                  .group(exp =>
                    exp
                      .group(exp => exp.literal(`"sg": "${props.source}"`))
                      .or()
                      .group(exp =>
                        exp
                          .literal('"vpc": "')
                          .negativeLook.ahead(props.destinationVpc)
                          .negatedSet('"')
                          .oneOrMore()
                          .literal('"')
                      )
                  )
                  .literal(",")
                  .whitespace()
                  .oneOrMore()
              )
              .done("g"),
            ""
          )
          .replace(
            new RegexButWithWords()
              .literal(",")
              .negatedSet('"')
              .oneOrMore()
              .literal('"sg": "')
              .negatedSet('"')
              .oneOrMore()
              .literal('"')
              .done("g"),
            ""
          )}
      />
    </>
  );
};

CopySgModalContent.propTypes = {
  source: PropTypes.string.isRequired,
  destinationVpc: PropTypes.string.isRequired,
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.arrayOf(PropTypes.shape({})).isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default CopySgModalContent;
