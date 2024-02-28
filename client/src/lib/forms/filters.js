const { contains, isEmpty } = require("lazy-z");

/**
 * Filters docs obj to render defaults for specific template only.
 * If no template specified, return all docs for field
 * @param {string} template template name
 * @param {string} field field name
 * @param {Object} docs json docs object
 * @returns {Object} filtered doc
 */
function filterDocs(template, field, docs) {
  let doc = docs[field];
  let noDefaults = false;
  if (!template) {
    return doc;
  }
  let tableHeader = [];
  doc.content.forEach((section) => {
    if (section.templates && section.table) {
      let defaultsForTemplate = section.templates[template];
      if (!defaultsForTemplate || isEmpty(defaultsForTemplate)) {
        // template has no defaults, make defaults table empty [[]]
        section.table = [[]];
        noDefaults = true;
        return;
      }
      tableHeader = section.table[0];
      section.table = section.table.filter(
        (
          defaultResource // Removes all defaults in table not in that template
        ) => contains(defaultsForTemplate, defaultResource[0])
      );
      section.table = [tableHeader, ...section.table]; // Insert headers back into table
    }
  });
  if (noDefaults) {
    // removes 'The default configuration includes:' if no defaults
    doc.content = doc.content.filter((obj) => obj.text !== "_default_includes");
  }
  return doc;
}

module.exports = { filterDocs };
