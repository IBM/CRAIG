/**
 * get form name
 * @param {*} props
 * @returns {Function} get form name based on field and props
 */
function copyRuleFormName(props) {
  /**
   * get form name for icse props
   * @param {string} field name of field
   * @returns {string} form name string
   */
  return function getFormName(field) {
    return `copy-rule-${props.isSecurityGroup ? "sg" : "acl"}-${field}${
      props.isSecurityGroup ? "" : "-" + props.data.name
    }`;
  };
}

module.exports = {
  copyRuleFormName,
};
