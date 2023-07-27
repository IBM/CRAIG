const { titleCase } = require("lazy-z");

/**
 * convert changelog to markdown
 * @param {Array<object>} changelogJson changelog json
 * @returns {string} markdown file
 */
function changelogToMarkdown(changelogJson) {
  let mdString = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n`;

  changelogJson.forEach((entry) => {
    mdString += `\n## ${entry.version}`;
    ["upgrade_notes", "features", "fixes"].forEach((field) => {
      if (entry[field]) {
        mdString += `\n\n### ${titleCase(field)}\n`;
        entry[field].forEach((item) => {
          mdString += "\n- " + item;
        });
      }
    });

    mdString += "\n";
  });

  return mdString;
}

module.exports = changelogToMarkdown;
