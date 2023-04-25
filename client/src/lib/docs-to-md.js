const { matchLength, eachKey, titleCase } = require("lazy-z");
const { docs } = require("./docs");

/**
 * get longest entry from col index
 * @param {Array} arr
 * @param {number} index
 * @returns {number} longest item in array
 */
function getLongestFromCol(arr, index) {
  let longest = 0;
  arr.forEach(item => {
    if (item[index].length > longest) longest = item[index].length;
  });
  return longest;
}

/**
 * get doc from object
 * @param {JSON} docsJson
 * @param {Array} docsJson.content
 * @param {Array} docsJson.relatedLinks
 * @returns {string} stringified data as json
 */
function docsToMd(docsJson) {
  let doc = "\n";
  docsJson.content.forEach(item => {
    if (item.text) {
      // add text and double newline
      doc +=
        (item.text === "_default_includes"
          ? "The default configuration includes:" // default includes text
          : item.text) + "\n\n";
    } else if (item.table) {
      // remove headers from md table
      if (item.table[0][0] === "_headers") {
        item.table[0].shift();
      }
      // list of longest value for each column
      let allLongest = [];
      // for each column, get the longest
      for (let i = 0; i < item.table[0].length; i++) {
        allLongest.push(getLongestFromCol(item.table, i));
      }
      // for each row
      for (let row = 0; row < item.table.length; row++) {
        // for each column
        for (let col = 0; col < item.table[row].length; col++) {
          let isNotLast = col + 1 !== item.table[row].length;
          // add string to docs
          doc += isNotLast // if not last match length with spaces add pipe
            ? matchLength(item.table[row][col], allLongest[col]) + " | "
            : allLongest.length === 1 && row !== 0 // if is just a list and not first row
            ? `- \`${item.table[row][col]}\`` // add list item
            : item.table[row][col]; // otherwise add text directly when last to prevent extra whitespace
        }
        doc += "\n"; // add newline
        // add row to divide headers from content when not a list
        if (row === 0 && allLongest.length !== 1) {
          let tableHeadDivider = []; // list of strings to add
          // while not all columns are added
          while (tableHeadDivider.length < allLongest.length) {
            tableHeadDivider.push(
              // return a string that is match length + 1 replacing all spaces with -
              matchLength(
                "",
                allLongest[tableHeadDivider.length] +
                  (tableHeadDivider.length === 0 ? 1 : 2) // space correctly with pipe
              ).replace(/\s/g, "-") + // add pipe if not last, otherwise add newline
                (tableHeadDivider.length + 1 !== allLongest.length ? "|" : "\n")
            );
          }
          // join and add to doc
          doc += tableHeadDivider.join("");
        }
      }
      doc += "\n";
    } else {
      doc += `### ${item.subHeading}\n\n`;
    }
  });
  doc += "### Related Links\n\n";
  docsJson.relatedLinks.forEach(link => {
    let title = link.length === 1 ? "Docs" : link[1];
    doc += `- [${title}](${link[0]})\n`;
  });
  return doc;
}

function allDocs() {
  let doc = "";
  eachKey(docs, heading => {
    // remove when adding docs
    if (heading !== "routing_tables") {
      let header =
        heading === "object_storage"
          ? "Cloud Object Storage"
          : heading === "vpcs"
          ? "VPCs"
          : heading === "acls"
          ? "Network Access Control Lists"
          : heading === "vsi"
          ? "Virtual Server Instance Deployments"
          : heading === "appid"
          ? "App ID"
          : heading === "teleport"
          ? "Teleport Bastion Host"
          : heading === "f5"
          ? "F5 Big IP"
          : heading === "atracker"
          ? "Activity Tracker"
          : titleCase(heading)
              .replace(/Ssh/g, "SSH") // capitalize these
              .replace("Vpn", "VPN")
              .replace("Iam", "IAM");
      doc += `\n## ${header}\n`;
      doc += docsToMd(docs[heading]);
      doc += "\n-----\n"; // add divider
    }
  });
  return doc;
}

module.exports = {
  docsToMd,
  allDocs
};
