const { kebabCase } = require("lazy-z");
const { invalidNewResourceName } = require("./invalid-callbacks");
const {
  genericNameCallback,
  duplicateNameCallback,
} = require("../state/reusable-fields");

/**
 * create text if project name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {string} invalid text string
 */
function invalidProjectNameText(stateData, componentProps) {
  let name = stateData.name;
  let invalidText = "";

  if (invalidNewResourceName(name)) {
    invalidText = genericNameCallback();
  } else {
    // check if dupe
    let kname = kebabCase(name);
    let isNew = componentProps.data?.last_save === undefined;
    let existingProject = componentProps.projects[kname];

    if (
      isNew &&
      existingProject &&
      existingProject.last_save !== stateData.last_save
    ) {
      invalidText = duplicateNameCallback(name);
    }
  }

  return invalidText;
}

module.exports = {
  genericNameCallback,
  duplicateNameCallback,
  invalidProjectNameText,
};
