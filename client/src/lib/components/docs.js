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

module.exports = {
  docTextFieldParams,
};
