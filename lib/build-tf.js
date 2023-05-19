const fs = require("fs");
const { eachKey, contains } = require("lazy-z");
const {
  configToFilesJson,
} = require("../client/src/lib/json-to-iac/config-to-files-json");
let actualData = configToFilesJson(
  JSON.parse(fs.readFileSync(process.argv[2]))
);
eachKey(actualData, (key) => {
  if (actualData[key] !== null && contains(key, ".")) {
    fs.writeFileSync("./tf-test/" + key, actualData[key]);
  } else if (actualData[key] !== null) {
    if (!fs.existsSync("./tf-test/" + key)) fs.mkdirSync("./tf-test/" + key);
    eachKey(actualData[key], (subKey) => {
      fs.writeFileSync(
        "./tf-test/" + key + "/" + subKey,
        actualData[key][subKey]
      );
    });
  }
});
