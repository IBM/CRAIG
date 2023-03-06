const fs = require("fs");
const { eachKey } = require("lazy-z");
const {
  configToFilesJson,
} = require("../client/src/lib/json-to-iac/config-to-files-json");
let actualData = configToFilesJson(
  JSON.parse(fs.readFileSync(process.argv[2]))
);
eachKey(actualData, (key) => {
  if (actualData[key] !== null)
    fs.writeFileSync("./tf-test/" + key, actualData[key]);
});
