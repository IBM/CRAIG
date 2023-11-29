/**
 * create dynamic props for form group
 * @param {*} componentProps
 * @param {number} index form index
 * @returns {object} props object
 */
function dynamicIcseFormGroupsProps(componentProps, index) {
  return {
    key: `${componentProps.data?.name || ""}-group-${index}`,
    noMarginBottom:
      index === componentProps.form.groups.length - 1 &&
      (!componentProps.form.subForms ||
        componentProps.form.subForms.length === 0),
  };
}

module.exports = {
  dynamicIcseFormGroupsProps,
};
