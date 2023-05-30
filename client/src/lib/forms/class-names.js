/**
 * get classname for nac item
 * @param {*} window js window object
 * @param {string} path
 * @param {boolean=} expanded
 * @param {boolean=} invalid
 * @param {boolean=} isHovering
 * @returns {string} composed class name
 */
function leftNavItemClassName(window, path, expanded, invalid, isHovering) {
  let className = "";
  // if our current page is what is in the navbar
  if (window.location.pathname === path) {
    className += invalid
      ? "invalid-form-left-nav whiteFill "
      : expanded
      ? "blueTileExpanded whiteFill "
      : "blueTileRail whiteFill ";
  } else if (invalid) {
    className += "invalid-form-left-nav ";
    if (!isHovering) {
      className += "whiteFill ";
    }
  }
  // if navbar expanded
  className += expanded ? "expanded " : "rail ";
  return className;
}

module.exports = {
  leftNavItemClassName,
};
