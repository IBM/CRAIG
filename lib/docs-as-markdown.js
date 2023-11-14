const { allDocs } = require("../client/src/lib/docs-to-md");
const fs = require("fs");
if (process.argv[2]) {
  fs.writeFileSync(process.argv[2], allDocs());
} else {
  console.error(
    "No file path provided. A file path is required to generate markdown. \n\n $ npm run md <file path>\n"
  );
}
