const { eachKey, isNullOrEmptyString } = require("lazy-z");
const docs = require("./docs/docs.json");

/**
 * get all text for a given field
 * @param {*} fieldName
 * @returns {string} text
 */
function allDocText(fieldName) {
  let fieldData = docs[fieldName];
  let allText = "";
  if (fieldData)
    fieldData.content.forEach((item) => {
      eachKey(item, (key) => {
        if (key === "text" && item[key] !== "_default_includes") {
          allText += item[key] + " ";
        } else if (key === "table") {
          item[key].forEach((row) => {
            row.forEach((col) => {
              if (!isNullOrEmptyString(col) && col !== "_headers") {
                allText += col + " ";
              }
            });
          });
        }
      });
    });
  return allText;
}

module.exports = {
  allDocText,
};
