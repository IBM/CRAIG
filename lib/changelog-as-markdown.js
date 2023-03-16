const releaseNotes = require("../client/src/docs/release-notes.json");
const changelogToMarkdown = require("../client/src/lib/changelog-to-markdown");
const fs = require("fs");

try {
  fs.writeFileSync("CHANGELOG.md", changelogToMarkdown(releaseNotes));
} catch (err) {
  console.error(err);
}
