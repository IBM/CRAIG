import React from "react";
import { RegexButWithWords } from "regex-but-with-words";
import { prettyJSON, revision } from "lazy-z";
import { CraigCodeMirror } from "../../page-template/CodeMirror";
import PropTypes from "prop-types";

const CopyAclModalContent = props => {
  return (
    <>
      <p className="marginBottomSmall">
        Copy ACL <strong>{props.sourceAcl}</strong> to VPC{" "}
        <strong>{props.destinationVpc}</strong>?
      </p>
      <CraigCodeMirror
        className="regular"
        code={prettyJSON(
          new revision(props.craig.store.json)
            .child("vpcs", props.data.name, "name")
            .child("acls", props.sourceAcl, "name").data
        )
          .replace(
            // replace top level vpc with new name
            new RegexButWithWords()
              .literal(`"vpc": "${props.data.name}"`)
              .done("s"),
            `"vpc": "${props.destinationVpc}"`
          )
          .replace(
            // replace top level acl name with new name
            new RegexButWithWords()
              .literal(`"name": "${props.sourceAcl}"`)
              .done("s"),
            `"name": "${props.sourceAcl}-copy"`
          )
          .replace(
            // replace all other references to vpc and acl name with empty space
            new RegexButWithWords()
              .group(exp =>
                exp
                  .group(exp =>
                    exp
                      .group(exp => exp.literal(`"vpc": "${props.data.name}"`))
                      .or()
                      .group(exp => exp.literal(`"name": "${props.sourceAcl}"`))
                  )
                  .literal(",")
                  .whitespace()
                  .oneOrMore()
              )
              .or()
              .group(exp =>
                exp
                  .literal(",")
                  .whitespace()
                  .anyNumber()
                  .group(exp =>
                    exp
                      .group(exp => exp.literal(`"vpc": "${props.data.name}"`))
                      .or()
                      .group(exp => exp.literal(`"acl": "${props.sourceAcl}"`))
                  )
              )
              .done("g"),
            ""
          )}
      />
    </>
  );
};

CopyAclModalContent.propTypes = {
  sourceAcl: PropTypes.string.isRequired,
  destinationVpc: PropTypes.string.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  craig: PropTypes.shape({
    store: PropTypes.shape({
      json: PropTypes.shape({
        vpcs: PropTypes.arrayOf(PropTypes.shape({})).isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default CopyAclModalContent;
