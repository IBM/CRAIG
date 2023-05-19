const { azsort, keys, prettyJSON, revision } = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");

/**
 * format config json
 * @returns {Object} config json
 */
function formatConfig(json, isCopy) {
  let newOverrideJson = {};
  // sort fields from a-z to match override.json in landing zone
  keys(json)
    .sort(azsort)
    .forEach(key => {
      newOverrideJson[key] = json[key];
    });
  if (isCopy)
    // stringify json on copy with escaped quotation marks to allow for string parsing from tf without schematics deciding it's an object
    return JSON.stringify(newOverrideJson);
  else return prettyJSON(newOverrideJson);
}

/**
 * create code mirror data for copy rule form
 * @param {*} stateData
 * @param {string} stateData.ruleSource
 * @param {string} stateData.ruleCopyName
 * @param {*} componentProps
 * @param {boolean} componentProps.isAclForm
 * @param {lazyZstate} componentProps.craig
 * @param {*} componentProps.data
 * @param {string} componentProps.data.name acl name
 * @returns {string} code mirror display data
 */
function copyRuleCodeMirrorData(stateData, componentProps) {
  let jsonData = componentProps.isAclForm
    ? new revision(componentProps.craig.store.json)
        .child("vpcs", componentProps.data.name, "name")
        .child("acls", stateData.ruleSource, "name")
        .child("rules", stateData.ruleCopyName, "name").data
    : new revision(componentProps.craig.store.json)
        .child("security_groups", stateData.ruleSource, "name")
        .child("rules", stateData.ruleCopyName).data;
  return prettyJSON(jsonData)
    .replace(
      new RegexButWithWords()
        .literal('"')
        .group(exp => {
          exp
            .literal("vpc")
            .or()
            .literal("acl")
            .or()
            .literal("sg");
        })
        .literal('"')
        .negatedSet(",\n")
        .oneOrMore()
        .group(exp => {
          exp
            .literal(",")
            .whitespace()
            .oneOrMore();
        })
        .lazy()
        .done("g"),
      ""
    )
    .replace(
      new RegexButWithWords()
        .literal(",")
        .negatedSet(exp => {
          exp.word().literal('"');
        })
        .oneOrMore()
        .look.ahead(exp => {
          exp.literal("\n}").stringEnd();
        })
        .done("g"),
      ""
    );
}

/**
 * get string content for copy acl modal
 * @param {*} props
 * @param {lazyZstate} props.craig
 * @param {*} props.craig.store
 * @param {Object} props.craig.store.json
 * @param {Object} props.data
 * @param {string} props.data.name vpc name
 * @param {string} props.sourceAcl
 * @param {string} props.destinationVpc
 */
function copyAclModalContent(props) {
  return prettyJSON(
    new revision(props.craig.store.json)
      .child("vpcs", props.data.name, "name")
      .child("acls", props.sourceAcl, "name").data
  )
    .replace(
      // replace top level vpc with new name
      new RegexButWithWords().literal(`"vpc": "${props.data.name}"`).done("s"),
      `"vpc": "${props.destinationVpc}"`
    )
    .replace(
      // replace top level acl name with new name
      new RegexButWithWords().literal(`"name": "${props.sourceAcl}"`).done("s"),
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
    );
}

/**
 * get string content for copy acl modal
 * @param {*} props
 * @param {lazyZstate} props.craig
 * @param {*} props.craig.store
 * @param {Object} props.craig.store.json
 * @param {string} props.source
 * @param {string} props.destinationVpc
 */
function copySgModalContent(props) {
  return prettyJSON(
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
      new RegexButWithWords().literal(`"name": "${props.source}"`).done("g"),
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
    );
}

module.exports = {
  formatConfig,
  copyRuleCodeMirrorData,
  copyAclModalContent,
  copySgModalContent
};
