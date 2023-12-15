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
  let allNextGroupsHidden = false;
  // prevent marginBottomSmall from being rendered on second to last
  // form group if no fields in the next form group are shown
  if (!isLast) {
    allNextGroupsHidden = true;
    // check each next group to see if all items in that group are hidden
    // set to false if any of the next are not hidden
    for (let i = index + 1; i < componentProps.form.groups.length; i++) {
      if (allNextGroupsHidden)
        allNextGroupsHidden = allGroupItemsHidden(
          componentProps.form.groups[i],
          stateData,
          componentProps
        );
    }
  }
  return {
    key: `${componentProps.data?.name || ""}-group-${index}`,
    noMarginBottom:
      allNextGroupsHidden ||
      (isLast &&
        (!componentProps.form.subForms ||
          componentProps.form.subForms.length === 0)),
  };
}

/**
 * check if all items in a line are hidden
 * @param {*} group
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if all are hidden
 */
function allGroupItemsHidden(group, stateData, componentProps) {
  let areAllHidden = true;
  eachKey(group, (key) => {
    if (
      key !== "hideWhen" &&
      (!group[key].hideWhen || !group[key].hideWhen(stateData, componentProps))
    ) {
      areAllHidden = false;
    }
  });
  return areAllHidden;
}

module.exports = {
  dynamicIcseFormGroupsProps,
  allGroupItemsHidden,
};
