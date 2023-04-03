const { azsort, keys, prettyJSON } = require("lazy-z");

/**
 * format config json
 * @returns {Object} config json
 */
function formatConfig(json, isCopy) {
  let newOverrideJson = {};
  // sort fields from a-z to match override.json in landing zone
  keys(json)
    .sort(azsort)
    .forEach((key) => {
      newOverrideJson[key] = json[key];
    });
  if (isCopy)
    // stringify json on copy with escaped quotation marks to allow for string parsing from tf without schematics deciding it's an object
    return JSON.stringify(newOverrideJson);
  else return prettyJSON(newOverrideJson);
}

module.exports = {
  formatConfig,
};
