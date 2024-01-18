/**
 * build heading props
 * @param {*} group
 * @returns {object} props object from group
 */
function dynamicHeadingProps(group) {
  return {
    name: group.heading.name,
    type: group.heading.type,
    tooltip: group.heading.tooltip,
    key: "heading-" + group.heading.name,
  };
}

module.exports = { dynamicHeadingProps };
