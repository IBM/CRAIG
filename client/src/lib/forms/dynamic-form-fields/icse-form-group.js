const { eachKey } = require("lazy-z");

/**
 * create dynamic props for form group
 * @param {*} componentProps
 * @param {number} index form index
 * @param {*} stateData
 * @returns {object} props object
 */
function dynamicIcseFormGroupsProps(componentProps, index, stateData) {
  let isLast = index === componentProps.form.groups.length - 1;
  let lastGroupIsHidden = false;
  // prevent marginBottomSmall from being rendered on second to last
  // form group if no fields in the next form group are shown
  if (!isLast && index + 1 === componentProps.form.groups.length - 1) {
    lastGroupIsHidden = allGroupItemsHidden(
      componentProps.form.groups[index + 1],
      stateData
    );
  }
  return {
    key: `${componentProps.data?.name || ""}-group-${index}`,
    noMarginBottom:
      lastGroupIsHidden ||
      (isLast &&
        (!componentProps.form.subForms ||
          componentProps.form.subForms.length === 0)),
  };
}

/**
 * check if all items in a line are hidden
 * @param {*} group
 * @param {*} stateData
 * @returns {boolean} true if all are hidden
 */
function allGroupItemsHidden(group, stateData) {
  let areAllHidden = true;
  eachKey(group, (key) => {
    if (!group[key].hideWhen || !group[key].hideWhen(stateData)) {
      areAllHidden = false;
    }
  });
  return areAllHidden;
}

module.exports = {
  dynamicIcseFormGroupsProps,
  allGroupItemsHidden,
};
