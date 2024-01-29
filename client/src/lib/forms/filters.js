const { distinct, contains, isEmpty } = require("lazy-z");

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

/*
 * filter vpcs with connections to extant tgws
 * @param {*} craig
 * @returns {Array<string>} list of vpcs not currently
 */
function tgwVpcFilter(craig) {
  let unconnectedVpcs = [];
  let allTgwVpcs = [];
  craig.store.json.transit_gateways.forEach((tgw) => {
    let connectionVpcs = [];
    tgw.connections.forEach((connection) => {
      if (connection.vpc) {
        // not using splat to avoid picking up `null` for crn connections
        connectionVpcs.push(connection.vpc);
      }
    });
    allTgwVpcs = distinct(allTgwVpcs.concat(connectionVpcs));
  });
  craig.store.vpcList.forEach((vpc) => {
    if (!contains(allTgwVpcs, vpc)) unconnectedVpcs.push(vpc);
  });
  return unconnectedVpcs;
}

module.exports = { filterDocs, tgwVpcFilter };
