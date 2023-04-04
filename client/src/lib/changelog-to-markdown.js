/**
 * convert changelog to markdown
 * @param {Array<object>} changelogJson changelog json
 * @returns {string} markdown file
 */
function changelogToMarkdown(changelogJson) {
  let mdString = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n`;
  changelogJson.forEach(entry => {
    mdString += `\n## ${entry.version}`;
    mdString += `\n\n### Features\n`;
    entry.features.forEach(feature => {
      mdString += "\n- " + feature;
    });
    if (entry.fixes) {
      mdString += `\n\n### Fixes\n`;
      entry.fixes.forEach(fix => {
        mdString += "\n- " + fix;
      });
    }
    mdString += "\n";
  });
  return mdString;
}

module.exports = changelogToMarkdown;
