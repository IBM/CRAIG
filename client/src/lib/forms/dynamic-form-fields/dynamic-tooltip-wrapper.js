const { kebabCase, titleCase } = require("lazy-z");

/**
 * dynamic tooltip wrapper props for dynamic form
 * @param {*} componentProps component props object
 * @param {string} key name of the key
 * @param {number} keyIndex index within groups
 * @param {object} field craig field object
 * @returns {object} props object
 */
function dynamicToolTipWrapperProps(componentProps, key, keyIndex, field) {
  let propsName = componentProps.data?.name || "";
  return {
    isModal: componentProps.isModal,
    id: kebabCase(`${propsName} input ${key} ${keyIndex} tooltip`),
    tooltip: field.tooltip,
    key: `${propsName} input ${key} ${keyIndex}`,
    labelText: field.labelText ? field.labelText : titleCase(key),
  };
}

module.exports = {
  dynamicToolTipWrapperProps,
};
