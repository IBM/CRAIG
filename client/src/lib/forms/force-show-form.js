const { disableSave } = require("./disable-save");
/**
 * show non toggle array form
 * depending on the submission field name the code looks determines if the form should be open based on the data passed by componentProps
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if should show
 */
function forceShowForm(stateData, componentProps) {
  return disableSave(
    componentProps.submissionFieldName,
    componentProps.innerFormProps.data,
    componentProps.innerFormProps
  );
}

module.exports = {
  forceShowForm
};
