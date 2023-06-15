const fs = require("fs");
const { configToFilesJson } = require("../client/src/lib");
const { eachKey, contains } = require("lazy-z");

try {
  // try to get and parse json data
  let data = configToFilesJson(JSON.parse(fs.readFileSync(process.argv[2])));
  let now = Date.now(); // now
  let dir = "craig-" + now; // file name
  fs.mkdirSync(dir); // make directory

  // for each craig file
  eachKey(data, (key) => {
    let nextPath = dir + "/" + key;
    if (contains(key, ".") && data[key]) {
      // if is a file, has a . in pathname, and is not null create file
      fs.writeFileSync(nextPath, data[key]);
    } else if (data[key]) {
      // otherwise if is not null, make module path and then create all files
      fs.mkdirSync(nextPath);
      eachKey(data[key], (moduleKey) => {
        fs.writeFileSync(`${nextPath}/${moduleKey}`, data[key][moduleKey]);
      });
    }
  });
} catch (err) {
  console.error(err);
}
